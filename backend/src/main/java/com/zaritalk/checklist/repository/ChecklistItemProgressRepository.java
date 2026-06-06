package com.zaritalk.checklist.repository;

import com.zaritalk.checklist.domain.ChecklistItemProgress;
import com.zaritalk.checklist.domain.ChecklistProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChecklistItemProgressRepository extends JpaRepository<ChecklistItemProgress, Long> {
    Optional<ChecklistItemProgress> findByChecklistProgressAndItemId(ChecklistProgress progress, String itemId);
    List<ChecklistItemProgress> findByChecklistProgress(ChecklistProgress progress);
}
