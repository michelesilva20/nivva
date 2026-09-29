package com.nivva.api.transaction.dto;

import java.time.Instant;
import java.util.UUID;

import com.nivva.api.transaction.Transaction;
import com.nivva.api.transaction.TransactionType;

public record TransactionResponse(
        UUID id,
        TransactionType type,
        String title,
        String categoryId,
        String accountId,
        long amountCents,
        Instant occurredAt,
        String note,
        Instant createdAt,
        Instant updatedAt
) {

    public static TransactionResponse from(Transaction transaction) {
        return new TransactionResponse(
                transaction.getId(),
                transaction.getType(),
                transaction.getTitle(),
                transaction.getCategory().getId(),
                transaction.getAccount().getId(),
                transaction.getAmountCents(),
                transaction.getOccurredAt(),
                transaction.getNote(),
                transaction.getCreatedAt(),
                transaction.getUpdatedAt()
        );
    }
}
