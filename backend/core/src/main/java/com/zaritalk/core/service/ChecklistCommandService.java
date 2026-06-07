package com.zaritalk.core.service;

import com.zaritalk.core.domain.ChecklistItemProgress;
import com.zaritalk.core.domain.ChecklistProgress;
import com.zaritalk.core.domain.ChecklistType;
import com.zaritalk.core.repository.ChecklistItemProgressRepository;
import com.zaritalk.core.repository.ChecklistProgressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 체크리스트 진행 상태 쓰기 서비스.
 * 항목 토글 및 진행 상태 초기화를 담당한다.
 */
@Service
@RequiredArgsConstructor
public class ChecklistCommandService {

    private final ChecklistProgressRepository progressRepository;
    private final ChecklistItemProgressRepository itemProgressRepository;
    private final ChecklistQueryService checklistQueryService;

    /**
     * 항목 완료 여부를 토글하고 갱신된 완료 항목 ID 목록을 반환한다.
     * 진행 상태가 없으면 신규 생성한다.
     *
     * @param userPk 사용자 PK
     * @param type   체크리스트 타입
     * @param itemId 토글할 항목 ID
     * @return 갱신된 완료 항목 ID 목록
     */
    @Transactional
    public List<String> toggleItem(Long userPk, ChecklistType type, String itemId) {
        ChecklistProgress progress = progressRepository.findByUserPkAndChecklistType(userPk, type)
                .orElseGet(() -> progressRepository.save(ChecklistProgress.create(userPk, type)));

        itemProgressRepository.findByChecklistProgressAndItemId(progress, itemId)
                .ifPresentOrElse(
                        ChecklistItemProgress::toggleCompleted,
                        () -> itemProgressRepository.save(ChecklistItemProgress.create(progress, itemId))
                );

        return checklistQueryService.getCompletedItemIds(userPk, type);
    }

    /**
     * 체크리스트 진행 상태를 전체 초기화한다.
     * 진행 상태가 없으면 아무 작업도 수행하지 않는다.
     *
     * @param userPk 사용자 PK
     * @param type   체크리스트 타입
     */
    @Transactional
    public void resetProgress(Long userPk, ChecklistType type) {
        progressRepository.findByUserPkAndChecklistType(userPk, type)
                .ifPresent(progress -> {
                    List<ChecklistItemProgress> items = itemProgressRepository.findByChecklistProgress(progress);
                    itemProgressRepository.deleteAll(items);
                });
    }
}
