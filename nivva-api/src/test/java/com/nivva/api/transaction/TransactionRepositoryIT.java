package com.nivva.api.transaction;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Instant;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIf;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;

import com.nivva.api.TestcontainersConfiguration;
import com.nivva.api.account.AccountRepository;
import com.nivva.api.category.CategoryRepository;

@SpringBootTest
@Import(TestcontainersConfiguration.class)
@EnabledIf(value = "com.nivva.api.support.DockerAvailability#available", disabledReason = "Docker is not running")
class TransactionRepositoryIT {

    @Autowired
    private TransactionRepository transactions;
    @Autowired
    private AccountRepository accounts;
    @Autowired
    private CategoryRepository categories;
    @Autowired
    private JdbcTemplate jdbc;

    @Test
    void persistsAndReadsTransaction() {
        UUID ownerId = insertUser();
        var account = accounts.findById("main").orElseThrow();
        var category = categories.findById("food").orElseThrow();
        var id = UUID.randomUUID();
        Instant occurredAt = Instant.parse("2026-09-29T16:30:00Z");

        transactions.saveAndFlush(new Transaction(
                id,
                ownerId,
                TransactionType.EXPENSE,
                "Mercado",
                category,
                account,
                -10_000,
                occurredAt,
                null
        ));

        var loaded = transactions.findDetailedByIdAndUserId(id, ownerId).orElseThrow();
        assertEquals(-10_000, loaded.getAmountCents());
        assertEquals(ownerId, loaded.getUserId());
        assertEquals("food", loaded.getCategory().getId());
        assertEquals("main", loaded.getAccount().getId());
        assertEquals(occurredAt, loaded.getOccurredAt());
    }

    @Test
    void databaseRejectsExpenseWithPositiveAmount() {
        UUID ownerId = insertUser();
        assertThrows(DataIntegrityViolationException.class, () -> jdbc.update("""
                INSERT INTO transactions
                    (id, user_id, type, title, category_id, account_id, amount_cents, occurred_at, created_at, updated_at)
                VALUES
                    (?, ?, 'EXPENSE', 'Mercado', 'food', 'main', 10000, now(), now(), now())
                """, UUID.randomUUID(), ownerId));
    }

    @Test
    void databaseRejectsIncomeWithNegativeAmount() {
        UUID ownerId = insertUser();
        assertThrows(DataIntegrityViolationException.class, () -> jdbc.update("""
                INSERT INTO transactions
                    (id, user_id, type, title, category_id, account_id, amount_cents, occurred_at, created_at, updated_at)
                VALUES
                    (?, ?, 'INCOME', 'Freelance', 'income', 'main', -10000, now(), now(), now())
                """, UUID.randomUUID(), ownerId));
    }

    @Test
    void referenceSeedsExist() {
        assertTrue(accounts.findById("main").isPresent());
        assertTrue(categories.findById("income").isPresent());
    }

    private UUID insertUser() {
        UUID id = UUID.randomUUID();
        jdbc.update("""
                INSERT INTO users (id, email, password_hash, display_name, created_at, updated_at)
                VALUES (?, ?, ?, ?, now(), now())
                """, id, "repo-" + id + "@example.com", "$2a$10$testhashnotusedforloginxxxxxxxxxxxx", "Repo IT");
        return id;
    }
}
