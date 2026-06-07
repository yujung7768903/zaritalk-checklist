package com.zaritalk.api.infrastructure.molit;

import com.zaritalk.api.infrastructure.molit.dto.MolitApiResponseDto;
import com.zaritalk.api.infrastructure.molit.dto.MolitTradeItemDto;
import com.zaritalk.core.port.MarketPricePort;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.OptionalDouble;
import java.util.TreeSet;

/**
 * 국토부 실거래가 API 클라이언트 (아파트/빌라 거래 데이터).
 * 전용면적 목록 조회 및 최근 3개월 실거래가 평균 조회를 제공한다.
 * data.go.kr 서비스키는 반드시 URL 인코딩해야 한다.
 */
@Slf4j
@Component
public class MolitApiClient {

    private static final String APT_URL   = "https://apis.data.go.kr/1613000/RTMSDataSvcAptTrade/getRTMSDataSvcAptTrade";
    private static final String VILLA_URL = "https://apis.data.go.kr/1613000/RTMSDataSvcRHTrade/getRTMSDataSvcRHTrade";
    private static final String HOUSING_TYPE_VILLA = "villa";
    private static final int    RECENT_MONTHS = 3;
    private static final double AREA_TOLERANCE = 5.0;
    private static final long   PRICE_UNIT = 10_000L;

    @Value("${molit.api-key:}")
    private String apiKey;

    private final RestTemplate restTemplate;

    public MolitApiClient() {
        RestTemplate rt = new RestTemplate();
        rt.getMessageConverters().removeIf(c -> c instanceof MappingJackson2HttpMessageConverter);
        rt.getMessageConverters().add(new MappingJackson2HttpMessageConverter());
        this.restTemplate = rt;
    }

    /**
     * 전용면적 목록을 조회한다.
     * 건물명 매칭 우선, 없으면 동 단위 fallback.
     *
     * @param sigunguCode 시군구코드 (5자리)
     * @param dongName    법정동명
     * @param housingType 주택 유형 ("apt" 또는 "villa")
     * @param aptName     건물명 (없으면 빈 문자열)
     * @return 전용면적 목록 (오름차순 정렬, 중복 제거); 없으면 빈 리스트
     */
    public List<Double> fetchAvailableAreas(String sigunguCode, String dongName, String housingType, String aptName) {
        log.info("전용면적 조회 시작 [sigunguCode={}, dongName={}, housingType={}, aptName={}]",
                sigunguCode, dongName, housingType, aptName);
        String baseUrl = selectBaseUrl(housingType);
        List<MolitTradeItemDto> allItems = collectRecentItems(baseUrl, sigunguCode);

        List<Double> byApt = extractAreaValues(allItems, dongName, aptName, true);
        if (!byApt.isEmpty()) {
            log.info("건물명 매칭 완료 [aptName={}, count={}]", aptName, byApt.size());
            return new ArrayList<>(new TreeSet<>(byApt));
        }

        List<Double> byDong = extractAreaValues(allItems, dongName, "", false);
        log.info("동 필터 fallback [dongName={}, count={}]", dongName, byDong.size());
        TreeSet<Double> result = new TreeSet<>(byDong);
        log.info("전용면적 조회 완료 [총 {}건]: {}", result.size(), result);
        return new ArrayList<>(result);
    }

    /**
     * 최근 3개월 실거래가 평균을 조회한다.
     * 건물명 매칭 우선, 없으면 동 단위 fallback.
     *
     * @param sigunguCode 시군구코드
     * @param dongName    법정동명
     * @param housingType 주택 유형
     * @param area        전용면적
     * @param aptName     건물명 (없으면 빈 문자열)
     * @return 평균가 및 건수; 데이터 없으면 OptionalDouble.empty()
     */
    public java.util.Optional<MarketPricePort.MarketPriceResult> fetchRecentAvg(
            String sigunguCode, String dongName, String housingType, double area, String aptName) {
        String baseUrl = selectBaseUrl(housingType);
        List<MolitTradeItemDto> allItems = collectRecentItems(baseUrl, sigunguCode);

        List<Long> prices = extractPrices(allItems, dongName, aptName, area, true);
        if (prices.isEmpty()) {
            prices = extractPrices(allItems, dongName, "", area, false);
        }

        if (prices.isEmpty()) return java.util.Optional.empty();
        OptionalDouble avg = prices.stream().mapToLong(Long::longValue).average();
        return avg.isPresent()
                ? java.util.Optional.of(new MarketPricePort.MarketPriceResult(avg.getAsDouble(), prices.size()))
                : java.util.Optional.empty();
    }

