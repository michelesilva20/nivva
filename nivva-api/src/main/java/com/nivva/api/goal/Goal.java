package com.nivva.api.goal;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "goals")
public class Goal {

    @Id
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false, length = 120)
    private String title;

    @Column(name = "target_amount_cents", nullable = false)
    private long targetAmountCents;

    @Column
    private LocalDate deadline;

    @Column(length = 500)
    private String note;

    @Convert(converter = GoalIconKeyConverter.class)
    @Column(name = "icon_key", nullable = false, length = 20)
    private GoalIconKey iconKey;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected Goal() {
    }

    public Goal(
            UUID id,
            UUID userId,
            String title,
            long targetAmountCents,
            LocalDate deadline,
            String note,
            GoalIconKey iconKey
    ) {
        this.id = id;
        this.userId = userId;
        this.title = title;
        this.targetAmountCents = targetAmountCents;
        this.deadline = deadline;
        this.note = note;
        this.iconKey = iconKey;
    }

    public void replace(
            String title,
            long targetAmountCents,
            LocalDate deadline,
            String note,
            GoalIconKey iconKey
    ) {
        this.title = title;
        this.targetAmountCents = targetAmountCents;
        this.deadline = deadline;
        this.note = note;
        this.iconKey = iconKey;
    }

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getTitle() {
        return title;
    }

    public long getTargetAmountCents() {
        return targetAmountCents;
    }

    public LocalDate getDeadline() {
        return deadline;
    }

    public String getNote() {
        return note;
    }

    public GoalIconKey getIconKey() {
        return iconKey;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
