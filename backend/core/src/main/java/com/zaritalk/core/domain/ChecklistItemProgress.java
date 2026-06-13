package com.zaritalk.core.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
    name = "checklist_item_progress",
    uniqueConstraints = @UniqueConstraint(columnNames = {"checklist_progress_pk", "item_id"})
)
public class ChecklistItemProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long pk;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "checklist_progress_pk", nullable = false)
    private ChecklistProgress checklistProgress;

    @Column(name = "item_id", nullable = false, length = 100)
    private String itemId;

    @Column(name = "completed", nullable = false)
    private boolean completed;

    @Column(name = "memo", length = 1000)
    private String memo;

    public static ChecklistItemProgress create(ChecklistProgress progress, String itemId) {
        ChecklistItemProgress item = new ChecklistItemProgress();
        item.checklistProgress = progress;
        item.itemId = itemId;
        item.completed = true;
        return item;
    }

    public static ChecklistItemProgress of(ChecklistProgress progress, String itemId, boolean completed, String memo) {
        ChecklistItemProgress item = new ChecklistItemProgress();
        item.checklistProgress = progress;
        item.itemId = itemId;
        item.completed = completed;
        item.memo = memo;
        return item;
    }

    public void toggleCompleted() {
        this.completed = !this.completed;
    }

    public String getItemId() { return itemId; }
    public boolean isCompleted() { return completed; }
    public String getMemo() { return memo; }
}
