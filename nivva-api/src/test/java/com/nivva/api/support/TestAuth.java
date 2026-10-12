package com.nivva.api.support;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

public final class TestAuth {

    private TestAuth() {
    }

    public static RegisteredUser register(MockMvc mockMvc, ObjectMapper objectMapper, String displayName) throws Exception {
        String email = displayName.toLowerCase().replace(' ', '-') + "-" + UUID.randomUUID() + "@example.com";
        return register(mockMvc, objectMapper, displayName, email, "senha-segura");
    }

    public static RegisteredUser register(
            MockMvc mockMvc,
            ObjectMapper objectMapper,
            String displayName,
            String email,
            String password
    ) throws Exception {
        String body = """
                {
                  "displayName": "%s",
                  "email": "%s",
                  "password": "%s"
                }
                """.formatted(displayName, email, password);
        MvcResult result = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn();
        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        return new RegisteredUser(
                json.get("user").get("id").asText(),
                json.get("user").get("email").asText(),
                json.get("accessToken").asText()
        );
    }

    public static UUID defaultAccountId(MockMvc mockMvc, ObjectMapper objectMapper, String bearer) throws Exception {
        MvcResult result = mockMvc.perform(get("/api/v1/accounts").header("Authorization", bearer))
                .andExpect(status().isOk())
                .andReturn();
        return UUID.fromString(objectMapper.readTree(result.getResponse().getContentAsString()).get(0).get("id").asText());
    }

    public static UUID createAccount(
            MockMvc mockMvc,
            ObjectMapper objectMapper,
            String bearer,
            String name,
            String type
    ) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/accounts")
                        .header("Authorization", bearer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "%s",
                                  "type": "%s",
                                  "openingBalanceCents": 0
                                }
                                """.formatted(name, type)))
                .andExpect(status().isCreated())
                .andReturn();
        return UUID.fromString(objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asText());
    }

    public record RegisteredUser(String id, String email, String accessToken) {
        public String bearer() {
            return "Bearer " + accessToken;
        }
    }
}
