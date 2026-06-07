package com.zaritalk.checklist.controller;

import com.zaritalk.checklist.domain.Diagnosis;
import com.zaritalk.checklist.dto.*;
import com.zaritalk.checklist.service.BldgLedgerService;
import com.zaritalk.checklist.service.DiagnosisService;
import com.zaritalk.checklist.service.JwtService;
import com.zaritalk.checklist.service.MolitApiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * 부동산 안전진단 컨트롤러
 * - 국토부 실거래가 / 건축물대장 API 연동
 * - 안전진단 결과 저장 및 조회
 */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class DiagnosisController {

    private final DiagnosisService  diagnosisService;
    private final MolitApiService   molitApiService;
    private final BldgLedgerService bldgLedgerService;
    private final JwtService        jwtService;

    /**
     * 전용면적 목록 조회
     * 건축물대장 API 우선 조회, 결과 없을 시 국토부 실거래가 API fallback
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
        List<Double> areas = List.of();

        if (!bcode.isBlank() && !jibunAddress.isBlank()) {
            areas = bldgLedgerService.fetchAreasByAddress(bcode, jibunAddress);
        }
        if (areas.isEmpty()) {
            areas = molitApiService.fetchAvailableAreas(sigunguCode, dongName, housingType, aptName);
        }

        if (areas.isEmpty()) return ResponseEntity.noContent().build();
        return ResponseEntity.ok(new AvailableAreasResponse(areas));
    }

    /**
     * 최근 3개월 실거래가 평균 조회
     */
    @GetMapping("/molit/transactions")
    public ResponseEntity<TransactionResponse> getTransactions(
            @RequestParam String sigunguCode,
            @RequestParam String dongName,
            @RequestParam String housingType,
            @RequestParam(defaultValue = "0") double area,
            @RequestParam(required = false, defaultValue = "") String aptName
    ) {
        MolitApiService.TransactionResult result = molitApiService.fetchRecentAvg(sigunguCode, dongName, housingType, area, aptName);
        if (result == null) return ResponseEntity.noContent().build();
        return ResponseEntity.ok(new TransactionResponse((long) result.avgPrice(), result.count(), "api"));
    }

    /**
     * 안전진단 결과 저장 (유형별 최신 1건 유지)
     */
    @PostMapping("/diagnosis")
    public ResponseEntity<Void> saveDiagnosis(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody DiagnosisRequest req
    ) {
        Long userPk = jwtService.extractUserPk(bearerToken(authHeader));
        diagnosisService.save(userPk, req.type(), req.inputJson(), req.resultJson());
        return ResponseEntity.ok().build();
    }

    /**
     * 유형별 최신 안전진단 결과 조회
     */
    @GetMapping("/diagnosis/latest")
    public ResponseEntity<DiagnosisResponse> getLatest(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam String type
    ) {
        Long userPk = jwtService.extractUserPk(bearerToken(authHeader));
        Optional<Diagnosis> latest = diagnosisService.getLatest(userPk, type);
        if (latest.isEmpty()) return ResponseEntity.noContent().build();
        Diagnosis d = latest.get();
        return ResponseEntity.ok(new DiagnosisResponse(
                d.getType(),
                d.getInputJson(),
                d.getResultJson(),
                d.getCreatedAt().toString()
        ));
    }

    private String bearerToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Authorization 헤더가 없거나 형식이 잘못되었습니다.");
        }
        return authHeader.substring(7);
    }
}
