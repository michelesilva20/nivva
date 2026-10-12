package com.nivva.api.transaction;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIf;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import tools.jackson.databind.ObjectMapper;
import com.nivva.api.TestcontainersConfiguration;
import com.nivva.api.support.TestAuth;

@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
@EnabledIf(value = "com.nivva.api.support.DockerAvailability#available", disabledReason = "Docker is not running")
class TransactionApiIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void expenseLifecycle() throws Exception {
        String bearer = TestAuth.register(mockMvc, objectMapper, "Owner A").bearer();
        UUID mainId = TestAuth.defaultAccountId(mockMvc, objectMapper, bearer);
        UUID reserveId = TestAuth.createAccount(mockMvc, objectMapper, bearer, "Reserva", "DIGITAL");

        MvcResult created = mockMvc.perform(post("/api/v1/transactions")
                        .header("Authorization", bearer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(expenseJson("Mercado", "food", mainId, -10000)))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", containsString("/api/v1/transactions/")))
                .andExpect(jsonPath("$.type").value("EXPENSE"))
                .andExpect(jsonPath("$.amountCents").value(-10000))
                .andExpect(jsonPath("$.occurredAt").value("2026-09-29T16:30:00Z"))
                .andExpect(jsonPath("$.accountId").value(mainId.toString()))
                .andReturn();

        String id = objectMapper.readTree(created.getResponse().getContentAsString()).get("id").asText();

        mockMvc.perform(get("/api/v1/transactions/" + id).header("Authorization", bearer))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Mercado"));

        mockMvc.perform(get("/api/v1/transactions").header("Authorization", bearer))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id=='" + id + "')]").exists());

        mockMvc.perform(put("/api/v1/transactions/" + id)
                        .header("Authorization", bearer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(expenseJson("Mercado", "transport", reserveId, -15000)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id))
                .andExpect(jsonPath("$.amountCents").value(-15000))
                .andExpect(jsonPath("$.categoryId").value("transport"))
                .andExpect(jsonPath("$.accountId").value(reserveId.toString()));

        mockMvc.perform(delete("/api/v1/transactions/" + id).header("Authorization", bearer))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/transactions/" + id).header("Authorization", bearer))
                .andExpect(status().isNotFound());
    }

    @Test
    void incomeIsCreated() throws Exception {
        String bearer = TestAuth.register(mockMvc, objectMapper, "Owner Income").bearer();
        UUID accountId = TestAuth.defaultAccountId(mockMvc, objectMapper, bearer);
        mockMvc.perform(post("/api/v1/transactions")
                        .header("Authorization", bearer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "type": "INCOME",
                                  "title": "Freelance",
                                  "categoryId": "income",
                                  "accountId": "%s",
                                  "amountCents": 100000,
                                  "occurredAt": "2026-09-29T13:30:00-03:00"
                                }
                                """.formatted(accountId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.type").value("INCOME"))
                .andExpect(jsonPath("$.amountCents").value(100000));
    }

    @Test
    void invalidSignIsUnprocessable() throws Exception {
        String bearer = TestAuth.register(mockMvc, objectMapper, "Owner Sign").bearer();
        UUID accountId = TestAuth.defaultAccountId(mockMvc, objectMapper, bearer);
        mockMvc.perform(post("/api/v1/transactions")
                        .header("Authorization", bearer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(expenseJson("Mercado", "food", accountId, 10000)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.status").value(422));
    }

    @Test
    void incompatibleCategoryIsUnprocessable() throws Exception {
        String bearer = TestAuth.register(mockMvc, objectMapper, "Owner Category").bearer();
        UUID accountId = TestAuth.defaultAccountId(mockMvc, objectMapper, bearer);
        mockMvc.perform(post("/api/v1/transactions")
                        .header("Authorization", bearer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "type": "INCOME",
                                  "title": "Freelance",
                                  "categoryId": "food",
                                  "accountId": "%s",
                                  "amountCents": 100000,
                                  "occurredAt": "2026-09-29T13:30:00-03:00"
                                }
                                """.formatted(accountId)))
                .andExpect(status().isUnprocessableEntity());
    }

    @Test
    void unknownAccountIsUnprocessable() throws Exception {
        String bearer = TestAuth.register(mockMvc, objectMapper, "Owner Account").bearer();
        mockMvc.perform(post("/api/v1/transactions")
                        .header("Authorization", bearer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(expenseJson("Mercado", "food", UUID.randomUUID(), -10000)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.detail").value("Account was not found"));
    }

    @Test
    void missingTitleIsBadRequest() throws Exception {
        String bearer = TestAuth.register(mockMvc, objectMapper, "Owner Title").bearer();
        UUID accountId = TestAuth.defaultAccountId(mockMvc, objectMapper, bearer);
        mockMvc.perform(post("/api/v1/transactions")
                        .header("Authorization", bearer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(expenseJson("", "food", accountId, -10000)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.title").exists());
    }

    @Test
    void categoriesRemainPublicReferenceData() throws Exception {
        mockMvc.perform(get("/api/v1/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id=='food')].kind").value("EXPENSE"))
                .andExpect(jsonPath("$[?(@.id=='income')].kind").value("INCOME"));
    }

    private static String expenseJson(String title, String categoryId, UUID accountId, int amountCents) {
        return """
                {
                  "type": "EXPENSE",
                  "title": "%s",
                  "categoryId": "%s",
                  "accountId": "%s",
                  "amountCents": %d,
                  "occurredAt": "2026-09-29T13:30:00-03:00"
                }
                """.formatted(title, categoryId, accountId, amountCents);
    }
}
