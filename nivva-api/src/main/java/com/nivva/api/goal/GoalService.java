package com.nivva.api.goal;

import java.time.Clock;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nivva.api.common.error.GoalNotFoundException;
import com.nivva.api.goal.dto.ContributeGoalResponse;
import com.nivva.api.goal.dto.CreateContributionRequest;
import com.nivva.api.goal.dto.CreateGoalRequest;
import com.nivva.api.goal.dto.GoalContributionResponse;
import com.nivva.api.goal.dto.GoalResponse;
import com.nivva.api.goal.dto.UpdateGoalRequest;

@Service
public class GoalService {

    private static final Logger log = LoggerFactory.getLogger(GoalService.class);

    private final GoalRepository goals;
    private final GoalContributionRepository contributions;
    private final Clock clock;

    public GoalService(GoalRepository goals, GoalContributionRepository contributions, Clock clock) {
        this.goals = goals;
        this.contributions = contributions;
        this.clock = clock;
    }

    @Transactional
    public GoalResponse create(UUID userId, CreateGoalRequest request) {
        String title = GoalRules.normalizeTitle(request.title());
        long targetAmountCents = GoalRules.requireTargetAmount(request.targetAmountCents());
        GoalRules.requireCreateDeadline(request.deadline(), today());
        String note = GoalRules.normalizeNote(request.note());
        GoalIconKey iconKey = GoalRules.requireIcon(request.iconKey());

        Goal goal = new Goal(
                UUID.randomUUID(),
                userId,
                title,
                targetAmountCents,
                request.deadline(),
                note,
                iconKey
        );
        Goal saved = goals.save(goal);
        log.info("Created goal {} for user {}", saved.getId(), userId);
        return GoalResponse.from(saved, GoalProgress.of(saved.getTargetAmountCents(), 0L));
    }

    @Transactional(readOnly = true)
    public List<GoalResponse> findAll(UUID userId) {
        List<Goal> owned = goals.findAllByUserId(userId);
        Map<UUID, Long> totals = sumByGoalIds(owned.stream().map(Goal::getId).toList());
        return owned.stream()
                .map(goal -> toResponse(goal, totals.getOrDefault(goal.getId(), 0L)))
                .sorted(listOrder())
                .toList();
    }

    @Transactional(readOnly = true)
    public GoalResponse findById(UUID userId, UUID id) {
        Goal goal = requireOwned(userId, id);
        return toResponse(goal, contributions.sumAmountByGoalId(goal.getId()));
    }

    @Transactional
    public GoalResponse update(UUID userId, UUID id, UpdateGoalRequest request) {
        Goal goal = requireOwnedForUpdate(userId, id);
        long currentAmountCents = contributions.sumAmountByGoalId(goal.getId());
        String title = GoalRules.normalizeTitle(request.title());
        long targetAmountCents = GoalRules.requireTargetAmount(request.targetAmountCents());
        GoalRules.requireTargetAtLeastCurrent(targetAmountCents, currentAmountCents);
        GoalRules.requireUpdateDeadline(goal.getDeadline(), request.deadline(), today());
        String note = GoalRules.normalizeNote(request.note());
        GoalIconKey iconKey = GoalRules.requireIcon(request.iconKey());

        goal.replace(title, targetAmountCents, request.deadline(), note, iconKey);
        log.info("Updated goal {} for user {}", id, userId);
        return toResponse(goal, currentAmountCents);
    }

    @Transactional
    public void delete(UUID userId, UUID id) {
        Goal goal = requireOwned(userId, id);
        goals.delete(goal);
        log.info("Deleted goal {} for user {}", id, userId);
    }

    @Transactional(readOnly = true)
    public List<GoalContributionResponse> listContributions(UUID userId, UUID goalId) {
        requireOwned(userId, goalId);
        return contributions.findAllByGoalIdOrderByOccurredAtDesc(goalId).stream()
                .map(GoalContributionResponse::from)
                .toList();
    }

    @Transactional
    public ContributeGoalResponse contribute(UUID userId, UUID goalId, CreateContributionRequest request) {
        Goal goal = requireOwnedForUpdate(userId, goalId);
        long currentAmountCents = contributions.sumAmountByGoalId(goal.getId());
        GoalProgress progress = GoalProgress.of(goal.getTargetAmountCents(), currentAmountCents);
        long amountCents = GoalRules.requireContributionAmount(request.amountCents());
        GoalRules.requireCanContribute(progress, amountCents);
        String note = GoalRules.normalizeNote(request.note());

        GoalContribution contribution = new GoalContribution(
                UUID.randomUUID(),
                goal.getId(),
                amountCents,
                request.occurredAt().toInstant(),
                note
        );
        GoalContribution saved = contributions.save(contribution);
        GoalProgress next = GoalProgress.of(goal.getTargetAmountCents(), currentAmountCents + amountCents);
        log.info("Created contribution {} for goal {} user {}", saved.getId(), goalId, userId);
        return new ContributeGoalResponse(
                GoalContributionResponse.from(saved),
                GoalResponse.from(goal, next)
        );
    }

    private LocalDate today() {
        return LocalDate.now(clock);
    }

    private Goal requireOwned(UUID userId, UUID id) {
        return goals.findByIdAndUserId(id, userId).orElseThrow(GoalNotFoundException::new);
    }

    private Goal requireOwnedForUpdate(UUID userId, UUID id) {
        return goals.findByIdAndUserIdForUpdate(id, userId).orElseThrow(GoalNotFoundException::new);
    }

    private Map<UUID, Long> sumByGoalIds(List<UUID> goalIds) {
        if (goalIds.isEmpty()) {
            return Map.of();
        }
        Map<UUID, Long> totals = new HashMap<>();
        for (GoalContributionRepository.GoalAmountTotal row : contributions.sumByGoalIds(goalIds)) {
            totals.put(row.getGoalId(), row.getTotal());
        }
        return totals;
    }

    private static GoalResponse toResponse(Goal goal, long currentAmountCents) {
        return GoalResponse.from(goal, GoalProgress.of(goal.getTargetAmountCents(), currentAmountCents));
    }

    private static Comparator<GoalResponse> listOrder() {
        return Comparator
                .comparing((GoalResponse goal) -> goal.status() == GoalStatus.COMPLETED)
                .thenComparing(GoalResponse::createdAt, Comparator.reverseOrder());
    }
}
