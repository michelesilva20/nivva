package com.nivva.api.auth;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;

import com.nivva.api.common.error.InvalidAuthException;
import com.nivva.api.user.Email;

class AuthRulesTest {

    @Test
    void emailIsTrimmedAndLowercased() {
        assertEquals("michele@email.com", Email.requireValid("  Michele@Email.com  "));
    }

    @Test
    void displayNameIsTrimmed() {
        assertEquals("Michele", AuthRules.normalizeDisplayName("  Michele  "));
    }

    @Test
    void passwordMinimumIsEightCharacters() {
        assertThrows(InvalidAuthException.class, () -> AuthRules.validatePassword("1234567"));
        assertDoesNotThrow(() -> AuthRules.validatePassword("12345678"));
    }

    @Test
    void passwordRejectsMoreThan72Utf8BytesEvenWhenCharacterCountIsLower() {
        String seventyThreeBytes = "é".repeat(36) + "x";
        assertEquals(73, seventyThreeBytes.getBytes(java.nio.charset.StandardCharsets.UTF_8).length);
        assertThrows(InvalidAuthException.class, () -> AuthRules.validatePassword(seventyThreeBytes));
    }
}
