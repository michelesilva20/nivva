package com.nivva.api.common.error;

public class AccountHasTransactionsException extends RuntimeException {

    public AccountHasTransactionsException() {
        super("Account has transactions and cannot be deleted.");
    }
}
