package com.nivva.api.account;

public record AccountResponse(String id, String name, AccountType type) {

    public static AccountResponse from(Account account) {
        return new AccountResponse(account.getId(), account.getName(), account.getType());
    }
}
