package com.zaritalk.checklist.service;

import com.zaritalk.checklist.domain.Diagnosis;
import com.zaritalk.checklist.repository.DiagnosisRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * 안전진단 결과 저장 및 조회 서비스
 */
@Service
@RequiredArgsConstructor
public class DiagnosisService {

    private final DiagnosisRepository diagnosisRepository;

    /**
     * 안전진단 결과 저장 (유형별 최신 1건만 유지)
     */
    public void save(Long userPk, String type, String inputJson, String resultJson) {
        diagnosisRepository.findTopByUserPkAndTypeOrderByCreatedAtDesc(userPk, type)
                .ifPresent(diagnosisRepository::delete);
        diagnosisRepository.save(Diagnosis.create(userPk, type, inputJson, resultJson));
    }

    /**
     * 유형별 최신 안전진단 결과 조회
     */
    public Optional<Diagnosis> getLatest(Long userPk, String type) {
        return diagnosisRepository.findTopByUserPkAndTypeOrderByCreatedAtDesc(userPk, type);
    }
}
