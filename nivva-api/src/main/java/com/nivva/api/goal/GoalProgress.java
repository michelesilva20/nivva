package com.nivva.api.goal;

public record GoalProgress(
        long currentAmountCents,
        long remainingAmountCents,
        GoalStatus status
) {

    public static GoalProgress of(long targetAmountCents, long currentAmountCents) {
        long current = Math.max(0L, currentAmountCents);
        long remaining = Math.max(0L, targetAmountCents - current);
        GoalStatus status = current >= targetAmountCents && targetAmountCents > 0
                ? GoalStatus.COMPLETED
                : GoalStatus.ACTIVE;
        return new GoalProgress(current, remaining, status);
    }
}
