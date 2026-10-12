package com.nivva.api.account;

import com.nivva.api.common.error.InvalidAccountException;

public final class AccountRules {

    public static final int NAME_MIN = 1;
    public static final int NAME_MAX = 80;

    private AccountRules() {
    }

    public static String normalizeName(String name) {
        String normalized = name == null ? "" : name.trim();
        if (normalized.length() < NAME_MIN || normalized.length() > NAME_MAX) {
            throw new InvalidAccountException("name must be between 1 and 80 characters");
        }
        return normalized;
    }

    public static long requireOpeningBalance(Long openingBalanceCents) {
        if (openingBalanceCents == null || openingBalanceCents < 0) {
            throw new InvalidAccountException("openingBalanceCents must be greater than or equal to 0");
        }
        return openingBalanceCents;
    }
}
