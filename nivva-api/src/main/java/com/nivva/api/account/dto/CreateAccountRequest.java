package com.nivva.api.account.dto;

import com.nivva.api.account.AccountType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateAccountRequest(
        @NotBlank @Size(max = 80) String name,
        @NotNull AccountType type,
        @NotNull Long openingBalanceCents
) {
}
