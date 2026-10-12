package com.nivva.api.goal;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIf;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import com.nivva.api.TestcontainersConfiguration;
import com.nivva.api.common.NivvaClockConfig;
import com.nivva.api.support.TestAuth;

import tools.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
@EnabledIf(value = "com.nivva.api.support.DockerAvailability#available", disabledReason = "Docker is not running")
class GoalApiIT {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private JdbcTemplate jdbc;

    @Test
    void unauthenticatedGoalsAreRejected() throws Exception {
        mockMvc.perform(get("/api/v1/goals")).andExpect(status().isUnauthorized());
        mockMvc.perform(post("/api/v1/goals")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(goalJson("Meta", 100000, null, "other")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void goalLifecycleAndDerivedAmounts() throws Exception {
        String bearer = TestAuth.register(mockMvc, objectMapper, "Goal Owner").bearer();

        MvcResult created = mockMvc.perform(post("/api/v1/goals")
                        .header("Authorization", bearer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(goalJson("  Meta A  ", 100000, "2026-12-01", "travel")))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", containsString("/api/v1/goals/")))
                .andExpect(jsonPath("$.title").value("Meta A"))
                .andExpect(jsonPath("$.targetAmountCents").value(100000))
                .andExpect(jsonPath("$.currentAmountCents").value(0))
                .andExpect(jsonPath("$.remainingAmountCents").value(100000))
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.iconKey").value("travel"))
                .andExpect(jsonPath("$.deadline").value("2026-12-01"))
                .andExpect(jsonPath("$.userId").doesNotExist())
                .andExpect(jsonPath("$.progress").doesNotExist())
                .andReturn();
        String goalId = objectMapper.readTree(created.getResponse().getContentAsString()).get("id").asText();

        contribute(bearer, goalId, 20000);
        contribute(bearer, goalId, 30000);

        mockMvc.perform(get("/api/v1/goals/" + goalId).header("Authorization", bearer))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentAmountCents").value(50000))
                .andExpect(jsonPath("$.remainingAmountCents").value(50000))
                .andExpect(jsonPath("$.status").value("ACTIVE"));

        mockMvc.perform(get("/api/v1/goals/" + goalId + "/contributions").header("Authorization", bearer))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));

        mockMvc.perform(post("/api/v1/goals/" + goalId + "/contributions")
                        .header("Authorization", bearer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(contributionJson(50000)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.contribution.amountCents").value(50000))
                .andExpect(jsonPath("$.contribution.userId").doesNotExist())
                .andExpect(jsonPath("$.goal.currentAmountCents").value(100000))
                .andExpect(jsonPath("$.goal.remainingAmountCents").value(0))
                .andExpect(jsonPath("$.goal.status").value("COMPLETED"));

        mockMvc.perform(post("/api/v1/goals/" + goalId + "/contributions")
                        .header("Authorization", bearer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(contributionJson(1)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.detail").value(GoalRules.COMPLETED_BLOCKS_CONTRIBUTION));

        mockMvc.perform(put("/api/v1/goals/" + goalId)
                        .header("Authorization", bearer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(goalJson("Meta A", 150000, "2026-12-01", "travel")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.remainingAmountCents").value(50000));

        mockMvc.perform(get("/api/v1/goals/" + goalId + "/contributions").header("Authorization", bearer))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3));

        mockMvc.perform(delete("/api/v1/goals/" + goalId).header("Authorization", bearer))
                .andExpect(status().isNoContent());
        mockMvc.perform(get("/api/v1/goals/" + goalId).header("Authorization", bearer))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Goal not found"));
        mockMvc.perform(get("/api/v1/goals/" + goalId + "/contributions").header("Authorization", bearer))
                .andExpect(status().isNotFound());
    }

    @Test
    void targetCannotDropBelowCurrent() throws Exception {
        String bearer = TestAuth.register(mockMvc, objectMapper, "Target Owner").bearer();
        String goalId = createGoal(bearer, "Meta", 100000);
        contribute(bearer, goalId, 100000);

        mockMvc.perform(put("/api/v1/goals/" + goalId)
                        .header("Authorization", bearer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(goalJson("Meta", 90000, null, "other")))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.detail").value(GoalRules.TARGET_BELOW_CURRENT));

        mockMvc.perform(put("/api/v1/goals/" + goalId)
                        .header("Authorization", bearer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(goalJson("Meta", 100000, null, "other")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"));
    }

    @Test
    void contributionCannotExceedRemaining() throws Exception {
        String bearer = TestAuth.register(mockMvc, objectMapper, "Remain Owner").bearer();
        String goalId = createGoal(bearer, "Meta", 100000);
        contribute(bearer, goalId, 80000);

        mockMvc.perform(post("/api/v1/goals/" + goalId + "/contributions")
                        .header("Authorization", bearer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(contributionJson(30000)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.detail").value(GoalRules.CONTRIBUTION_EXCEEDS_REMAINING));

        mockMvc.perform(post("/api/v1/goals/" + goalId + "/contributions")
                        .header("Authorization", bearer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(contributionJson(0)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.detail").value(GoalRules.AMOUNT_NOT_POSITIVE));
    }

    @Test
    void deadlineRules() throws Exception {
        String bearer = TestAuth.register(mockMvc, objectMapper, "Deadline Owner").bearer();
        LocalDate today = LocalDate.now(NivvaClockConfig.ZONE);

        mockMvc.perform(post("/api/v1/goals")
                        .header("Authorization", bearer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(goalJson("Passado", 100000, today.minusDays(1).toString(), "other")))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.detail").value(GoalRules.DEADLINE_IN_PAST));

        mockMvc.perform(post("/api/v1/goals")
                        .header("Authorization", bearer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(goalJson("Hoje", 100000, today.toString(), "other")))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/v1/goals")
                        .header("Authorization", bearer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(goalJson("Futuro", 100000, today.plusDays(10).toString(), "other")))
                .andExpect(status().isCreated());

        var expiredUser = TestAuth.register(mockMvc, objectMapper, "Expired Goal");
        UUID expiredId = UUID.randomUUID();
        jdbc.update("""
                INSERT INTO goals
                    (id, user_id, title, target_amount_cents, deadline, note, icon_key, created_at, updated_at)
                VALUES (?, ?, 'Antiga', 100000, DATE '2026-01-01', NULL, 'other', now(), now())
                """, expiredId, UUID.fromString(expiredUser.id()));

        mockMvc.perform(put("/api/v1/goals/" + expiredId)
                        .header("Authorization", expiredUser.bearer())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(goalJson("Titulo novo", 100000, "2026-01-01", "other")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Titulo novo"))
                .andExpect(jsonPath("$.deadline").value("2026-01-01"));

        mockMvc.perform(put("/api/v1/goals/" + expiredId)
                        .header("Authorization", expiredUser.bearer())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(goalJson("Titulo novo", 100000, today.minusDays(2).toString(), "other")))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.detail").value(GoalRules.DEADLINE_IN_PAST));
    }

    @Test
    void listOrdersActiveBeforeCompleted() throws Exception {
        String bearer = TestAuth.register(mockMvc, objectMapper, "Sort Owner").bearer();
        String completedId = createGoal(bearer, "Concluida", 10000);
        contribute(bearer, completedId, 10000);
        createGoal(bearer, "Ativa", 10000);

        mockMvc.perform(get("/api/v1/goals").header("Authorization", bearer))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Ativa"))
                .andExpect(jsonPath("$[0].status").value("ACTIVE"))
                .andExpect(jsonPath("$[1].title").value("Concluida"))
                .andExpect(jsonPath("$[1].status").value("COMPLETED"));
    }

    private String createGoal(String bearer, String title, int target) throws Exception {
        MvcResult created = mockMvc.perform(post("/api/v1/goals")
                        .header("Authorization", bearer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(goalJson(title, target, null, "other")))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(created.getResponse().getContentAsString()).get("id").asText();
    }

    private void contribute(String bearer, String goalId, int amount) throws Exception {
        mockMvc.perform(post("/api/v1/goals/" + goalId + "/contributions")
                        .header("Authorization", bearer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(contributionJson(amount)))
                .andExpect(status().isCreated());
    }

    private static String goalJson(String title, int target, String deadline, String iconKey) {
        String deadlineJson = deadline == null ? "null" : "\"" + deadline + "\"";
        return """
                {
                  "title": "%s",
                  "targetAmountCents": %d,
                  "deadline": %s,
                  "iconKey": "%s"
                }
                """.formatted(title, target, deadlineJson, iconKey);
    }

    private static String contributionJson(int amount) {
        return """
                {
                  "amountCents": %d,
                  "occurredAt": "2026-10-12T12:00:00-03:00"
                }
                """.formatted(amount);
    }
}
