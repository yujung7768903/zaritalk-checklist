package com.zaritalk.core.repository;

import com.zaritalk.core.domain.ChecklistItemProgress;
import com.zaritalk.core.domain.ChecklistProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChecklistItemProgressRepository extends JpaRepository<ChecklistItemProgress, Long> {
    Optional<ChecklistItemProgress> findByChecklistProgressAndItemId(ChecklistProgress progress, String itemId);
    List<ChecklistItemProgress> findByChecklistProgress(ChecklistProgress progress);
}
