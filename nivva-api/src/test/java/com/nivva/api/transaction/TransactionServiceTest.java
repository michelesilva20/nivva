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
import com.nivva.api.common.error.AccountNotFoundException;
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
    private final Account main = new Account("main", "Conta principal", AccountType.CHECKING);
    private final Account reserve = new Account("reserve", "Reserva", AccountType.DIGITAL);
    private final Category food = new Category("food", "Alimentação", CategoryKind.EXPENSE);
    private final Category transport = new Category("transport", "Transporte", CategoryKind.EXPENSE);
    private final Category income = new Category("income", "Receita", CategoryKind.INCOME);
    private final OffsetDateTime occurredAt = OffsetDateTime.parse("2026-09-29T13:30:00-03:00");

    @BeforeEach
    void setUp() {
        service = new TransactionService(transactions, accounts, categories);
    }

    @Test
    void createExpenseKeepsNegativeAmountAndUtcInstant() {
        when(accounts.findById("main")).thenReturn(Optional.of(main));
        when(categories.findById("food")).thenReturn(Optional.of(food));
        when(transactions.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        var created = service.create(new CreateTransactionRequest(
                TransactionType.EXPENSE,
                "  Mercado  ",
                "food",
                "main",
                -10_000L,
                occurredAt,
                "  "
        ));

        assertEquals("Mercado", created.title());
        assertEquals(-10_000L, created.amountCents());
        assertEquals(occurredAt.toInstant(), created.occurredAt());
        assertEquals(null, created.note());
    }

    @Test
    void unknownAccountIsRejected() {
        when(accounts.findById("bitcoin-wallet-from-mars")).thenReturn(Optional.empty());

        assertThrows(AccountNotFoundException.class, () -> service.create(new CreateTransactionRequest(
                TransactionType.EXPENSE,
                "Mercado",
                "food",
                "bitcoin-wallet-from-mars",
                -10_000L,
                occurredAt,
                null
        )));
    }

    @Test
    void unknownCategoryIsRejected() {
        when(accounts.findById("main")).thenReturn(Optional.of(main));
        when(categories.findById("unknown")).thenReturn(Optional.empty());

        assertThrows(CategoryNotFoundException.class, () -> service.create(new CreateTransactionRequest(
                TransactionType.EXPENSE,
                "Mercado",
                "unknown",
                "main",
                -10_000L,
                occurredAt,
                null
        )));
    }

    @Test
    void incompatibleCategoryIsRejected() {
        when(accounts.findById("main")).thenReturn(Optional.of(main));
        when(categories.findById("food")).thenReturn(Optional.of(food));

        assertThrows(InvalidTransactionException.class, () -> service.create(new CreateTransactionRequest(
                TransactionType.INCOME,
                "Freelance",
                "food",
                "main",
                100_000L,
                occurredAt,
                null
        )));
    }

    @Test
    void updatePreservesIdAndType() {
        UUID id = UUID.fromString("11111111-1111-1111-1111-111111111111");
        Transaction existing = new Transaction(id, TransactionType.EXPENSE, "Mercado", food, main, -10_000, occurredAt.toInstant(), null);
        when(transactions.findDetailedById(id)).thenReturn(Optional.of(existing));
        when(accounts.findById("reserve")).thenReturn(Optional.of(reserve));
        when(categories.findById("transport")).thenReturn(Optional.of(transport));

        var updated = service.update(id, new UpdateTransactionRequest(
                TransactionType.EXPENSE,
                "Mercado",
                "transport",
                "reserve",
                -15_000L,
                occurredAt,
                null
        ));

        assertEquals(id, updated.id());
        assertEquals(TransactionType.EXPENSE, updated.type());
        assertEquals(-15_000L, updated.amountCents());
        assertEquals("transport", updated.categoryId());
        assertEquals("reserve", updated.accountId());
    }

    @Test
    void deleteMissingTransactionFails() {
        UUID id = UUID.randomUUID();
        when(transactions.existsById(id)).thenReturn(false);

        assertThrows(TransactionNotFoundException.class, () -> service.delete(id));
    }

    @Test
    void deleteExistingTransaction() {
        UUID id = UUID.randomUUID();
        when(transactions.existsById(id)).thenReturn(true);

        service.delete(id);

        ArgumentCaptor<UUID> captor = ArgumentCaptor.forClass(UUID.class);
        verify(transactions).deleteById(captor.capture());
        assertEquals(id, captor.getValue());
    }
}
