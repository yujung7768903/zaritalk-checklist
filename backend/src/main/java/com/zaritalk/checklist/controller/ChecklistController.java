package com.zaritalk.checklist.controller;

import com.zaritalk.checklist.domain.ChecklistType;
import com.zaritalk.checklist.dto.CompletedItemsResponse;
import com.zaritalk.checklist.service.ChecklistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/checklists")
@RequiredArgsConstructor
public class ChecklistController {

    private final ChecklistService checklistService;

    @GetMapping("/{type}/progress")
    public ResponseEntity<CompletedItemsResponse> getProgress(
            @PathVariable String type,
            @RequestHeader("X-User-Pk") Long userPk
    ) {
        ChecklistType checklistType = ChecklistType.fromSlug(type);
        List<String> completedItemIds = checklistService.getCompletedItemIds(userPk, checklistType);
        return ResponseEntity.ok(new CompletedItemsResponse(completedItemIds));
    }

    @PutMapping("/{type}/items/{itemId}")
    public ResponseEntity<CompletedItemsResponse> toggleItem(
            @PathVariable String type,
            @PathVariable String itemId,
            @RequestHeader("X-User-Pk") Long userPk
    ) {
        ChecklistType checklistType = ChecklistType.fromSlug(type);
        List<String> completedItemIds = checklistService.toggleItem(userPk, checklistType, itemId);
        return ResponseEntity.ok(new CompletedItemsResponse(completedItemIds));
    }

    @DeleteMapping("/{type}/progress")
    public ResponseEntity<Void> resetProgress(
            @PathVariable String type,
            @RequestHeader("X-User-Pk") Long userPk
    ) {
        ChecklistType checklistType = ChecklistType.fromSlug(type);
        checklistService.resetProgress(userPk, checklistType);
        return ResponseEntity.noContent().build();
    }
}
