package com.nivva.api.account.dto;

import java.time.Instant;
import java.util.UUID;

import com.nivva.api.account.Account;
import com.nivva.api.account.AccountType;

public record AccountResponse(
        UUID id,
        String name,
        AccountType type,
        long openingBalanceCents,
        Instant createdAt,
        Instant updatedAt
) {

    public static AccountResponse from(Account account) {
        return new AccountResponse(
                account.getId(),
                account.getName(),
                account.getType(),
                account.getOpeningBalanceCents(),
                account.getCreatedAt(),
                account.getUpdatedAt()
        );
    }
}
