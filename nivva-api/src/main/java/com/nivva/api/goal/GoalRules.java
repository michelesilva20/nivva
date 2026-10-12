package com.nivva.api.goal;

import java.time.LocalDate;
import java.util.Objects;

import com.nivva.api.common.error.InvalidGoalException;

public final class GoalRules {

    public static final int TITLE_MIN = 1;
    public static final int TITLE_MAX = 120;
    public static final int NOTE_MAX = 500;

    public static final String DEADLINE_IN_PAST = "deadline must not be in the past";
    public static final String TARGET_BELOW_CURRENT =
            "targetAmountCents cannot be less than the contributed amount";
    public static final String CONTRIBUTION_EXCEEDS_REMAINING = "Contribution exceeds remaining amount";
    public static final String COMPLETED_BLOCKS_CONTRIBUTION = "Completed goal cannot receive contributions";
    public static final String AMOUNT_NOT_POSITIVE = "amountCents must be greater than 0";

    private GoalRules() {
    }

    public static String normalizeTitle(String title) {
        String normalized = title == null ? "" : title.trim();
        if (normalized.length() < TITLE_MIN || normalized.length() > TITLE_MAX) {
            throw new InvalidGoalException("title must be between 1 and 120 characters");
        }
        return normalized;
    }

    public static String normalizeNote(String note) {
        if (note == null) {
            return null;
        }
        String trimmed = note.trim();
        if (trimmed.isEmpty()) {
            return null;
        }
        if (trimmed.length() > NOTE_MAX) {
            throw new InvalidGoalException("note must be at most 500 characters");
        }
        return trimmed;
    }

    public static GoalIconKey requireIcon(GoalIconKey iconKey) {
        return iconKey == null ? GoalIconKey.OTHER : iconKey;
    }

    public static long requireTargetAmount(Long targetAmountCents) {
        if (targetAmountCents == null || targetAmountCents <= 0) {
            throw new InvalidGoalException("targetAmountCents must be greater than 0");
        }
        return targetAmountCents;
    }

    public static void requireTargetAtLeastCurrent(long targetAmountCents, long currentAmountCents) {
        if (targetAmountCents < currentAmountCents) {
            throw new InvalidGoalException(TARGET_BELOW_CURRENT);
        }
    }

    public static void requireCreateDeadline(LocalDate deadline, LocalDate today) {
        if (deadline != null && deadline.isBefore(today)) {
            throw new InvalidGoalException(DEADLINE_IN_PAST);
        }
    }

    public static void requireUpdateDeadline(LocalDate previous, LocalDate next, LocalDate today) {
        if (Objects.equals(previous, next)) {
            return;
        }
        requireCreateDeadline(next, today);
    }

    public static long requireContributionAmount(Long amountCents) {
        if (amountCents == null || amountCents <= 0) {
            throw new InvalidGoalException(AMOUNT_NOT_POSITIVE);
        }
        return amountCents;
    }

    public static void requireCanContribute(GoalProgress progress, long amountCents) {
        if (progress.status() == GoalStatus.COMPLETED) {
            throw new InvalidGoalException(COMPLETED_BLOCKS_CONTRIBUTION);
        }
        if (amountCents > progress.remainingAmountCents()) {
            throw new InvalidGoalException(CONTRIBUTION_EXCEEDS_REMAINING);
        }
    }
}
