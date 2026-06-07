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

/**
 * 체크리스트 진행 상태 관리 서비스
 */
@Service
@Transactional
@RequiredArgsConstructor
public class ChecklistService {

    private final ChecklistProgressRepository progressRepository;
    private final ChecklistItemProgressRepository itemProgressRepository;

    /**
     * 완료된 체크리스트 항목 ID 목록 조회
     */
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

    /**
     * 항목 완료 여부 토글 (미완료 → 완료 / 완료 → 미완료)
     */
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

    /**
     * 체크리스트 진행 상태 전체 초기화
     */
    public void resetProgress(Long userPk, ChecklistType type) {
        progressRepository.findByUserPkAndChecklistType(userPk, type)
                .ifPresent(progress -> {
                    List<ChecklistItemProgress> items = itemProgressRepository.findByChecklistProgress(progress);
                    itemProgressRepository.deleteAll(items);
                });
    }
}
