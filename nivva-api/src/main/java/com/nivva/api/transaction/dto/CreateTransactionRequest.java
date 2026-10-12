package com.nivva.api.transaction.dto;

import java.util.UUID;

import com.nivva.api.transaction.TransactionType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.OffsetDateTime;

public record CreateTransactionRequest(
        @NotNull TransactionType type,
        @NotBlank @Size(max = 120) String title,
        @NotBlank String categoryId,
        @NotNull UUID accountId,
        @NotNull Long amountCents,
        @NotNull OffsetDateTime occurredAt,
        @Size(max = 500) String note
) {
}
