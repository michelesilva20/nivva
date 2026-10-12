package com.nivva.api.goal;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "goal_contributions")
public class GoalContribution {

    @Id
    private UUID id;

    @Column(name = "goal_id", nullable = false)
    private UUID goalId;

    @Column(name = "amount_cents", nullable = false)
    private long amountCents;

    @Column(name = "occurred_at", nullable = false)
    private Instant occurredAt;

    @Column(length = 500)
    private String note;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected GoalContribution() {
    }

    public GoalContribution(UUID id, UUID goalId, long amountCents, Instant occurredAt, String note) {
        this.id = id;
        this.goalId = goalId;
        this.amountCents = amountCents;
        this.occurredAt = occurredAt;
        this.note = note;
    }

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getGoalId() {
        return goalId;
    }

    public long getAmountCents() {
        return amountCents;
    }

    public Instant getOccurredAt() {
        return occurredAt;
    }

    public String getNote() {
        return note;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
