package com.nivva.api.goal.dto;

import java.time.Instant;
import java.util.UUID;

import com.nivva.api.goal.GoalContribution;

public record GoalContributionResponse(
        UUID id,
        UUID goalId,
        long amountCents,
        Instant occurredAt,
        String note,
        Instant createdAt
) {

    public static GoalContributionResponse from(GoalContribution contribution) {
        return new GoalContributionResponse(
                contribution.getId(),
                contribution.getGoalId(),
                contribution.getAmountCents(),
                contribution.getOccurredAt(),
                contribution.getNote(),
                contribution.getCreatedAt()
        );
    }
}
