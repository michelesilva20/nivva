package com.nivva.api.goal;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIf;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import com.nivva.api.TestcontainersConfiguration;
import com.nivva.api.support.TestAuth;

import tools.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
@EnabledIf(value = "com.nivva.api.support.DockerAvailability#available", disabledReason = "Docker is not running")
class GoalOwnershipIT {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void userBCannotSeeOrMutateUserAGoal() throws Exception {
        var userA = TestAuth.register(mockMvc, objectMapper, "Goal A");
        var userB = TestAuth.register(mockMvc, objectMapper, "Goal B");

        MvcResult created = mockMvc.perform(post("/api/v1/goals")
                        .header("Authorization", userA.bearer())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"title":"Meta A","targetAmountCents":100000,"iconKey":"home"}
                                """))
                .andExpect(status().isCreated())
                .andReturn();
        String goalA = objectMapper.readTree(created.getResponse().getContentAsString()).get("id").asText();

        mockMvc.perform(get("/api/v1/goals").header("Authorization", userB.bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id=='" + goalA + "')]").doesNotExist());

        mockMvc.perform(get("/api/v1/goals/" + goalA).header("Authorization", userB.bearer()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Goal not found"));

        mockMvc.perform(put("/api/v1/goals/" + goalA)
                        .header("Authorization", userB.bearer())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"title":"Hack","targetAmountCents":1,"iconKey":"other"}
                                """))
                .andExpect(status().isNotFound());

        mockMvc.perform(delete("/api/v1/goals/" + goalA).header("Authorization", userB.bearer()))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/v1/goals/" + goalA + "/contributions")
                        .header("Authorization", userB.bearer()))
                .andExpect(status().isNotFound());

        mockMvc.perform(post("/api/v1/goals/" + goalA + "/contributions")
                        .header("Authorization", userB.bearer())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"amountCents":100,"occurredAt":"2026-10-12T12:00:00-03:00"}
                                """))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/v1/goals/" + goalA).header("Authorization", userA.bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Meta A"));
    }
}
