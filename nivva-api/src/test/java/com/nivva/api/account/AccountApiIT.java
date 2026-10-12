package com.nivva.api.account;

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
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import com.nivva.api.TestcontainersConfiguration;
import com.nivva.api.support.TestAuth;

import tools.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
@EnabledIf(value = "com.nivva.api.support.DockerAvailability#available", disabledReason = "Docker is not running")
class AccountApiIT {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void registerCreatesDefaultCheckingAccount() throws Exception {
        var user = TestAuth.register(mockMvc, objectMapper, "Default Owner");

        mockMvc.perform(get("/api/v1/accounts").header("Authorization", user.bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("Conta principal"))
                .andExpect(jsonPath("$[0].type").value("CHECKING"))
                .andExpect(jsonPath("$[0].openingBalanceCents").value(0))
                .andExpect(jsonPath("$[0].userId").doesNotExist());
    }

    @Test
    void accountLifecycle() throws Exception {
        String bearer = TestAuth.register(mockMvc, objectMapper, "Account Owner").bearer();

        MvcResult created = mockMvc.perform(post("/api/v1/accounts")
                        .header("Authorization", bearer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "  Nubank  ",
                                  "type": "DIGITAL",
                                  "openingBalanceCents": 250000
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Nubank"))
                .andExpect(jsonPath("$.type").value("DIGITAL"))
                .andExpect(jsonPath("$.openingBalanceCents").value(250000))
                .andReturn();
        String id = objectMapper.readTree(created.getResponse().getContentAsString()).get("id").asText();

        mockMvc.perform(get("/api/v1/accounts/" + id).header("Authorization", bearer))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id));

        mockMvc.perform(put("/api/v1/accounts/" + id)
                        .header("Authorization", bearer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Nubank Plus",
                                  "type": "CHECKING",
                                  "openingBalanceCents": 300000
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Nubank Plus"))
                .andExpect(jsonPath("$.type").value("CHECKING"))
                .andExpect(jsonPath("$.openingBalanceCents").value(300000));

        mockMvc.perform(delete("/api/v1/accounts/" + id).header("Authorization", bearer))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/accounts/" + id).header("Authorization", bearer))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteUsedAccountIsConflict() throws Exception {
        String bearer = TestAuth.register(mockMvc, objectMapper, "Busy Owner").bearer();
        UUID accountId = TestAuth.defaultAccountId(mockMvc, objectMapper, bearer);

        mockMvc.perform(post("/api/v1/transactions")
                        .header("Authorization", bearer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "type": "EXPENSE",
                                  "title": "Mercado",
                                  "categoryId": "food",
                                  "accountId": "%s",
                                  "amountCents": -10000,
                                  "occurredAt": "2026-09-29T13:30:00-03:00"
                                }
                                """.formatted(accountId)))
                .andExpect(status().isCreated());

        mockMvc.perform(delete("/api/v1/accounts/" + accountId).header("Authorization", bearer))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value("Account has transactions and cannot be deleted."));
    }

    @Test
    void negativeOpeningBalanceIsRejected() throws Exception {
        String bearer = TestAuth.register(mockMvc, objectMapper, "Invalid Opening").bearer();
        mockMvc.perform(post("/api/v1/accounts")
                        .header("Authorization", bearer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Caixa",
                                  "type": "CASH",
                                  "openingBalanceCents": -1
                                }
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void accountsRequireAuthentication() throws Exception {
        mockMvc.perform(get("/api/v1/accounts"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
        mockMvc.perform(post("/api/v1/accounts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Nubank","type":"DIGITAL","openingBalanceCents":0}
                                """))
                .andExpect(status().isUnauthorized());
    }
}
