package com.nivva.api.transaction;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;

import com.nivva.api.category.Category;
import com.nivva.api.category.CategoryKind;
import com.nivva.api.common.error.InvalidTransactionException;

class TransactionRulesTest {

    private final Category food = new Category("food", "Alimentação", CategoryKind.EXPENSE);
    private final Category income = new Category("income", "Receita", CategoryKind.INCOME);

    @Test
    void expenseNegativeAmountIsValid() {
        TransactionRules.validateAmount(TransactionType.EXPENSE, -10_000);
    }

    @Test
    void incomePositiveAmountIsValid() {
        TransactionRules.validateAmount(TransactionType.INCOME, 100_000);
    }

    @Test
    void expensePositiveAmountIsInvalid() {
        assertThrows(InvalidTransactionException.class, () -> TransactionRules.validateAmount(TransactionType.EXPENSE, 10_000));
    }

    @Test
    void incomeNegativeAmountIsInvalid() {
        assertThrows(InvalidTransactionException.class, () -> TransactionRules.validateAmount(TransactionType.INCOME, -10_000));
    }

    @Test
    void zeroAmountIsInvalid() {
        assertThrows(InvalidTransactionException.class, () -> TransactionRules.validateAmount(TransactionType.EXPENSE, 0));
    }

    @Test
    void incomeCannotUseExpenseCategory() {
        assertThrows(InvalidTransactionException.class, () -> TransactionRules.validateCategory(TransactionType.INCOME, food));
    }

    @Test
    void expenseCannotUseIncomeCategory() {
        assertThrows(InvalidTransactionException.class, () -> TransactionRules.validateCategory(TransactionType.EXPENSE, income));
    }

    @Test
    void typeCannotChange() {
        assertThrows(
                InvalidTransactionException.class,
                () -> TransactionRules.validateTypeUnchanged(TransactionType.EXPENSE, TransactionType.INCOME)
        );
    }

    @Test
    void normalizesTitleAndBlankNote() {
        assertEquals("Mercado", TransactionRules.normalizeTitle("   Mercado   "));
        assertNull(TransactionRules.normalizeNote("   "));
    }
}
