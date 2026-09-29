package com.nivva.api.transaction.dto;

import java.time.OffsetDateTime;

import com.nivva.api.transaction.TransactionType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateTransactionRequest(
        @NotNull TransactionType type,
        @NotBlank @Size(max = 120) String title,
        @NotBlank String categoryId,
        @NotBlank String accountId,
        @NotNull Long amountCents,
        @NotNull OffsetDateTime occurredAt,
        @Size(max = 500) String note
) {
}
