package com.zaritalk.checklist.repository;

import com.zaritalk.checklist.domain.ChecklistProgress;
import com.zaritalk.checklist.domain.ChecklistType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ChecklistProgressRepository extends JpaRepository<ChecklistProgress, Long> {
    Optional<ChecklistProgress> findByUserPkAndChecklistType(Long userPk, ChecklistType checklistType);
}
