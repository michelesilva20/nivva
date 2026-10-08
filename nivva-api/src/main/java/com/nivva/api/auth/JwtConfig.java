package com.nivva.api.auth;

import java.util.Base64;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.oauth2.jwt.JwtValidators;

import com.nimbusds.jose.jwk.source.ImmutableSecret;

@Configuration
@EnableConfigurationProperties(JwtProperties.class)
public class JwtConfig {

    static final int MIN_SECRET_BYTES = 32;

    @Bean
    SecretKey jwtSecretKey(JwtProperties properties) {
        return hmacSha256Key(properties.secretBase64());
    }

    @Bean
    JwtEncoder jwtEncoder(SecretKey jwtSecretKey) {
        return new NimbusJwtEncoder(new ImmutableSecret<>(jwtSecretKey));
    }

    @Bean
    JwtDecoder jwtDecoder(SecretKey jwtSecretKey, JwtProperties properties) {
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withSecretKey(jwtSecretKey)
                .macAlgorithm(MacAlgorithm.HS256)
                .build();
        decoder.setJwtValidator(JwtValidators.createDefaultWithIssuer(properties.issuer()));
        return decoder;
    }

    static SecretKey hmacSha256Key(String secretBase64) {
        if (secretBase64 == null || secretBase64.isBlank()) {
            throw new IllegalStateException(
                    "NIVVA_JWT_SECRET_BASE64 is required and must be Base64 of at least 32 random bytes"
            );
        }

        byte[] secret;
        try {
            secret = Base64.getDecoder().decode(secretBase64.strip());
        } catch (IllegalArgumentException exception) {
            throw new IllegalStateException("NIVVA_JWT_SECRET_BASE64 must be valid Base64", exception);
        }

        if (secret.length < MIN_SECRET_BYTES) {
            throw new IllegalStateException(
                    "NIVVA_JWT_SECRET_BASE64 must decode to at least 32 bytes (256 bits) for HS256"
            );
        }

        return new SecretKeySpec(secret, "HmacSHA256");
    }
}
