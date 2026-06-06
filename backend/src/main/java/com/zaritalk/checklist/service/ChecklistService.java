package com.zaritalk.checklist.service;

import com.zaritalk.checklist.domain.ChecklistItemProgress;
import com.zaritalk.checklist.domain.ChecklistProgress;
import com.zaritalk.checklist.domain.ChecklistType;
import com.zaritalk.checklist.repository.ChecklistItemProgressRepository;
import com.zaritalk.checklist.repository.ChecklistProgressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class ChecklistService {

    private final ChecklistProgressRepository progressRepository;
    private final ChecklistItemProgressRepository itemProgressRepository;

    @Transactional(readOnly = true)
    public List<String> getCompletedItemIds(Long userPk, ChecklistType type) {
        return progressRepository.findByUserPkAndChecklistType(userPk, type)
                .map(progress -> itemProgressRepository.findByChecklistProgress(progress)
                        .stream()
                        .filter(ChecklistItemProgress::isCompleted)
                        .map(ChecklistItemProgress::getItemId)
                        .toList())
                .orElse(List.of());
    }

    public List<String> toggleItem(Long userPk, ChecklistType type, String itemId) {
        ChecklistProgress progress = progressRepository.findByUserPkAndChecklistType(userPk, type)
                .orElseGet(() -> progressRepository.save(ChecklistProgress.create(userPk, type)));

        itemProgressRepository.findByChecklistProgressAndItemId(progress, itemId)
                .ifPresentOrElse(
                        ChecklistItemProgress::toggleCompleted,
                        () -> itemProgressRepository.save(ChecklistItemProgress.create(progress, itemId))
                );

        return getCompletedItemIds(userPk, type);
    }

    public void resetProgress(Long userPk, ChecklistType type) {
        progressRepository.findByUserPkAndChecklistType(userPk, type)
                .ifPresent(progress -> {
                    List<ChecklistItemProgress> items = itemProgressRepository.findByChecklistProgress(progress);
                    itemProgressRepository.deleteAll(items);
                });
    }
}
