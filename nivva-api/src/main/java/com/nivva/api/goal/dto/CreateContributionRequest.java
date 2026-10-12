package com.nivva.api.goal.dto;

import java.time.OffsetDateTime;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateContributionRequest(
        @NotNull Long amountCents,
        @NotNull OffsetDateTime occurredAt,
        @Size(max = 500) String note
) {
}
