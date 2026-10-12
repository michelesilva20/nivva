package com.nivva.api.goal.dto;

public record ContributeGoalResponse(
        GoalContributionResponse contribution,
        GoalResponse goal
) {
}
