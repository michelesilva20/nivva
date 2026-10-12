package com.nivva.api.goal.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import com.nivva.api.goal.Goal;
import com.nivva.api.goal.GoalIconKey;
import com.nivva.api.goal.GoalProgress;
import com.nivva.api.goal.GoalStatus;

public record GoalResponse(
        UUID id,
        String title,
        long targetAmountCents,
        long currentAmountCents,
        long remainingAmountCents,
        GoalStatus status,
        LocalDate deadline,
        String note,
        GoalIconKey iconKey,
        Instant createdAt,
        Instant updatedAt
) {

    public static GoalResponse from(Goal goal, GoalProgress progress) {
        return new GoalResponse(
                goal.getId(),
                goal.getTitle(),
                goal.getTargetAmountCents(),
                progress.currentAmountCents(),
                progress.remainingAmountCents(),
                progress.status(),
                goal.getDeadline(),
                goal.getNote(),
                goal.getIconKey(),
                goal.getCreatedAt(),
                goal.getUpdatedAt()
        );
    }
}
