package com.nivva.api.auth;

import static org.hamcrest.Matchers.not;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
class AuthApiIT {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private JdbcTemplate jdbc;

    @Test
    void registerNormalizesEmailAndHashesPassword() throws Exception {
        String rawEmail = "  Michele.Auth+" + UUID.randomUUID() + "@Email.com  ";
        MvcResult result = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "displayName": "  Michele  ",
                                  "email": "%s",
                                  "password": "senha-segura"
                                }
                                """.formatted(rawEmail)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.expiresInSeconds").value(3600))
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.user.displayName").value("Michele"))
                .andExpect(jsonPath("$.user.email").value(rawEmail.trim().toLowerCase()))
                .andExpect(jsonPath("$.user.passwordHash").doesNotExist())
                .andExpect(jsonPath("$").value(not(org.hamcrest.Matchers.hasKey("password"))))
                .andReturn();

        String userId = objectMapper.readTree(result.getResponse().getContentAsString()).get("user").get("id").asText();
        String storedHash = jdbc.queryForObject(
                "select password_hash from users where id = ?",
                String.class,
                UUID.fromString(userId)
        );
        assertTrue(storedHash != null && storedHash.startsWith("$2"));
        assertNotEquals("senha-segura", storedHash);
    }

    @Test
    void duplicateEmailIsConflict() throws Exception {
        String email = "dup-" + UUID.randomUUID() + "@example.com";
        TestAuth.register(mockMvc, objectMapper, "First", email, "senha-segura");

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "displayName": "Second",
                                  "email": "%s",
                                  "password": "senha-segura"
                                }
                                """.formatted(email.toUpperCase())))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.title").value("Email already registered"))
                .andExpect(jsonPath("$.status").value(409));
    }

    @Test
    void loginSucceedsWithNormalizedEmail() throws Exception {
        String email = "login-" + UUID.randomUUID() + "@example.com";
        TestAuth.register(mockMvc, objectMapper, "Login User", email, "senha-segura");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "  %s  ",
                                  "password": "senha-segura"
                                }
                                """.formatted(email.toUpperCase())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.user.email").value(email));
    }

    @Test
    void loginRejectsWrongPasswordAndUnknownEmailWithSameMessage() throws Exception {
        String email = "secret-" + UUID.randomUUID() + "@example.com";
        TestAuth.register(mockMvc, objectMapper, "Secret User", email, "senha-segura");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"%s","password":"outra-senha"}
                                """.formatted(email)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.detail").value("Email ou senha inválidos."));

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"missing-%s","password":"senha-segura"}
                                """.formatted(email)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.detail").value("Email ou senha inválidos."));
    }

    @Test
    void meRequiresTokenAndHidesPasswordHash() throws Exception {
        var user = TestAuth.register(mockMvc, objectMapper, "Me User");

        mockMvc.perform(get("/api/v1/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.title").value("Unauthorized"));

        mockMvc.perform(get("/api/v1/me").header("Authorization", user.bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(user.id()))
                .andExpect(jsonPath("$.email").value(user.email()))
                .andExpect(jsonPath("$.displayName").value("Me User"))
                .andExpect(jsonPath("$.passwordHash").doesNotExist());
    }

    @Test
    void shortPasswordIsRejected() throws Exception {
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "displayName": "Short",
                                  "email": "short-%s@example.com",
                                  "password": "1234567"
                                }
                                """.formatted(UUID.randomUUID())))
                .andExpect(status().isBadRequest());
    }
}
