package com.zaritalk.core.service;

import com.zaritalk.core.domain.ChecklistItemProgress;
import com.zaritalk.core.domain.ChecklistProgress;
import com.zaritalk.core.domain.ChecklistType;
import com.zaritalk.core.repository.ChecklistItemProgressRepository;
import com.zaritalk.core.repository.ChecklistProgressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

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
     * 체크리스트 진행 상태를 저장하고 갱신된 완료 항목 ID 목록을 반환한다.
     * 기존 진행 상태를 모두 삭제하고 요청된 항목들로 재설정한다.
     * 완료 여부와 무관하게 메모가 있는 항목도 함께 저장된다.
     *
     * @param userPk          사용자 PK
     * @param type            체크리스트 타입
     * @param completedItemIds 완료된 항목 ID 목록
     * @param itemMemos       항목별 메모 (항목 ID -> 메모)
     * @param currentHousing  현재 거주 유형
     * @param nextHousing     다음 거주 유형
     * @param exitType        퇴거 방식
     * @return 갱신된 완료 항목 ID 목록
     */
    @Transactional
    public List<String> saveProgress(Long userPk, ChecklistType type, List<String> completedItemIds,
                                     Map<String, String> itemMemos,
                                     String currentHousing, String nextHousing, String exitType) {
        ChecklistProgress progress = progressRepository.findByUserPkAndChecklistType(userPk, type)
                .orElseGet(() -> progressRepository.save(ChecklistProgress.create(userPk, type)));

        // 현재 상황 정보 업데이트
        progress.updateSituationConfig(currentHousing, nextHousing, exitType);

        // 기존 항목들 모두 삭제 (flush로 즉시 반영하여 동일 item_id 재삽입 시 unique 제약 위반 방지)
        List<ChecklistItemProgress> existingItems = itemProgressRepository.findByChecklistProgress(progress);
        itemProgressRepository.deleteAll(existingItems);
        itemProgressRepository.flush();

        // 완료되었거나 메모가 있는 항목들을 저장
        Set<String> itemIds = new LinkedHashSet<>(completedItemIds);
        itemIds.addAll(itemMemos.keySet());
        List<ChecklistItemProgress> newItems = itemIds.stream()
                .map(itemId -> ChecklistItemProgress.of(progress, itemId, completedItemIds.contains(itemId), itemMemos.get(itemId)))
                .toList();
        itemProgressRepository.saveAll(newItems);

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
