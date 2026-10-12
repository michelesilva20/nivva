package com.nivva.api.auth;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.UUID;

import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.FlywayException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIf;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;
import org.testcontainers.utility.DockerImageName;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

@Testcontainers
@EnabledIf(value = "com.nivva.api.support.DockerAvailability#available", disabledReason = "Docker is not running")
class OwnershipMigrationIT {

    @Container
    static final PostgreSQLContainer postgres = new PostgreSQLContainer(DockerImageName.parse("postgres:16"));

    @Test
    void emptySchemaAppliesV1V2V3V4() {
        DriverManagerDataSource dataSource = cleanDataSource();

        assertDoesNotThrow(() -> Flyway.configure()
                .dataSource(dataSource)
                .locations("classpath:db/migration")
                .load()
                .migrate());

        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        Integer version = jdbc.queryForObject(
                "SELECT MAX(installed_rank) FROM flyway_schema_history WHERE success = true",
                Integer.class
        );
        assertEquals(4, version);
        assertEquals(1, jdbc.queryForObject(
                "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'goals'",
                Integer.class
        ));
        assertEquals(1, jdbc.queryForObject(
                "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'goal_contributions'",
                Integer.class
        ));
    }

    @Test
    void v2FailsWhenLegacyTransactionsExist() {
        DriverManagerDataSource dataSource = cleanDataSource();

        Flyway.configure()
                .dataSource(dataSource)
                .locations("classpath:db/migration")
                .target("1")
                .load()
                .migrate();

        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        jdbc.update("""
                INSERT INTO transactions
                    (id, type, title, category_id, account_id, amount_cents, occurred_at, created_at, updated_at)
                VALUES
                    (?, 'EXPENSE', 'Mercado', 'food', 'main', -15000, now(), now(), now())
                """, UUID.randomUUID());

        FlywayException exception = assertThrows(FlywayException.class, () -> Flyway.configure()
                .dataSource(dataSource)
                .locations("classpath:db/migration")
                .load()
                .migrate());

        assertTrue(exception.getMessage().contains("legacy transaction"));
        assertTrue(exception.getMessage().contains("docker compose down -v"));
    }

    @Test
    void v3FailsWhenLegacyUsersExist() {
        DriverManagerDataSource dataSource = cleanDataSource();
        Flyway.configure()
                .dataSource(dataSource)
                .locations("classpath:db/migration")
                .target("2")
                .load()
                .migrate();

        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        jdbc.update("""
                INSERT INTO users (id, email, password_hash, display_name, created_at, updated_at)
                VALUES (?, ?, ?, ?, now(), now())
                """, UUID.randomUUID(), "legacy@example.com", "$2a$10$hash", "Legacy");

        FlywayException exception = assertThrows(FlywayException.class, () -> Flyway.configure()
                .dataSource(dataSource)
                .locations("classpath:db/migration")
                .load()
                .migrate());

        assertTrue(exception.getMessage().contains("user-owned"));
        assertTrue(exception.getMessage().contains("docker compose down -v"));
    }

    private static DriverManagerDataSource cleanDataSource() {
        DriverManagerDataSource dataSource = new DriverManagerDataSource();
        dataSource.setUrl(postgres.getJdbcUrl());
        dataSource.setUsername(postgres.getUsername());
        dataSource.setPassword(postgres.getPassword());
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        jdbc.execute("DROP SCHEMA public CASCADE");
        jdbc.execute("CREATE SCHEMA public");
        return dataSource;
    }
}
