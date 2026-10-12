package com.nivva.api.account;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "accounts")
public class Account {

    @Id
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false, length = 80)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AccountType type;

    @Column(name = "opening_balance_cents", nullable = false)
    private long openingBalanceCents;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected Account() {
    }

    public Account(UUID id, UUID userId, String name, AccountType type, long openingBalanceCents) {
        this.id = id;
        this.userId = userId;
        this.name = name;
        this.type = type;
        this.openingBalanceCents = openingBalanceCents;
    }

    public void replace(String name, AccountType type, long openingBalanceCents) {
        this.name = name;
        this.type = type;
        this.openingBalanceCents = openingBalanceCents;
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

    public String getName() {
        return name;
    }

    public AccountType getType() {
        return type;
    }

    public long getOpeningBalanceCents() {
        return openingBalanceCents;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
