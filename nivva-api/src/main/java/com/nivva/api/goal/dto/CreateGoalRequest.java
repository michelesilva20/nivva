package com.nivva.api.goal.dto;

import java.time.LocalDate;

import com.nivva.api.goal.GoalIconKey;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateGoalRequest(
        @NotBlank @Size(max = 120) String title,
        @NotNull Long targetAmountCents,
        LocalDate deadline,
        @Size(max = 500) String note,
        GoalIconKey iconKey
) {
}
