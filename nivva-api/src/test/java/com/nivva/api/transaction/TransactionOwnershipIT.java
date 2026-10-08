package com.nivva.api.transaction;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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
import com.nivva.api.support.TestAuth;

import tools.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
@EnabledIf(value = "com.nivva.api.support.DockerAvailability#available", disabledReason = "Docker is not running")
class TransactionOwnershipIT {

    private static final String EXPENSE = """
            {
              "type": "EXPENSE",
              "title": "Mercado A",
              "categoryId": "food",
              "accountId": "main",
              "amountCents": -10000,
              "occurredAt": "2026-09-29T13:30:00-03:00",
              "userId": "11111111-1111-1111-1111-111111111111"
            }
            """;

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private JdbcTemplate jdbc;

    @Test
    void userBCannotSeeOrMutateUserATransaction() throws Exception {
        var userA = TestAuth.register(mockMvc, objectMapper, "User A");
        var userB = TestAuth.register(mockMvc, objectMapper, "User B");

        MvcResult created = mockMvc.perform(post("/api/v1/transactions")
                        .header("Authorization", userA.bearer())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(EXPENSE))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.userId").doesNotExist())
                .andReturn();
        String id = objectMapper.readTree(created.getResponse().getContentAsString()).get("id").asText();

        UUID storedOwner = jdbc.queryForObject(
                "select user_id from transactions where id = ?",
                UUID.class,
                UUID.fromString(id)
        );
        assertEquals(UUID.fromString(userA.id()), storedOwner);

        mockMvc.perform(get("/api/v1/transactions").header("Authorization", userA.bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id=='" + id + "')]").exists());

        mockMvc.perform(get("/api/v1/transactions").header("Authorization", userB.bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id=='" + id + "')]").doesNotExist());

        mockMvc.perform(get("/api/v1/transactions/" + id).header("Authorization", userA.bearer()))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/transactions/" + id).header("Authorization", userB.bearer()))
                .andExpect(status().isNotFound());

        mockMvc.perform(put("/api/v1/transactions/" + id)
                        .header("Authorization", userB.bearer())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "type": "EXPENSE",
                                  "title": "Hack",
                                  "categoryId": "food",
                                  "accountId": "main",
                                  "amountCents": -1,
                                  "occurredAt": "2026-09-29T13:30:00-03:00"
                                }
                                """))
                .andExpect(status().isNotFound());

        mockMvc.perform(delete("/api/v1/transactions/" + id).header("Authorization", userB.bearer()))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/v1/transactions/" + id).header("Authorization", userA.bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Mercado A"));
    }

    @Test
    void transactionsRequireAuthentication() throws Exception {
        mockMvc.perform(get("/api/v1/transactions"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
        mockMvc.perform(post("/api/v1/transactions").contentType(MediaType.APPLICATION_JSON).content(EXPENSE))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(put("/api/v1/transactions/" + UUID.randomUUID())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(EXPENSE))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(delete("/api/v1/transactions/" + UUID.randomUUID()))
                .andExpect(status().isUnauthorized());
    }
}
