package com.nivva.api.common.error;

public class InvalidAccountException extends RuntimeException {

    public InvalidAccountException(String message) {
        super(message);
    }
}
