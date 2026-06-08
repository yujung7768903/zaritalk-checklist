package com.zaritalk.core.domain;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Entity
@Table(
    name = "checklist_progress",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_pk", "checklist_type"})
)
public class ChecklistProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long pk;

    @Column(name = "user_pk", nullable = false)
    private Long userPk;

    @Enumerated(EnumType.STRING)
    @Column(name = "checklist_type", nullable = false, length = 20)
    private ChecklistType checklistType;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "checklistProgress", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ChecklistItemProgress> items = new ArrayList<>();

    @Column(name = "current_housing", length = 20)
    private String currentHousing;

    @Column(name = "next_housing", length = 20)
    private String nextHousing;

    @Column(name = "exit_type", length = 20)
    private String exitType;

    public static ChecklistProgress create(Long userPk, ChecklistType checklistType) {
        ChecklistProgress progress = new ChecklistProgress();
        progress.userPk = userPk;
        progress.checklistType = checklistType;
        progress.createdAt = LocalDateTime.now();
        return progress;
    }

    public Long getPk() { return pk; }
    public Long getUserPk() { return userPk; }
    public ChecklistType getChecklistType() { return checklistType; }
    public List<ChecklistItemProgress> getItems() { return Collections.unmodifiableList(items); }
    public String getCurrentHousing() { return currentHousing; }
    public String getNextHousing() { return nextHousing; }
    public String getExitType() { return exitType; }

    public void updateSituationConfig(String currentHousing, String nextHousing, String exitType) {
        this.currentHousing = currentHousing;
        this.nextHousing = nextHousing;
        this.exitType = exitType;
    }
}
