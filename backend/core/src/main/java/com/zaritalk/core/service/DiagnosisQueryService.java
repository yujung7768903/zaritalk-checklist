package com.zaritalk.core.service;

import com.zaritalk.core.domain.Diagnosis;
import com.zaritalk.core.repository.DiagnosisRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * 안전진단 결과 조회 서비스.
 */
@Service
@RequiredArgsConstructor
public class DiagnosisQueryService {

    private final DiagnosisRepository diagnosisRepository;

    /**
     * 유형별 최신 안전진단 결과를 조회한다.
     *
     * @param userPk 사용자 PK
     * @param type   진단 유형 (jeonse, meme, wolse 등)
     * @return 최신 진단 결과; 없으면 Optional.empty()
     */
    @Transactional(readOnly = true)
    public Optional<Diagnosis> getLatest(Long userPk, String type) {
        return diagnosisRepository.findTopByUserPkAndTypeOrderByCreatedAtDesc(userPk, type);
    }
}
