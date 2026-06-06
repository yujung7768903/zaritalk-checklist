package com.zaritalk.checklist.controller;

import com.zaritalk.checklist.domain.Diagnosis;
import com.zaritalk.checklist.dto.DiagnosisRequest;
import com.zaritalk.checklist.service.DiagnosisService;
import com.zaritalk.checklist.service.JwtService;
import com.zaritalk.checklist.service.MolitApiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class DiagnosisController {

    private final DiagnosisService diagnosisService;
    private final MolitApiService  molitApiService;
    private final JwtService       jwtService;

    @GetMapping("/molit/transactions")
    public ResponseEntity<?> getTransactions(
            @RequestParam String sigunguCode,
            @RequestParam String bname,
            @RequestParam String housingType,
            @RequestParam(defaultValue = "0") double area
    ) {
        MolitApiService.TransactionResult result = molitApiService.fetchRecentAvg(sigunguCode, bname, housingType, area);
        if (result == null) return ResponseEntity.noContent().build();
        return ResponseEntity.ok(Map.of(
                "avgPrice", (long) result.avgPrice(),
                "count",    result.count(),
                "source",   "api"
        ));
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
    public ResponseEntity<?> getLatest(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam String type
    ) {
        Long userPk = jwtService.extractUserPk(bearerToken(authHeader));
        Optional<Diagnosis> latest = diagnosisService.getLatest(userPk, type);
        if (latest.isEmpty()) return ResponseEntity.noContent().build();
        Diagnosis d = latest.get();
        return ResponseEntity.ok(Map.of(
                "type",       d.getType(),
                "inputJson",  d.getInputJson(),
                "resultJson", d.getResultJson(),
                "createdAt",  d.getCreatedAt().toString()
        ));
    }

    private String bearerToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Authorization 헤더가 없거나 형식이 잘못되었습니다.");
        }
        return authHeader.substring(7);
    }
}
