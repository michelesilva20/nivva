package com.nivva.api.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.Base64;

import javax.crypto.SecretKey;

import org.junit.jupiter.api.Test;

class JwtConfigTest {

    @Test
    void acceptsBase64OfAtLeast32Bytes() {
        byte[] secret = "TEST_ONLY_NIVVA_JWT_KEY_32BYTES!".getBytes();
        SecretKey key = JwtConfig.hmacSha256Key(Base64.getEncoder().encodeToString(secret));
        assertEquals(32, key.getEncoded().length);
        assertEquals("HmacSHA256", key.getAlgorithm());
    }

    @Test
    void rejectsMissingSecret() {
        assertThrows(IllegalStateException.class, () -> JwtConfig.hmacSha256Key(""));
        assertThrows(IllegalStateException.class, () -> JwtConfig.hmacSha256Key(null));
    }

    @Test
    void rejectsShortDecodedSecret() {
        String shortSecret = Base64.getEncoder().encodeToString("only-16-bytes!!!!".getBytes());
        assertThrows(IllegalStateException.class, () -> JwtConfig.hmacSha256Key(shortSecret));
    }

    @Test
    void rejectsInvalidBase64() {
        assertThrows(IllegalStateException.class, () -> JwtConfig.hmacSha256Key("%%%not-base64%%%"));
    }
}
