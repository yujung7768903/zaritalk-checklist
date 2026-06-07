package com.zaritalk.api.controller;

import com.zaritalk.api.controller.request.DiagnosisRequest;
import com.zaritalk.api.controller.response.AvailableAreasResponse;
import com.zaritalk.api.controller.response.TransactionResponse;
import com.zaritalk.api.service.JwtService;
import com.zaritalk.core.port.MarketPricePort;
import com.zaritalk.core.service.DiagnosisCommandService;
import com.zaritalk.core.service.DiagnosisQueryService;
import com.zaritalk.core.service.ExclusiveAreaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 부동산 안전진단 컨트롤러.
 * 국토부 실거래가 / 건축물대장 API 연동 및 안전진단 결과 저장/조회를 담당한다.
 */
@RestController
@RequestMapping
@RequiredArgsConstructor
public class DiagnosisController {

    private final DiagnosisCommandService diagnosisCommandService;
    private final ExclusiveAreaService exclusiveAreaService;
    private final MarketPricePort marketPricePort;
    private final JwtService jwtService;

    /**
     * 전용면적 목록 조회.
     * 건축물대장 API 우선 조회, 결과 없을 시 국토부 실거래가 API fallback.
     */
    @GetMapping("/molit/areas")
    public ResponseEntity<AvailableAreasResponse> getAvailableAreas(
            @RequestParam String sigunguCode,
            @RequestParam String dongName,
            @RequestParam String housingType,
            @RequestParam(required = false, defaultValue = "") String aptName,
            @RequestParam(required = false, defaultValue = "") String bcode,
            @RequestParam(required = false, defaultValue = "") String jibunAddress
    ) {
        List<Double> areas = exclusiveAreaService.fetchAreas(sigunguCode, dongName, housingType, aptName, bcode, jibunAddress);
        if (areas.isEmpty()) return ResponseEntity.noContent().build();
        return ResponseEntity.ok(new AvailableAreasResponse(areas));
    }

    /**
     * 최근 3개월 실거래가 평균 조회.
     */
    @GetMapping("/molit/transactions")
    public ResponseEntity<TransactionResponse> getTransactions(
            @RequestParam String sigunguCode,
            @RequestParam String dongName,
            @RequestParam String housingType,
            @RequestParam(defaultValue = "0") double area,
            @RequestParam(required = false, defaultValue = "") String aptName
    ) {
        return marketPricePort.fetchRecentAvg(sigunguCode, dongName, housingType, area, aptName)
                .map(result -> ResponseEntity.ok(new TransactionResponse((long) result.avgPrice(), result.count(), "api")))
                .orElse(ResponseEntity.noContent().build());
    }

    /**
     * 안전진단 결과 저장 (유형별 최신 1건 유지).
     */
    @PostMapping("/diagnosis")
    public ResponseEntity<Void> saveDiagnosis(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody DiagnosisRequest req
    ) {
        Long userPk = jwtService.extractUserPkFromHeader(authHeader);
        diagnosisCommandService.save(userPk, req.type(), req.inputJson(), req.resultJson());
        return ResponseEntity.ok().build();
    }


}
