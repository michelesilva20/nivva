package com.nivva.api.goal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.OffsetDateTime;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIf;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;

import com.nivva.api.TestcontainersConfiguration;
import com.nivva.api.common.error.InvalidGoalException;
import com.nivva.api.goal.dto.CreateContributionRequest;
import com.nivva.api.goal.dto.CreateGoalRequest;
import com.nivva.api.goal.dto.GoalResponse;

@SpringBootTest
@Import(TestcontainersConfiguration.class)
@EnabledIf(value = "com.nivva.api.support.DockerAvailability#available", disabledReason = "Docker is not running")
class GoalConcurrencyIT {

    /**
     * PostgreSQL serializes the two transactions on {@code SELECT … FOR UPDATE} of the same Goal row.
     * The second caller then sees the updated SUM and fails with {@link InvalidGoalException}, not a deadlock.
     */

    @Autowired
    private GoalService goals;
    @Autowired
    private JdbcTemplate jdbc;

    @Test
    void concurrentContributionsCannotExceedTarget() throws Exception {
        UUID userId = insertUser();
        GoalResponse goal = goals.create(
                userId,
                new CreateGoalRequest("Race", 20000L, null, null, GoalIconKey.OTHER)
        );

        CountDownLatch start = new CountDownLatch(1);
        CountDownLatch done = new CountDownLatch(2);
        AtomicInteger successes = new AtomicInteger();
        AtomicInteger semanticFailures = new AtomicInteger();
        AtomicInteger unexpected = new AtomicInteger();
        ExecutorService pool = Executors.newFixedThreadPool(2);

        Runnable attempt = () -> {
            try {
                start.await();
                goals.contribute(
                        userId,
                        goal.id(),
                        new CreateContributionRequest(15000L, OffsetDateTime.parse("2026-10-12T12:00:00-03:00"), null)
                );
                successes.incrementAndGet();
            } catch (InvalidGoalException exception) {
                semanticFailures.incrementAndGet();
            } catch (Exception exception) {
                unexpected.incrementAndGet();
            } finally {
                done.countDown();
            }
        };

        pool.submit(attempt);
        pool.submit(attempt);
        start.countDown();
        assertTrue(done.await(15, TimeUnit.SECONDS), "threads did not finish");
        pool.shutdown();

        GoalResponse after = goals.findById(userId, goal.id());
        assertEquals(0, unexpected.get(), "unexpected exceptions during concurrent contribute");
        assertEquals(1, successes.get());
        assertEquals(1, semanticFailures.get());
        assertTrue(after.currentAmountCents() <= after.targetAmountCents());
        assertEquals(15000L, after.currentAmountCents());
        assertEquals(GoalStatus.ACTIVE, after.status());
    }

    private UUID insertUser() {
        UUID id = UUID.randomUUID();
        jdbc.update("""
                INSERT INTO users (id, email, password_hash, display_name, created_at, updated_at)
                VALUES (?, ?, ?, ?, now(), now())
                """, id, "goal-race-" + id + "@example.com", "$2a$10$testhashnotusedforloginxxxxxxxxxxxx", "Goal Race");
        return id;
    }
}
