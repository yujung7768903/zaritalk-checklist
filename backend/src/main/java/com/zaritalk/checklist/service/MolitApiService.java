package com.zaritalk.checklist.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.OptionalDouble;

@Service
public class MolitApiService {

    @Value("${molit.api-key:}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    private static final String APT_URL   = "http://openapi.molit.go.kr:8081/OpenAPI_ToolInstallPackage/service/rest/RTMSOBJSvc/getRTMSDataSvcAptTrade";
    private static final String VILLA_URL = "http://openapi.molit.go.kr:8081/OpenAPI_ToolInstallPackage/service/rest/RTMSOBJSvc/getRTMSDataSvcRHTrade";

    public record TransactionResult(double avgPrice, int count) {}

    public TransactionResult fetchRecentAvg(String sigunguCode, String bname, String housingType, double area) {
        if (apiKey == null || apiKey.isBlank()) return null;

        String baseUrl = "villa".equals(housingType) ? VILLA_URL : APT_URL;
        List<Long> prices = new ArrayList<>();

        for (int i = 0; i < 3; i++) {
            String ym = LocalDate.now().minusMonths(i).format(DateTimeFormatter.ofPattern("yyyyMM"));
            try {
                String url = UriComponentsBuilder.fromHttpUrl(baseUrl)
                        .queryParam("serviceKey", apiKey)
                        .queryParam("LAWD_CD", sigunguCode)
                        .queryParam("DEAL_YMD", ym)
                        .queryParam("numOfRows", 100)
                        .queryParam("_type", "json")
                        .toUriString();

                @SuppressWarnings("unchecked")
                Map<String, Object> res = restTemplate.getForObject(url, Map.class);
                prices.addAll(extractPrices(res, bname, area));
            } catch (Exception ignored) {}
        }

        if (prices.isEmpty()) return null;
        OptionalDouble avg = prices.stream().mapToLong(Long::longValue).average();
        return avg.isPresent() ? new TransactionResult(avg.getAsDouble(), prices.size()) : null;
    }

    @SuppressWarnings("unchecked")
    private List<Long> extractPrices(Map<String, Object> res, String bname, double area) {
        List<Long> prices = new ArrayList<>();
        try {
            Map<String, Object> response = (Map<String, Object>) res.get("response");
            Map<String, Object> body     = (Map<String, Object>) response.get("body");
            Map<String, Object> items    = (Map<String, Object>) body.get("items");
            Object item = items.get("item");

            List<Map<String, Object>> list = item instanceof List ? (List<Map<String, Object>>) item
                    : item instanceof Map ? List.of((Map<String, Object>) item)
                    : List.of();

            for (Map<String, Object> row : list) {
                String dong       = String.valueOf(row.getOrDefault("법정동", "")).trim();
                String areaStr    = String.valueOf(row.getOrDefault("전용면적", "0")).trim();
                String priceStr   = String.valueOf(row.getOrDefault("거래금액", "0")).replaceAll("[^0-9]", "");

                double rowArea = Double.parseDouble(areaStr);
                if (Math.abs(rowArea - area) <= 5 && (bname.isBlank() || dong.contains(bname.replace("동", "")))) {
                    long price = Long.parseLong(priceStr) * 10_000L;
                    if (price > 0) prices.add(price);
                }
            }
        } catch (Exception ignored) {}
        return prices;
    }
}
