package com.nivva.api.auth;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "nivva.jwt")
public record JwtProperties(
        String secretBase64,
        String issuer,
        Duration ttl
) {
}
