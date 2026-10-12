package com.nivva.api.account;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;

import com.nivva.api.common.error.InvalidAccountException;

class AccountRulesTest {

    @Test
    void trimsName() {
        assertEquals("Nubank", AccountRules.normalizeName("  Nubank  "));
    }

    @Test
    void rejectsBlankName() {
        assertThrows(InvalidAccountException.class, () -> AccountRules.normalizeName("   "));
    }

    @Test
    void rejectsNameLongerThan80() {
        assertThrows(InvalidAccountException.class, () -> AccountRules.normalizeName("n".repeat(81)));
    }

    @Test
    void openingBalanceCannotBeNegative() {
        assertThrows(InvalidAccountException.class, () -> AccountRules.requireOpeningBalance(-1L));
    }

    @Test
    void openingBalanceZeroIsAllowed() {
        assertEquals(0L, AccountRules.requireOpeningBalance(0L));
    }
}
