package com.zaritalk.checklist.service;

import com.zaritalk.checklist.domain.ChecklistType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class ChecklistServiceTest {

    @Autowired
    private ChecklistService checklistService;

    @Test
    @DisplayName("첫 토글 시 progress가 자동 생성되고 항목이 완료 처리된다")
    void 첫_토글_시_progress_자동_생성() {
        List<String> result = checklistService.toggleItem(1L, ChecklistType.NEW_HOME, "registry-check");

        assertThat(result).containsExactly("registry-check");
    }

    @Test
    @DisplayName("동일 항목 재토글 시 완료가 취소된다")
    void 동일_항목_재토글_시_완료_취소() {
        checklistService.toggleItem(1L, ChecklistType.NEW_HOME, "registry-check");
        List<String> result = checklistService.toggleItem(1L, ChecklistType.NEW_HOME, "registry-check");

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("여러 항목 토글 시 완료된 항목 목록이 누적된다")
    void 여러_항목_토글_누적() {
        checklistService.toggleItem(1L, ChecklistType.NEW_HOME, "registry-check");
        checklistService.toggleItem(1L, ChecklistType.NEW_HOME, "building-ledger");
        List<String> result = checklistService.toggleItem(1L, ChecklistType.NEW_HOME, "realtor-check");

        assertThat(result).containsExactlyInAnyOrder("registry-check", "building-ledger", "realtor-check");
    }

    @Test
    @DisplayName("초기화 시 완료 항목이 모두 제거된다")
    void 초기화_시_완료_항목_제거() {
        checklistService.toggleItem(1L, ChecklistType.NEW_HOME, "registry-check");
        checklistService.toggleItem(1L, ChecklistType.NEW_HOME, "building-ledger");

        checklistService.resetProgress(1L, ChecklistType.NEW_HOME);

        List<String> result = checklistService.getCompletedItemIds(1L, ChecklistType.NEW_HOME);
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("진행 상태가 없으면 빈 목록을 반환한다")
    void 진행_상태_없으면_빈_목록() {
        List<String> result = checklistService.getCompletedItemIds(99L, ChecklistType.JEONSE_MOVE);

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("체크리스트 타입이 다르면 진행 상태가 독립적이다")
    void 타입별_진행_상태_독립() {
        checklistService.toggleItem(1L, ChecklistType.NEW_HOME, "registry-check");
        checklistService.toggleItem(1L, ChecklistType.JEONSE_MOVE, "registry-check");

        List<String> newHomeResult = checklistService.getCompletedItemIds(1L, ChecklistType.NEW_HOME);
        List<String> jeonseResult = checklistService.getCompletedItemIds(1L, ChecklistType.JEONSE_MOVE);

        assertThat(newHomeResult).containsExactly("registry-check");
        assertThat(jeonseResult).containsExactly("registry-check");
    }
}
