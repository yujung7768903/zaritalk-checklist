package com.zaritalk.core.repository;

import com.zaritalk.core.domain.ChecklistItemProgress;
import com.zaritalk.core.domain.ChecklistProgress;
import com.zaritalk.core.domain.ChecklistType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChecklistItemProgressRepository extends JpaRepository<ChecklistItemProgress, Long> {
    Optional<ChecklistItemProgress> findByChecklistProgressAndItemId(ChecklistProgress progress, String itemId);
    List<ChecklistItemProgress> findByChecklistProgress(ChecklistProgress progress);

    @Query("SELECT i.itemId FROM ChecklistItemProgress i JOIN i.checklistProgress p " +
           "WHERE p.userPk = :userPk AND p.checklistType = :type AND i.completed = true")
    List<String> findCompletedItemIds(@Param("userPk") Long userPk, @Param("type") ChecklistType type);
}
