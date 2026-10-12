package com.nivva.api.account;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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

import com.nivva.api.TestcontainersConfiguration;
import com.nivva.api.support.TestAuth;

import tools.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
@EnabledIf(value = "com.nivva.api.support.DockerAvailability#available", disabledReason = "Docker is not running")
class AccountOwnershipIT {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void userBCannotSeeOrMutateUserAAccount() throws Exception {
        var userA = TestAuth.register(mockMvc, objectMapper, "Account A");
        var userB = TestAuth.register(mockMvc, objectMapper, "Account B");
        var accountA = TestAuth.defaultAccountId(mockMvc, objectMapper, userA.bearer());
        var accountB = TestAuth.defaultAccountId(mockMvc, objectMapper, userB.bearer());

        mockMvc.perform(get("/api/v1/accounts").header("Authorization", userA.bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id=='" + accountA + "')]").exists())
                .andExpect(jsonPath("$[?(@.id=='" + accountB + "')]").doesNotExist());

        mockMvc.perform(get("/api/v1/accounts").header("Authorization", userB.bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id=='" + accountB + "')]").exists())
                .andExpect(jsonPath("$[?(@.id=='" + accountA + "')]").doesNotExist());

        mockMvc.perform(get("/api/v1/accounts/" + accountA).header("Authorization", userB.bearer()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Account was not found"));

        mockMvc.perform(put("/api/v1/accounts/" + accountA)
                        .header("Authorization", userB.bearer())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Hack","type":"CASH","openingBalanceCents":1}
                                """))
                .andExpect(status().isNotFound());

        mockMvc.perform(delete("/api/v1/accounts/" + accountA).header("Authorization", userB.bearer()))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/v1/accounts/" + accountA).header("Authorization", userA.bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Conta principal"));
    }
}
