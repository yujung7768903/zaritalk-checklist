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

    public TransactionResult fetchRecentAvg(String sigunguCode, String bname, String housingType, double area) {
        String baseUrl = "villa".equals(housingType) ? VILLA_URL : APT_URL;
        List<Long> prices = new ArrayList<>();

        for (int i = 0; i < 3; i++) {
            String ym = LocalDate.now().minusMonths(i).format(DateTimeFormatter.ofPattern("yyyyMM"));
            try {
                String url = buildUrl(baseUrl, sigunguCode, ym);
                MolitApiResponseDto res = restTemplate.getForObject(url, MolitApiResponseDto.class);
                prices.addAll(extractPrices(res, bname, area));
            } catch (Exception e) {
                log.warn("MOLIT 실거래가 조회 실패 [sigunguCode={}, ym={}]: {}", sigunguCode, ym, e.getMessage());
            }
        }

        if (prices.isEmpty()) return null;
        OptionalDouble avg = prices.stream().mapToLong(Long::longValue).average();
        return avg.isPresent() ? new TransactionResult(avg.getAsDouble(), prices.size()) : null;
    }

    public List<Double> fetchAvailableAreas(String sigunguCode, String bname, String housingType) {
        log.info("전용면적 조회 시작 [sigunguCode={}, bname={}, housingType={}]", sigunguCode, bname, housingType);
        String baseUrl = "villa".equals(housingType) ? VILLA_URL : APT_URL;
        TreeSet<Double> areas = new TreeSet<>();

        for (int i = 0; i < 3; i++) {
            String ym = LocalDate.now().minusMonths(i).format(DateTimeFormatter.ofPattern("yyyyMM"));
            try {
                String url = buildUrl(baseUrl, sigunguCode, ym);
                MolitApiResponseDto res = restTemplate.getForObject(url, MolitApiResponseDto.class);
                log.debug("MOLIT 응답 [ym={}]: {}", ym, res);
                List<Double> monthlyAreas = extractAreaValues(res, bname);
                log.info("전용면적 추출 [ym={}, count={}]: {}", ym, monthlyAreas.size(), monthlyAreas);
                areas.addAll(monthlyAreas);
            } catch (Exception e) {
                log.warn("MOLIT 전용면적 조회 실패 [sigunguCode={}, ym={}]: {}", sigunguCode, ym, e.getMessage());
            }
        }

        log.info("전용면적 조회 완료 [총 {}건]: {}", areas.size(), areas);
        return new ArrayList<>(areas);
    }

    private String buildUrl(String baseUrl, String sigunguCode, String ym) {
        return baseUrl
                + "?serviceKey=" + apiKey
                + "&LAWD_CD=" + sigunguCode
                + "&DEAL_YMD=" + ym
                + "&numOfRows=100"
                + "&_type=json";
    }

    private List<Double> extractAreaValues(MolitApiResponseDto res, String bname) {
        List<Double> result = new ArrayList<>();
        List<MolitTradeItemDto> items = resolveItems(res);
        for (MolitTradeItemDto row : items) {
            String dong    = nullSafe(row.umdNm());
            String areaStr = nullSafe(row.excluUseAr());
            if (areaStr.isEmpty()) continue;
            if (!bname.isBlank() && !dong.contains(bname.replace("동", ""))) continue;
            try {
                double area = Math.round(Double.parseDouble(areaStr) * 10.0) / 10.0;
                if (area > 0) result.add(area);
            } catch (NumberFormatException e) {
                log.debug("전용면적 파싱 실패 [value={}]: {}", areaStr, e.getMessage());
            }
        }
        return result;
    }

    private List<Long> extractPrices(MolitApiResponseDto res, String bname, double area) {
        List<Long> prices = new ArrayList<>();
        List<MolitTradeItemDto> items = resolveItems(res);
        for (MolitTradeItemDto row : items) {
            String dong     = nullSafe(row.umdNm());
            String areaStr  = nullSafe(row.excluUseAr());
            String priceStr = nullSafe(row.dealAmount()).replaceAll("[^0-9]", "");
            if (areaStr.isEmpty() || priceStr.isEmpty()) continue;
            double rowArea = Double.parseDouble(areaStr);
            if (Math.abs(rowArea - area) <= 5 && (bname.isBlank() || dong.contains(bname.replace("동", "")))) {
                long price = Long.parseLong(priceStr) * 10_000L;
                if (price > 0) prices.add(price);
            }
        }
        return prices;
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
