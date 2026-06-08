package com.zaritalk.api.controller;

import com.zaritalk.api.controller.request.SaveProgressRequest;
import com.zaritalk.api.controller.response.CompletedItemsResponse;
import com.zaritalk.api.service.JwtService;
import com.zaritalk.core.domain.ChecklistType;
import com.zaritalk.core.service.ChecklistCommandService;
import com.zaritalk.core.service.ChecklistQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 이사 체크리스트 진행 상태 컨트롤러.
 */
@RestController
@RequestMapping("/checklists")
@RequiredArgsConstructor
public class ChecklistController {

    private final ChecklistQueryService   checklistQueryService;
    private final ChecklistCommandService checklistCommandService;
    private final JwtService              jwtService;

    /**
     * 체크리스트 완료 항목 목록 조회.
     */
    @GetMapping("/{type}/progress")
    public ResponseEntity<CompletedItemsResponse> getProgress(
            @PathVariable String type,
            @RequestHeader("Authorization") String authHeader
    ) {
        Long userPk = jwtService.extractUserPkFromHeader(authHeader);
        ChecklistType checklistType = ChecklistType.fromSlug(type);
        List<String> completedItemIds = checklistQueryService.getCompletedItemIds(userPk, checklistType);
        return ResponseEntity.ok(new CompletedItemsResponse(completedItemIds));
    }

    /**
     * 체크리스트 항목 완료 여부 토글.
     */
    @PutMapping("/{type}/items/{itemId}")
    public ResponseEntity<CompletedItemsResponse> toggleItem(
            @PathVariable String type,
            @PathVariable String itemId,
            @RequestHeader("Authorization") String authHeader
    ) {
        Long userPk = jwtService.extractUserPkFromHeader(authHeader);
        ChecklistType checklistType = ChecklistType.fromSlug(type);
        List<String> completedItemIds = checklistCommandService.toggleItem(userPk, checklistType, itemId);
        return ResponseEntity.ok(new CompletedItemsResponse(completedItemIds));
    }

    /**
     * 체크리스트 진행 상태 저장.
     */
    @PostMapping("/{type}/progress")
    public ResponseEntity<CompletedItemsResponse> saveProgress(
            @PathVariable String type,
            @RequestBody SaveProgressRequest request,
            @RequestHeader("Authorization") String authHeader
    ) {
        Long userPk = jwtService.extractUserPkFromHeader(authHeader);
        ChecklistType checklistType = ChecklistType.fromSlug(type);
        List<String> completedItemIds = checklistCommandService.saveProgress(userPk, checklistType, request.completedItemIds());
        return ResponseEntity.ok(new CompletedItemsResponse(completedItemIds));
    }

    /**
     * 체크리스트 진행 상태 초기화.
     */
    @DeleteMapping("/{type}/progress")
    public ResponseEntity<Void> resetProgress(
            @PathVariable String type,
            @RequestHeader("Authorization") String authHeader
    ) {
        Long userPk = jwtService.extractUserPkFromHeader(authHeader);
        ChecklistType checklistType = ChecklistType.fromSlug(type);
        checklistCommandService.resetProgress(userPk, checklistType);
        return ResponseEntity.noContent().build();
    }


}
