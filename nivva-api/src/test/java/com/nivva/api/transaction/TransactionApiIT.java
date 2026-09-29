package com.nivva.api.transaction;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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
        MvcResult created = mockMvc.perform(post("/api/v1/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "type": "EXPENSE",
                                  "title": "Mercado",
                                  "categoryId": "food",
                                  "accountId": "main",
                                  "amountCents": -10000,
                                  "occurredAt": "2026-09-29T13:30:00-03:00"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", containsString("/api/v1/transactions/")))
                .andExpect(jsonPath("$.type").value("EXPENSE"))
                .andExpect(jsonPath("$.amountCents").value(-10000))
                .andExpect(jsonPath("$.occurredAt").value("2026-09-29T16:30:00Z"))
                .andReturn();

        String id = objectMapper.readTree(created.getResponse().getContentAsString()).get("id").asText();

        mockMvc.perform(get("/api/v1/transactions/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Mercado"));

        mockMvc.perform(get("/api/v1/transactions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id=='" + id + "')]").exists());

        mockMvc.perform(put("/api/v1/transactions/" + id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "type": "EXPENSE",
                                  "title": "Mercado",
                                  "categoryId": "transport",
                                  "accountId": "reserve",
                                  "amountCents": -15000,
                                  "occurredAt": "2026-09-29T13:30:00-03:00"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id))
                .andExpect(jsonPath("$.amountCents").value(-15000))
                .andExpect(jsonPath("$.categoryId").value("transport"))
                .andExpect(jsonPath("$.accountId").value("reserve"));

        mockMvc.perform(delete("/api/v1/transactions/" + id))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/transactions/" + id))
                .andExpect(status().isNotFound());
    }

    @Test
    void incomeIsCreated() throws Exception {
        mockMvc.perform(post("/api/v1/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "type": "INCOME",
                                  "title": "Freelance",
                                  "categoryId": "income",
                                  "accountId": "main",
                                  "amountCents": 100000,
                                  "occurredAt": "2026-09-29T13:30:00-03:00"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.type").value("INCOME"))
                .andExpect(jsonPath("$.amountCents").value(100000));
    }

    @Test
    void invalidSignIsUnprocessable() throws Exception {
        mockMvc.perform(post("/api/v1/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "type": "EXPENSE",
                                  "title": "Mercado",
                                  "categoryId": "food",
                                  "accountId": "main",
                                  "amountCents": 10000,
                                  "occurredAt": "2026-09-29T13:30:00-03:00"
                                }
                                """))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.status").value(422));
    }

    @Test
    void incompatibleCategoryIsUnprocessable() throws Exception {
        mockMvc.perform(post("/api/v1/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "type": "INCOME",
                                  "title": "Freelance",
                                  "categoryId": "food",
                                  "accountId": "main",
                                  "amountCents": 100000,
                                  "occurredAt": "2026-09-29T13:30:00-03:00"
                                }
                                """))
                .andExpect(status().isUnprocessableEntity());
    }

    @Test
    void unknownAccountIsUnprocessable() throws Exception {
        mockMvc.perform(post("/api/v1/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "type": "EXPENSE",
                                  "title": "Mercado",
                                  "categoryId": "food",
                                  "accountId": "bitcoin-wallet-from-mars",
                                  "amountCents": -10000,
                                  "occurredAt": "2026-09-29T13:30:00-03:00"
                                }
                                """))
                .andExpect(status().isUnprocessableEntity());
    }

    @Test
    void missingTitleIsBadRequest() throws Exception {
        mockMvc.perform(post("/api/v1/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "type": "EXPENSE",
                                  "title": "",
                                  "categoryId": "food",
                                  "accountId": "main",
                                  "amountCents": -10000,
                                  "occurredAt": "2026-09-29T13:30:00-03:00"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.title").exists());
    }

    @Test
    void referenceDataIsSeeded() throws Exception {
        mockMvc.perform(get("/api/v1/accounts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id=='main')]").exists())
                .andExpect(jsonPath("$[?(@.id=='reserve')]").exists());

        mockMvc.perform(get("/api/v1/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id=='food')].kind").value("EXPENSE"))
                .andExpect(jsonPath("$[?(@.id=='income')].kind").value("INCOME"));
    }
}
