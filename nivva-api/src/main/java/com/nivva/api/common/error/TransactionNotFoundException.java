package com.nivva.api.common.error;

import java.util.UUID;

public class TransactionNotFoundException extends RuntimeException {

    public TransactionNotFoundException(UUID id) {
        super("Transaction " + id + " was not found");
    }
}
