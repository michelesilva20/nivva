package com.nivva.api.common.error;

public class AccountNotFoundException extends RuntimeException {

    public AccountNotFoundException() {
        super("Account was not found");
    }
}
