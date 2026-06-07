package com.zaritalk.api.infrastructure.bldg;

import com.zaritalk.api.infrastructure.bldg.dto.BldgLedgerItemDto;
import com.zaritalk.api.infrastructure.bldg.dto.BldgLedgerResponseDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.TreeSet;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 국토부 건축물대장 전유부 API 클라이언트.
 * 거래 이력 없이 건물에 등록된 전용면적 목록을 조회한다.
 * data.go.kr 서비스키는 반드시 URL 인코딩해야 한다.
 */
@Slf4j
@Component
public class BldgLedgerClient {

    private static final String BASE_URL =
            "https://apis.data.go.kr/1613000/BldRgstHubService/getBrExposPubuseAreaInfo";
    private static final String EXCLUSIVE_USE_CODE = "1"; // 전유(실제 세대) — 2는 공용(계단실·복도 등)
    private static final Pattern BEONJI_PATTERN = Pattern.compile("(\\d+)(?:-(\\d+))?\\s*$");

    @Value("${building.api-key:}")
    private String apiKey;

    private final RestTemplate restTemplate;

    public BldgLedgerClient() {
        RestTemplate rt = new RestTemplate();
        rt.getMessageConverters().removeIf(c -> c instanceof MappingJackson2HttpMessageConverter);
        rt.getMessageConverters().add(new MappingJackson2HttpMessageConverter());
        this.restTemplate = rt;
    }

    /**
     * 법정동코드(bcode)와 지번주소로 전용면적 목록을 조회한다.
     *
     * @param bcode        법정동코드 10자리
     * @param jibunAddress 지번주소 전체 문자열
     * @return 전용면적 목록 (오름차순 정렬, 중복 제거); 실패 시 빈 리스트
     */
    public List<Double> fetchAreasByAddress(String bcode, String jibunAddress) {
        String sigunguCd = bcode.substring(0, 5);
        String bjdongCd  = bcode.substring(5);
        String[] beonji  = parseBeonji(jibunAddress);
        String bun = beonji[0];
        String ji  = beonji[1];

        log.info("건축물대장 조회 [sigunguCd={}, bjdongCd={}, bun={}, ji={}]", sigunguCd, bjdongCd, bun, ji);

        try {
            URI uri = UriComponentsBuilder.fromHttpUrl(BASE_URL)
                    .queryParam("serviceKey", apiKey)
                    .queryParam("sigunguCd", sigunguCd)
                    .queryParam("bjdongCd", bjdongCd)
                    .queryParam("bun", bun)
                    .queryParam("ji", ji)
                    .queryParam("numOfRows", 1000)
                    .queryParam("pageNo", 1)
                    .queryParam("_type", "json")
                    .build(true)
                    .toUri();

            BldgLedgerResponseDto res = restTemplate.getForObject(uri, BldgLedgerResponseDto.class);
            List<Double> areas = extractAreas(res);
            log.info("건축물대장 조회 완료 [총 {}건]: {}", areas.size(), areas);
            return areas;
        } catch (Exception e) {
            log.warn("건축물대장 조회 실패 [jibunAddress={}]: {}", jibunAddress, e.getMessage());
            return List.of();
        }
    }

    private List<Double> extractAreas(BldgLedgerResponseDto res) {
        List<BldgLedgerItemDto> items = resolveItems(res);
        TreeSet<Double> areas = new TreeSet<>();
        for (BldgLedgerItemDto item : items) {
            if (!EXCLUSIVE_USE_CODE.equals(item.exposPubuseGbCd())) continue;
            if (!isResidential(item.mainPurpsCd())) {
                log.debug("비주거 용도 제외 [mainPurpsCd={}, mainPurpsCdNm={}]", item.mainPurpsCd(), item.mainPurpsCdNm());
                continue;
            }
            if (item.area() == null || item.area().isBlank()) continue;
            try {
                double area = Math.round(Double.parseDouble(item.area().trim()) * 10.0) / 10.0;
                if (area > 0) areas.add(area);
            } catch (NumberFormatException e) {
                log.debug("전용면적 파싱 실패 [value={}]", item.area());
            }
        }
        return new ArrayList<>(areas);
    }

    private List<BldgLedgerItemDto> resolveItems(BldgLedgerResponseDto res) {
        try {
            List<BldgLedgerItemDto> items = res.response().body().items().item();
            return items != null ? items : List.of();
        } catch (NullPointerException e) {
            log.warn("건축물대장 응답 구조 파싱 실패: {}", e.getMessage());
            return List.of();
        }
    }

    // "서울 구로구 개봉동 807-19" → ["0807", "0019"]
    // "서울 구로구 개봉동 476"    → ["0476", "0000"]
    private String[] parseBeonji(String jibunAddress) {
        Matcher m = BEONJI_PATTERN.matcher(jibunAddress.trim());
        if (m.find()) {
            String bun = String.format("%04d", Integer.parseInt(m.group(1)));
            String ji  = m.group(2) != null ? String.format("%04d", Integer.parseInt(m.group(2))) : "0000";
            return new String[]{bun, ji};
        }
        log.warn("번지 파싱 실패 [jibunAddress={}]", jibunAddress);
        return new String[]{"0000", "0000"};
    }

    // mainPurpsCd prefix allowlist: 01xxx = 단독주택 계열, 02xxx = 공동주택 계열(아파트·연립·다세대)
    private static boolean isResidential(String mainPurpsCd) {
        if (mainPurpsCd == null || mainPurpsCd.isBlank()) return true;
        return mainPurpsCd.startsWith("01") || mainPurpsCd.startsWith("02");
    }
}
