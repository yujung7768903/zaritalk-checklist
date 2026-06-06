package com.zaritalk.checklist.controller;

import com.zaritalk.checklist.domain.Diagnosis;
import com.zaritalk.checklist.dto.*;
import com.zaritalk.checklist.service.DiagnosisService;
import com.zaritalk.checklist.service.JwtService;
import com.zaritalk.checklist.service.MolitApiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class DiagnosisController {

    private final DiagnosisService diagnosisService;
    private final MolitApiService  molitApiService;
    private final JwtService       jwtService;

    @GetMapping("/molit/areas")
    public ResponseEntity<AvailableAreasResponse> getAvailableAreas(
            @RequestParam String sigunguCode,
            @RequestParam String dongName,
            @RequestParam String housingType,
            @RequestParam(required = false, defaultValue = "") String aptName
    ) {
        List<Double> areas = molitApiService.fetchAvailableAreas(sigunguCode, dongName, housingType, aptName);
        if (areas.isEmpty()) return ResponseEntity.noContent().build();
        return ResponseEntity.ok(new AvailableAreasResponse(areas));
    }

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

    @PostMapping("/diagnosis")
    public ResponseEntity<Void> saveDiagnosis(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody DiagnosisRequest req
    ) {
        Long userPk = jwtService.extractUserPk(bearerToken(authHeader));
        diagnosisService.save(userPk, req.type(), req.inputJson(), req.resultJson());
        return ResponseEntity.ok().build();
    }

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