    private String selectBaseUrl(String housingType) {
        return HOUSING_TYPE_VILLA.equals(housingType) ? VILLA_URL : APT_URL;
    }

    private List<MolitTradeItemDto> collectRecentItems(String baseUrl, String sigunguCode) {
        List<MolitTradeItemDto> allItems = new ArrayList<>();
        for (int i = 0; i < RECENT_MONTHS; i++) {
            String ym = LocalDate.now().minusMonths(i).format(DateTimeFormatter.ofPattern("yyyyMM"));
            try {
                String url = buildUrl(baseUrl, sigunguCode, ym);
                MolitApiResponseDto res = restTemplate.getForObject(url, MolitApiResponseDto.class);
                allItems.addAll(resolveItems(res, sigunguCode, ym));
            } catch (Exception e) {
                log.warn("MOLIT 조회 실패 [sigunguCode={}, ym={}]: {}", sigunguCode, ym, e.getMessage());
            }
        }
        return allItems;
    }

    private String buildUrl(String baseUrl, String sigunguCode, String ym) {
        return baseUrl
                + "?serviceKey=" + URLEncoder.encode(apiKey, StandardCharsets.UTF_8)
                + "&LAWD_CD=" + sigunguCode
                + "&DEAL_YMD=" + ym
                + "&numOfRows=100"
                + "&_type=json";
    }

    private List<MolitTradeItemDto> resolveItems(MolitApiResponseDto res, String sigunguCode, String ym) {
        try {
            List<MolitTradeItemDto> items = res.response().body().items().item();
            return items != null ? items : List.of();
        } catch (NullPointerException e) {
            log.warn("MOLIT 응답 구조 파싱 실패 [sigunguCode={}, ym={}]: {}", sigunguCode, ym, e.getMessage());
            return List.of();
        }
    }

    private List<Double> extractAreaValues(List<MolitTradeItemDto> items, String dongName, String aptName, boolean useAptFilter) {
        List<Double> result = new ArrayList<>();
        for (MolitTradeItemDto row : items) {
            String dong    = nullSafe(row.umdNm());
            String aptNm   = getBuildingName(row);
            String areaStr = nullSafe(row.excluUseAr());
            if (areaStr.isEmpty()) continue;
            if (!matchesDong(dong, dongName)) continue;
            if (useAptFilter && !aptName.isBlank() && !matchesApt(aptNm, aptName)) continue;
            try {
                double area = Math.round(Double.parseDouble(areaStr) * 10.0) / 10.0;
                if (area > 0) result.add(area);
            } catch (NumberFormatException e) {
                log.debug("전용면적 파싱 실패 [value={}]: {}", areaStr, e.getMessage());
            }
        }
        return result;
    }

    private List<Long> extractPrices(List<MolitTradeItemDto> items, String dongName, String aptName, double area, boolean useAptFilter) {
        List<Long> prices = new ArrayList<>();
        for (MolitTradeItemDto row : items) {
            String dong     = nullSafe(row.umdNm());
            String aptNm    = getBuildingName(row);
            String areaStr  = nullSafe(row.excluUseAr());
            String priceStr = nullSafe(row.dealAmount()).replaceAll("[^0-9]", "");
            if (areaStr.isEmpty() || priceStr.isEmpty()) continue;
            if (!matchesDong(dong, dongName)) continue;
            if (useAptFilter && !aptName.isBlank() && !matchesApt(aptNm, aptName)) continue;
            double rowArea = Double.parseDouble(areaStr);
            if (Math.abs(rowArea - area) <= AREA_TOLERANCE) {
                long price = Long.parseLong(priceStr) * PRICE_UNIT;
                if (price > 0) prices.add(price);
            }
        }
        return prices;
    }

    private boolean matchesDong(String umdNm, String dongName) {
        if (dongName.isBlank()) return true;
        String target = dongName.endsWith("동") ? dongName : dongName + "동";
        return umdNm.equals(target);
    }

    private boolean matchesApt(String aptNm, String aptName) {
        String a = normalize(aptNm);
        String b = normalize(aptName);
        if (a.isEmpty() || b.isEmpty()) return false;
        return a.contains(b) || b.contains(a);
    }

    // 아파트는 aptNm, 연립다세대는 mhouseNm 사용
    private String getBuildingName(MolitTradeItemDto row) {
        String n = nullSafe(row.aptNm());
        return n.isEmpty() ? nullSafe(row.mhouseNm()) : n;
    }

    private String normalize(String s) {
        return s.replaceAll("아파트|빌라|연립|오피스텔|\\s", "").toLowerCase();
    }

    private String nullSafe(String value) {
        return (value == null || value.equals("null")) ? "" : value.trim();
    }
}
