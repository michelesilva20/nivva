package com.nivva.api.transaction;

import java.time.Instant;
import java.util.UUID;

import com.nivva.api.account.Account;
import com.nivva.api.category.Category;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TransactionType type;

    @Column(nullable = false, length = 120)
    private String title;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Column(name = "amount_cents", nullable = false)
    private long amountCents;

    @Column(name = "occurred_at", nullable = false)
    private Instant occurredAt;

    @Column(length = 500)
    private String note;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected Transaction() {
    }

    public Transaction(
            UUID id,
            UUID userId,
            TransactionType type,
            String title,
            Category category,
            Account account,
            long amountCents,
            Instant occurredAt,
            String note
    ) {
        this.id = id;
        this.userId = userId;
        this.type = type;
        this.title = title;
        this.category = category;
        this.account = account;
        this.amountCents = amountCents;
        this.occurredAt = occurredAt;
        this.note = note;
    }

    public void replace(
            String title,
            Category category,
            Account account,
            long amountCents,
            Instant occurredAt,
            String note
    ) {
        this.title = title;
        this.category = category;
        this.account = account;
        this.amountCents = amountCents;
        this.occurredAt = occurredAt;
        this.note = note;
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

    public TransactionType getType() {
        return type;
    }

    public String getTitle() {
        return title;
    }

    public Category getCategory() {
        return category;
    }

    public Account getAccount() {
        return account;
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

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
