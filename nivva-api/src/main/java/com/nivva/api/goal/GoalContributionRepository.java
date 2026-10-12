package com.nivva.api.goal;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface GoalContributionRepository extends JpaRepository<GoalContribution, UUID> {

    List<GoalContribution> findAllByGoalIdOrderByOccurredAtDesc(UUID goalId);

    @Query("""
            SELECT COALESCE(SUM(c.amountCents), 0)
            FROM GoalContribution c
            WHERE c.goalId = :goalId
            """)
    long sumAmountByGoalId(@Param("goalId") UUID goalId);

    @Query("""
            SELECT c.goalId AS goalId, COALESCE(SUM(c.amountCents), 0) AS total
            FROM GoalContribution c
            WHERE c.goalId IN :goalIds
            GROUP BY c.goalId
            """)
    List<GoalAmountTotal> sumByGoalIds(@Param("goalIds") Collection<UUID> goalIds);

    interface GoalAmountTotal {
        UUID getGoalId();

        long getTotal();
    }
}
