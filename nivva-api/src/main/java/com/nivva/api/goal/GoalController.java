package com.nivva.api.goal;

import java.net.URI;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.nivva.api.auth.AuthenticatedUser;
import com.nivva.api.goal.dto.ContributeGoalResponse;
import com.nivva.api.goal.dto.CreateContributionRequest;
import com.nivva.api.goal.dto.CreateGoalRequest;
import com.nivva.api.goal.dto.GoalContributionResponse;
import com.nivva.api.goal.dto.GoalResponse;
import com.nivva.api.goal.dto.UpdateGoalRequest;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/goals")
@Tag(name = "Goals")
@SecurityRequirement(name = "bearer-jwt")
public class GoalController {

    private final GoalService goals;

    public GoalController(GoalService goals) {
        this.goals = goals;
    }

    @GetMapping
    @Operation(summary = "List goals of the authenticated user")
    public List<GoalResponse> list(Authentication authentication) {
        return goals.findAll(AuthenticatedUser.requireId(authentication));
    }

    @PostMapping
    @Operation(summary = "Create a goal")
    @ApiResponse(responseCode = "201", description = "Goal created")
    public ResponseEntity<GoalResponse> create(
            Authentication authentication,
            @Valid @RequestBody CreateGoalRequest request
    ) {
        GoalResponse created = goals.create(AuthenticatedUser.requireId(authentication), request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(created.id())
                .toUri();
        return ResponseEntity.created(location).body(created);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a goal by id")
    public GoalResponse get(Authentication authentication, @PathVariable UUID id) {
        return goals.findById(AuthenticatedUser.requireId(authentication), id);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Replace a goal")
    public GoalResponse update(
            Authentication authentication,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateGoalRequest request
    ) {
        return goals.update(AuthenticatedUser.requireId(authentication), id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a goal and its contributions")
    public void delete(Authentication authentication, @PathVariable UUID id) {
        goals.delete(AuthenticatedUser.requireId(authentication), id);
    }

    @GetMapping("/{goalId}/contributions")
    @Operation(summary = "List contributions of a goal")
    public List<GoalContributionResponse> listContributions(
            Authentication authentication,
            @PathVariable UUID goalId
    ) {
        return goals.listContributions(AuthenticatedUser.requireId(authentication), goalId);
    }

    @PostMapping("/{goalId}/contributions")
    @Operation(summary = "Register progress on a goal")
    @ApiResponse(responseCode = "201", description = "Contribution created")
    public ResponseEntity<ContributeGoalResponse> contribute(
            Authentication authentication,
            @PathVariable UUID goalId,
            @Valid @RequestBody CreateContributionRequest request
    ) {
        ContributeGoalResponse created = goals.contribute(
                AuthenticatedUser.requireId(authentication),
                goalId,
                request
        );
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(created.contribution().id())
                .toUri();
        return ResponseEntity.created(location).body(created);
    }
}
