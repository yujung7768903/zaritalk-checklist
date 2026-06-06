package com.zaritalk.checklist.service;

import com.zaritalk.checklist.domain.Diagnosis;
import com.zaritalk.checklist.repository.DiagnosisRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DiagnosisService {

    private final DiagnosisRepository diagnosisRepository;

    public void save(Long userPk, String type, String inputJson, String resultJson) {
        // 기존 결과 삭제 후 최신 1건만 유지
        diagnosisRepository.findTopByUserPkAndTypeOrderByCreatedAtDesc(userPk, type)
                .ifPresent(diagnosisRepository::delete);
        diagnosisRepository.save(Diagnosis.create(userPk, type, inputJson, resultJson));
    }

    public Optional<Diagnosis> getLatest(Long userPk, String type) {
        return diagnosisRepository.findTopByUserPkAndTypeOrderByCreatedAtDesc(userPk, type);
    }
}
