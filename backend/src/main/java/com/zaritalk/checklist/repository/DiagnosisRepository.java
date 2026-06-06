package com.zaritalk.checklist.repository;

import com.zaritalk.checklist.domain.Diagnosis;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DiagnosisRepository extends JpaRepository<Diagnosis, Long> {
    Optional<Diagnosis> findTopByUserPkAndTypeOrderByCreatedAtDesc(Long userPk, String type);
}
