package com.zaritalk.checklist.service;

import com.zaritalk.checklist.dto.MolitApiResponseDto;
import com.zaritalk.checklist.dto.MolitTradeItemDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.OptionalDouble;
import java.util.TreeSet;

@Slf4j
@Service
public class MolitApiService {

    @Value("${molit.api-key:}")
    private String apiKey;

    private final RestTemplate restTemplate;

    private static final String APT_URL   = "https://apis.data.go.kr/1613000/RTMSDataSvcAptTrade/getRTMSDataSvcAptTrade";
    private static final String VILLA_URL = "https://apis.data.go.kr/1613000/RTMSDataSvcRHTrade/getRTMSDataSvcRHTrade";

    public MolitApiService() {
        RestTemplate rt = new RestTemplate();
        rt.getMessageConverters().removeIf(c -> c instanceof MappingJackson2HttpMessageConverter);
        rt.getMessageConverters().add(new MappingJackson2HttpMessageConverter());
        this.restTemplate = rt;
    }

    public record TransactionResult(double avgPrice, int count) {}

    public TransactionResult fetchRecentAvg(String sigunguCode, String dongName, String housingType, double area, String aptName) {
        String baseUrl = "villa".equals(housingType) ? VILLA_URL : APT_URL;
        List<MolitTradeItemDto> allItems = new ArrayList<>();

        for (int i = 0; i < 3; i++) {
            String ym = LocalDate.now().minusMonths(i).format(DateTimeFormatter.ofPattern("yyyyMM"));
            try {
                String url = buildUrl(baseUrl, sigunguCode, ym);
                MolitApiResponseDto res = restTemplate.getForObject(url, MolitApiResponseDto.class);
                allItems.addAll(resolveItems(res));
            } catch (Exception e) {
                log.warn("MOLIT 실거래가 조회 실패 [sigunguCode={}, ym={}]: {}", sigunguCode, ym, e.getMessage());
            }
        }

        List<Long> prices = extractPricesFromItems(allItems, dongName, aptName, area, true);
        if (prices.isEmpty()) {
            prices = extractPricesFromItems(allItems, dongName, "", area, false);
        }

        if (prices.isEmpty()) return null;
        OptionalDouble avg = prices.stream().mapToLong(Long::longValue).average();
        return avg.isPresent() ? new TransactionResult(avg.getAsDouble(), prices.size()) : null;
    }

    public List<Double> fetchAvailableAreas(String sigunguCode, String dongName, String housingType, String aptName) {
        log.info("전용면적 조회 시작 [sigunguCode={}, dongName={}, housingType={}, aptName={}]", sigunguCode, dongName, housingType, aptName);
        String baseUrl = "villa".equals(housingType) ? VILLA_URL : APT_URL;
        List<MolitTradeItemDto> allItems = new ArrayList<>();

        for (int i = 0; i < 3; i++) {
            String ym = LocalDate.now().minusMonths(i).format(DateTimeFormatter.ofPattern("yyyyMM"));
            try {
                String url = buildUrl(baseUrl, sigunguCode, ym);
                MolitApiResponseDto res = restTemplate.getForObject(url, MolitApiResponseDto.class);
                allItems.addAll(resolveItems(res));
            } catch (Exception e) {
                log.warn("MOLIT 전용면적 조회 실패 [sigunguCode={}, ym={}]: {}", sigunguCode, ym, e.getMessage());
            }
        }

        List<Double> byApt = extractAreaValuesFromItems(allItems, dongName, aptName, true);
        if (!byApt.isEmpty()) {
            log.info("건물명 매칭 완료 [aptName={}, count={}]", aptName, byApt.size());
            return new ArrayList<>(new TreeSet<>(byApt));
        }

        List<Double> byDong = extractAreaValuesFromItems(allItems, dongName, "", false);
        log.info("동 필터 fallback [dongName={}, count={}]", dongName, byDong.size());
        TreeSet<Double> result = new TreeSet<>(byDong);
        log.info("전용면적 조회 완료 [총 {}건]: {}", result.size(), result);
        return new ArrayList<>(result);
    }

    private String buildUrl(String baseUrl, String sigunguCode, String ym) {
        return baseUrl
                + "?serviceKey=" + apiKey
                + "&LAWD_CD=" + sigunguCode
                + "&DEAL_YMD=" + ym
                + "&numOfRows=100"
                + "&_type=json";
    }

    private List<Double> extractAreaValuesFromItems(List<MolitTradeItemDto> items, String dongName, String aptName, boolean useAptFilter) {
        List<Double> result = new ArrayList<>();
        for (MolitTradeItemDto row : items) {
            String dong    = nullSafe(row.umdNm());
            String aptNm   = nullSafe(row.aptNm());
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

    private List<Long> extractPricesFromItems(List<MolitTradeItemDto> items, String dongName, String aptName, double area, boolean useAptFilter) {
        List<Long> prices = new ArrayList<>();
        for (MolitTradeItemDto row : items) {
            String dong     = nullSafe(row.umdNm());
            String aptNm    = nullSafe(row.aptNm());
            String areaStr  = nullSafe(row.excluUseAr());
            String priceStr = nullSafe(row.dealAmount()).replaceAll("[^0-9]", "");
            if (areaStr.isEmpty() || priceStr.isEmpty()) continue;
            if (!matchesDong(dong, dongName)) continue;
            if (useAptFilter && !aptName.isBlank() && !matchesApt(aptNm, aptName)) continue;
            double rowArea = Double.parseDouble(areaStr);
            if (Math.abs(rowArea - area) <= 5) {
                long price = Long.parseLong(priceStr) * 10_000L;
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
        return a.contains(b) || b.contains(a);
    }

    private String normalize(String s) {
        return s.replaceAll("아파트|빌라|연립|오피스텔|\\s", "").toLowerCase();
    }

    private List<MolitTradeItemDto> resolveItems(MolitApiResponseDto res) {
        try {
            List<MolitTradeItemDto> items = res.response().body().items().item();
            return items != null ? items : List.of();
        } catch (NullPointerException e) {
            log.warn("MOLIT 응답 구조 파싱 실패: {}", e.getMessage());
            return List.of();
        }
    }

    private String nullSafe(String value) {
        return (value == null || value.equals("null")) ? "" : value.trim();
    }
}
