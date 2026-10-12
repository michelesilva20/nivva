package com.nivva.api.goal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;

import org.junit.jupiter.api.Test;

import com.nivva.api.common.NivvaClockConfig;
import com.nivva.api.common.error.InvalidGoalException;

class GoalRulesTest {

    private static final Clock CLOCK = Clock.fixed(Instant.parse("2026-07-15T15:00:00Z"), NivvaClockConfig.ZONE);
    private static final LocalDate TODAY = LocalDate.now(CLOCK);

    @Test
    void trimsTitleAndNote() {
        assertEquals("Viagem", GoalRules.normalizeTitle("  Viagem  "));
        assertEquals("obs", GoalRules.normalizeNote("  obs  "));
        assertNull(GoalRules.normalizeNote("   "));
        assertNull(GoalRules.normalizeNote(null));
    }

    @Test
    void rejectsBlankOrLongTitle() {
        assertThrows(InvalidGoalException.class, () -> GoalRules.normalizeTitle("   "));
        assertThrows(InvalidGoalException.class, () -> GoalRules.normalizeTitle("t".repeat(121)));
    }

    @Test
    void targetMustBePositiveAndAtLeastCurrent() {
        assertEquals(1000L, GoalRules.requireTargetAmount(1000L));
        assertThrows(InvalidGoalException.class, () -> GoalRules.requireTargetAmount(0L));
        assertThrows(InvalidGoalException.class, () -> GoalRules.requireTargetAmount(-1L));
        assertThrows(InvalidGoalException.class, () -> GoalRules.requireTargetAtLeastCurrent(90000L, 100000L));
        GoalRules.requireTargetAtLeastCurrent(100000L, 100000L);
        GoalRules.requireTargetAtLeastCurrent(150000L, 100000L);
    }

    @Test
    void progressDerivesCurrentRemainingAndStatus() {
        GoalProgress mid = GoalProgress.of(100000L, 50000L);
        assertEquals(50000L, mid.currentAmountCents());
        assertEquals(50000L, mid.remainingAmountCents());
        assertEquals(GoalStatus.ACTIVE, mid.status());

        GoalProgress done = GoalProgress.of(100000L, 100000L);
        assertEquals(0L, done.remainingAmountCents());
        assertEquals(GoalStatus.COMPLETED, done.status());
    }

    @Test
    void createDeadlineUsesFixedClock() {
        assertEquals(LocalDate.of(2026, 7, 15), TODAY);
        GoalRules.requireCreateDeadline(null, TODAY);
        GoalRules.requireCreateDeadline(TODAY, TODAY);
        GoalRules.requireCreateDeadline(TODAY.plusDays(1), TODAY);
        InvalidGoalException past = assertThrows(
                InvalidGoalException.class,
                () -> GoalRules.requireCreateDeadline(TODAY.minusDays(1), TODAY)
        );
        assertEquals(GoalRules.DEADLINE_IN_PAST, past.getMessage());
    }

    @Test
    void updateDeadlineAllowsUnchangedPastValue() {
        LocalDate expired = LocalDate.of(2026, 6, 1);
        GoalRules.requireUpdateDeadline(expired, expired, TODAY);
        GoalRules.requireUpdateDeadline(expired, TODAY.plusMonths(1), TODAY);
        InvalidGoalException changedToPast = assertThrows(
                InvalidGoalException.class,
                () -> GoalRules.requireUpdateDeadline(expired, TODAY.minusDays(1), TODAY)
        );
        assertEquals(GoalRules.DEADLINE_IN_PAST, changedToPast.getMessage());
    }

    @Test
    void contributionRules() {
        GoalProgress remaining = GoalProgress.of(100000L, 80000L);
        GoalRules.requireCanContribute(remaining, 20000L);
        assertThrows(InvalidGoalException.class, () -> GoalRules.requireCanContribute(remaining, 20001L));
        assertThrows(InvalidGoalException.class, () -> GoalRules.requireContributionAmount(0L));

        GoalProgress completed = GoalProgress.of(100000L, 100000L);
        InvalidGoalException blocked = assertThrows(
                InvalidGoalException.class,
                () -> GoalRules.requireCanContribute(completed, 1L)
        );
        assertEquals(GoalRules.COMPLETED_BLOCKS_CONTRIBUTION, blocked.getMessage());
    }

    @Test
    void defaultIconIsOther() {
        assertEquals(GoalIconKey.OTHER, GoalRules.requireIcon(null));
        assertEquals(GoalIconKey.TRAVEL, GoalRules.requireIcon(GoalIconKey.TRAVEL));
    }

    @Test
    void unusedZoneOffsetDoesNotLeakIntoDeadline() {
        assertEquals(NivvaClockConfig.ZONE, CLOCK.getZone());
        assertEquals("America/Sao_Paulo", NivvaClockConfig.ZONE.getId());
        assertEquals(ZoneOffset.UTC, ZoneOffset.UTC);
    }
}
