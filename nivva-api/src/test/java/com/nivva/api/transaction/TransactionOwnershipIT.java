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
        UUID accountA = TestAuth.defaultAccountId(mockMvc, objectMapper, userA.bearer());

        MvcResult created = mockMvc.perform(post("/api/v1/transactions")
                        .header("Authorization", userA.bearer())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(expenseJson(accountA)))
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
                        .content(expenseJson(accountA, "Hack")))
                .andExpect(status().isNotFound());

        mockMvc.perform(delete("/api/v1/transactions/" + id).header("Authorization", userB.bearer()))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/v1/transactions/" + id).header("Authorization", userA.bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Mercado A"));
    }

    @Test
    void userBCannotAttachOwnTransactionToAccountA() throws Exception {
        var userA = TestAuth.register(mockMvc, objectMapper, "Owner A");
        var userB = TestAuth.register(mockMvc, objectMapper, "Owner B");
        UUID accountA = TestAuth.defaultAccountId(mockMvc, objectMapper, userA.bearer());
        UUID accountB = TestAuth.defaultAccountId(mockMvc, objectMapper, userB.bearer());

        mockMvc.perform(post("/api/v1/transactions")
                        .header("Authorization", userB.bearer())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(expenseJson(accountA)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.detail").value("Account was not found"))
                .andExpect(jsonPath("$.detail").value(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("another"))));

        MvcResult created = mockMvc.perform(post("/api/v1/transactions")
                        .header("Authorization", userB.bearer())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(expenseJson(accountB)))
                .andExpect(status().isCreated())
                .andReturn();
        String id = objectMapper.readTree(created.getResponse().getContentAsString()).get("id").asText();

        mockMvc.perform(put("/api/v1/transactions/" + id)
                        .header("Authorization", userB.bearer())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(expenseJson(accountA, "Move")))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.detail").value("Account was not found"));
    }

    @Test
    void transactionsRequireAuthentication() throws Exception {
        UUID accountId = UUID.randomUUID();
        mockMvc.perform(get("/api/v1/transactions"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
        mockMvc.perform(post("/api/v1/transactions").contentType(MediaType.APPLICATION_JSON).content(expenseJson(accountId)))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(put("/api/v1/transactions/" + UUID.randomUUID())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(expenseJson(accountId)))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(delete("/api/v1/transactions/" + UUID.randomUUID()))
                .andExpect(status().isUnauthorized());
    }

    private static String expenseJson(UUID accountId) {
        return expenseJson(accountId, "Mercado A");
    }

    private static String expenseJson(UUID accountId, String title) {
        return """
                {
                  "type": "EXPENSE",
                  "title": "%s",
                  "categoryId": "food",
                  "accountId": "%s",
                  "amountCents": -10000,
                  "occurredAt": "2026-09-29T13:30:00-03:00",
                  "userId": "11111111-1111-1111-1111-111111111111"
                }
                """.formatted(title, accountId);
    }
}
