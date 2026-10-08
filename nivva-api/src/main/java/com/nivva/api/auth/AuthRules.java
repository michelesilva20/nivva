package com.nivva.api.auth;

import java.nio.charset.StandardCharsets;

import com.nivva.api.common.error.InvalidAuthException;

public final class AuthRules {

    public static final int DISPLAY_NAME_MIN = 2;
    public static final int DISPLAY_NAME_MAX = 80;
    public static final int PASSWORD_MIN_CHARS = 8;
    public static final int PASSWORD_MAX_UTF8_BYTES = 72;

    private AuthRules() {
    }

    public static String normalizeDisplayName(String displayName) {
        String normalized = displayName == null ? "" : displayName.trim();
        if (normalized.length() < DISPLAY_NAME_MIN || normalized.length() > DISPLAY_NAME_MAX) {
            throw new InvalidAuthException("displayName must be between 2 and 80 characters");
        }
        return normalized;
    }

    public static void validatePassword(String password) {
        if (password == null || password.length() < PASSWORD_MIN_CHARS) {
            throw new InvalidAuthException("password must be at least 8 characters");
        }
        if (password.getBytes(StandardCharsets.UTF_8).length > PASSWORD_MAX_UTF8_BYTES) {
            throw new InvalidAuthException("password must be at most 72 bytes in UTF-8");
        }
    }
}
