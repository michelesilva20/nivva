package com.nivva.api.goal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Instant;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIf;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;

import com.nivva.api.TestcontainersConfiguration;

@SpringBootTest
@Import(TestcontainersConfiguration.class)
@EnabledIf(value = "com.nivva.api.support.DockerAvailability#available", disabledReason = "Docker is not running")
class GoalRepositoryIT {

    @Autowired
    private GoalRepository goals;
    @Autowired
    private GoalContributionRepository contributions;
    @Autowired
    private JdbcTemplate jdbc;

    @Test
    void persistsIconKeyAsLowercaseAndReadsEnum() {
        UUID ownerId = insertUser();
        UUID goalId = UUID.randomUUID();
        goals.saveAndFlush(new Goal(goalId, ownerId, "Casa", 100000L, null, null, GoalIconKey.HOME));

        String stored = jdbc.queryForObject("SELECT icon_key FROM goals WHERE id = ?", String.class, goalId);
        assertEquals("home", stored);

        Goal reloaded = goals.findByIdAndUserId(goalId, ownerId).orElseThrow();
        assertEquals(GoalIconKey.HOME, reloaded.getIconKey());
    }

    @Test
    void databaseRejectsZeroTargetAndNonPositiveContribution() {
        UUID ownerId = insertUser();
        UUID goalId = UUID.randomUUID();
        assertThrows(DataIntegrityViolationException.class, () -> jdbc.update("""
                INSERT INTO goals
                    (id, user_id, title, target_amount_cents, deadline, note, icon_key, created_at, updated_at)
                VALUES (?, ?, 'Zero', 0, NULL, NULL, 'other', now(), now())
                """, goalId, ownerId));

        goals.saveAndFlush(new Goal(goalId, ownerId, "Ok", 100000L, null, null, GoalIconKey.OTHER));

        assertThrows(DataIntegrityViolationException.class, () -> jdbc.update("""
                INSERT INTO goal_contributions (id, goal_id, amount_cents, occurred_at, note, created_at)
                VALUES (?, ?, 0, now(), NULL, now())
                """, UUID.randomUUID(), goalId));
        assertThrows(DataIntegrityViolationException.class, () -> jdbc.update("""
                INSERT INTO goal_contributions (id, goal_id, amount_cents, occurred_at, note, created_at)
                VALUES (?, ?, -1, now(), NULL, now())
                """, UUID.randomUUID(), goalId));
    }

    @Test
    void deletingGoalCascadesContributions() {
        UUID ownerId = insertUser();
        Goal goal = goals.saveAndFlush(new Goal(UUID.randomUUID(), ownerId, "Cascade", 100000L, null, null, GoalIconKey.OTHER));
        contributions.saveAndFlush(new GoalContribution(
                UUID.randomUUID(),
                goal.getId(),
                20000L,
                Instant.parse("2026-10-12T15:00:00Z"),
                null
        ));
        contributions.saveAndFlush(new GoalContribution(
                UUID.randomUUID(),
                goal.getId(),
                30000L,
                Instant.parse("2026-10-13T15:00:00Z"),
                null
        ));

        goals.delete(goal);
        goals.flush();

        Integer goalCount = jdbc.queryForObject("SELECT COUNT(*) FROM goals WHERE id = ?", Integer.class, goal.getId());
        Integer contributionCount = jdbc.queryForObject(
                "SELECT COUNT(*) FROM goal_contributions WHERE goal_id = ?",
                Integer.class,
                goal.getId()
        );
        assertEquals(0, goalCount);
        assertEquals(0, contributionCount);
        assertTrue(contributions.findAllByGoalIdOrderByOccurredAtDesc(goal.getId()).isEmpty());
    }

    private UUID insertUser() {
        UUID id = UUID.randomUUID();
        jdbc.update("""
                INSERT INTO users (id, email, password_hash, display_name, created_at, updated_at)
                VALUES (?, ?, ?, ?, now(), now())
                """, id, "goal-repo-" + id + "@example.com", "$2a$10$testhashnotusedforloginxxxxxxxxxxxx", "Goal Repo");
        return id;
    }
}
