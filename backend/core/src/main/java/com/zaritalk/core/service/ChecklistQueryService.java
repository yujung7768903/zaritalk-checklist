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
 * 체크리스트 진행 상태 조회 서비스.
 */
@Service
@RequiredArgsConstructor
public class ChecklistQueryService {

    private final ChecklistProgressRepository progressRepository;
    private final ChecklistItemProgressRepository itemProgressRepository;

    /**
     * 완료된 체크리스트 항목 ID 목록을 반환한다.
     *
     * @param userPk 사용자 PK
     * @param type   체크리스트 타입
     * @return 완료된 항목 ID 목록; 진행 상태가 없으면 빈 리스트
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
     * 체크리스트 진행 상태를 조회한다.
     *
     * @param userPk 사용자 PK
     * @param type   체크리스트 타입
     * @return 진행 상태; 없으면 Optional.empty()
     */
    @Transactional(readOnly = true)
    public java.util.Optional<ChecklistProgress> findProgress(Long userPk, ChecklistType type) {
        return progressRepository.findByUserPkAndChecklistType(userPk, type);
    }
}
