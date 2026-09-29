package com.nivva.api.common.error;

public class AccountNotFoundException extends RuntimeException {

    public AccountNotFoundException(String accountId) {
        super("Account '" + accountId + "' was not found");
    }
}
