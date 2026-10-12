package com.nivva.api.transaction;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.nivva.api.account.Account;
import com.nivva.api.account.AccountRepository;
import com.nivva.api.account.AccountType;
import com.nivva.api.category.Category;
import com.nivva.api.category.CategoryKind;
import com.nivva.api.category.CategoryRepository;
import com.nivva.api.common.error.CategoryNotFoundException;
import com.nivva.api.common.error.InvalidTransactionException;
import com.nivva.api.common.error.TransactionNotFoundException;
import com.nivva.api.transaction.dto.CreateTransactionRequest;
import com.nivva.api.transaction.dto.UpdateTransactionRequest;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock
    private TransactionRepository transactions;
    @Mock
    private AccountRepository accounts;
    @Mock
    private CategoryRepository categories;

    private TransactionService service;
    private final UUID ownerId = UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    private final UUID mainId = UUID.fromString("11111111-1111-4111-8111-111111111111");
    private final UUID reserveId = UUID.fromString("22222222-2222-4222-8222-222222222222");
    private final Account main = new Account(mainId, ownerId, "Conta principal", AccountType.CHECKING, 0);
    private final Account reserve = new Account(reserveId, ownerId, "Reserva", AccountType.DIGITAL, 0);
    private final Category food = new Category("food", "Alimentação", CategoryKind.EXPENSE);
    private final Category transport = new Category("transport", "Transporte", CategoryKind.EXPENSE);
    private final OffsetDateTime occurredAt = OffsetDateTime.parse("2026-09-29T13:30:00-03:00");

    @BeforeEach
    void setUp() {
        service = new TransactionService(transactions, accounts, categories);
    }

    @Test
    void createExpenseKeepsNegativeAmountAndUtcInstant() {
        when(accounts.findByIdAndUserId(mainId, ownerId)).thenReturn(Optional.of(main));
        when(categories.findById("food")).thenReturn(Optional.of(food));
        when(transactions.saveAndFlush(any())).thenAnswer(invocation -> invocation.getArgument(0));

        var created = service.create(ownerId, new CreateTransactionRequest(
                TransactionType.EXPENSE,
                "  Mercado  ",
                "food",
                mainId,
                -10_000L,
                occurredAt,
                "  "
        ));

        assertEquals("Mercado", created.title());
        assertEquals(-10_000L, created.amountCents());
        assertEquals(occurredAt.toInstant(), created.occurredAt());
        assertEquals(null, created.note());
        assertEquals(mainId, created.accountId());
    }

    @Test
    void unknownAccountIsRejected() {
        UUID unknown = UUID.fromString("99999999-9999-4999-8999-999999999999");
        when(accounts.findByIdAndUserId(unknown, ownerId)).thenReturn(Optional.empty());

        assertThrows(InvalidTransactionException.class, () -> service.create(ownerId, new CreateTransactionRequest(
                TransactionType.EXPENSE,
                "Mercado",
                "food",
                unknown,
                -10_000L,
                occurredAt,
                null
        )));
    }

    @Test
    void unknownCategoryIsRejected() {
        when(accounts.findByIdAndUserId(mainId, ownerId)).thenReturn(Optional.of(main));
        when(categories.findById("unknown")).thenReturn(Optional.empty());

        assertThrows(CategoryNotFoundException.class, () -> service.create(ownerId, new CreateTransactionRequest(
                TransactionType.EXPENSE,
                "Mercado",
                "unknown",
                mainId,
                -10_000L,
                occurredAt,
                null
        )));
    }

    @Test
    void incompatibleCategoryIsRejected() {
        when(accounts.findByIdAndUserId(mainId, ownerId)).thenReturn(Optional.of(main));
        when(categories.findById("food")).thenReturn(Optional.of(food));

        assertThrows(InvalidTransactionException.class, () -> service.create(ownerId, new CreateTransactionRequest(
                TransactionType.INCOME,
                "Freelance",
                "food",
                mainId,
                100_000L,
                occurredAt,
                null
        )));
    }

    @Test
    void updatePreservesIdAndType() {
        UUID id = UUID.fromString("11111111-1111-1111-1111-111111111111");
        Transaction existing = new Transaction(
                id,
                ownerId,
                TransactionType.EXPENSE,
                "Mercado",
                food,
                mainId,
                -10_000,
                occurredAt.toInstant(),
                null
        );
        when(transactions.findDetailedByIdAndUserId(id, ownerId)).thenReturn(Optional.of(existing));
        when(accounts.findByIdAndUserId(reserveId, ownerId)).thenReturn(Optional.of(reserve));
        when(categories.findById("transport")).thenReturn(Optional.of(transport));

        var updated = service.update(ownerId, id, new UpdateTransactionRequest(
                TransactionType.EXPENSE,
                "Mercado",
                "transport",
                reserveId,
                -15_000L,
                occurredAt,
                null
        ));

        assertEquals(id, updated.id());
        assertEquals(TransactionType.EXPENSE, updated.type());
        assertEquals(-15_000L, updated.amountCents());
        assertEquals("transport", updated.categoryId());
        assertEquals(reserveId, updated.accountId());
    }

    @Test
    void deleteMissingTransactionFails() {
        UUID id = UUID.randomUUID();
        when(transactions.existsByIdAndUserId(id, ownerId)).thenReturn(false);

        assertThrows(TransactionNotFoundException.class, () -> service.delete(ownerId, id));
    }

    @Test
    void deleteExistingTransaction() {
        UUID id = UUID.randomUUID();
        when(transactions.existsByIdAndUserId(id, ownerId)).thenReturn(true);

        service.delete(ownerId, id);

        ArgumentCaptor<UUID> captor = ArgumentCaptor.forClass(UUID.class);
        verify(transactions).deleteById(captor.capture());
        assertEquals(id, captor.getValue());
    }
}
