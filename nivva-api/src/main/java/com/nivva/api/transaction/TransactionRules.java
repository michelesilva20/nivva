package com.nivva.api.transaction;

import com.nivva.api.category.Category;
import com.nivva.api.category.CategoryKind;
import com.nivva.api.common.error.InvalidTransactionException;

public final class TransactionRules {

    private TransactionRules() {
    }

    public static String normalizeTitle(String title) {
        return title == null ? "" : title.trim();
    }

    public static String normalizeNote(String note) {
        if (note == null) {
            return null;
        }
        String trimmed = note.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    public static void validateAmount(TransactionType type, long amountCents) {
        if (amountCents == 0) {
            throw new InvalidTransactionException("amountCents must not be zero");
        }
        if (type == TransactionType.INCOME && amountCents < 0) {
            throw new InvalidTransactionException("INCOME amountCents must be greater than zero");
        }
        if (type == TransactionType.EXPENSE && amountCents > 0) {
            throw new InvalidTransactionException("EXPENSE amountCents must be less than zero");
        }
    }

    public static void validateCategory(TransactionType type, Category category) {
        CategoryKind expected = type == TransactionType.INCOME ? CategoryKind.INCOME : CategoryKind.EXPENSE;
        if (category.getKind() != expected) {
            throw new InvalidTransactionException(
                    "Category '" + category.getId() + "' is not compatible with " + type
            );
        }
    }

    public static void validateTypeUnchanged(TransactionType current, TransactionType requested) {
        if (current != requested) {
            throw new InvalidTransactionException("Transaction type cannot change after creation");
        }
    }
}
