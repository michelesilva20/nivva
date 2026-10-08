package com.nivva.api.user;

import java.util.Locale;

import com.nivva.api.common.error.InvalidAuthException;

public final class Email {

    private Email() {
    }

    public static String normalize(String email) {
        if (email == null) {
            return null;
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }

    public static String requireValid(String email) {
        String normalized = normalize(email);
        if (normalized == null || !normalized.matches("[^@\\s]+@[^@\\s]+\\.[^@\\s]+")) {
            throw new InvalidAuthException("email is invalid");
        }
        return normalized;
    }
}
