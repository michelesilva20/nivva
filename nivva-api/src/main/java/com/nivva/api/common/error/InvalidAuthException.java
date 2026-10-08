package com.nivva.api.common.error;

public class InvalidAuthException extends RuntimeException {

    public InvalidAuthException(String message) {
        super(message);
    }
}
