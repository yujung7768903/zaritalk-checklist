package com.zaritalk.core.service;

import com.zaritalk.core.domain.Diagnosis;
import com.zaritalk.core.repository.DiagnosisRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 안전진단 결과 저장 서비스.
 * 유형별 최신 1건만 유지한다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DiagnosisCommandService {

    private final DiagnosisRepository diagnosisRepository;

    /**
     * 안전진단 결과를 저장한다.
     * 동일 유형의 기존 결과가 있으면 삭제 후 새로 저장한다.
     *
     * @param userPk     사용자 PK
     * @param type       진단 유형
     * @param inputJson  진단 입력값 JSON
     * @param resultJson 진단 결과 JSON
     */
    @Transactional
    public void save(Long userPk, String type, String inputJson, String resultJson) {
        diagnosisRepository.findTopByUserPkAndTypeOrderByCreatedAtDesc(userPk, type)
                .ifPresent(diagnosisRepository::delete);
        diagnosisRepository.save(Diagnosis.create(userPk, type, inputJson, resultJson));
        log.info("Diagnosis saved. userId={}, type={}", userPk, type);
    }
}
