package com.zaritalk.core.repository;

import com.zaritalk.core.domain.ChecklistProgress;
import com.zaritalk.core.domain.ChecklistType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ChecklistProgressRepository extends JpaRepository<ChecklistProgress, Long> {
    Optional<ChecklistProgress> findByUserPkAndChecklistType(Long userPk, ChecklistType checklistType);
}
