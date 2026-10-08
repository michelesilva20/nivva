package com.nivva.api.auth;

import java.util.UUID;

import org.springframework.security.authentication.InsufficientAuthenticationException;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

public final class AuthenticatedUser {

    private AuthenticatedUser() {
    }

    public static UUID requireId(Authentication authentication) {
        if (authentication instanceof JwtAuthenticationToken token) {
            return uuidFromSubject(token.getToken().getSubject());
        }
        if (authentication != null && authentication.getPrincipal() instanceof Jwt jwt) {
            return uuidFromSubject(jwt.getSubject());
        }
        throw new InsufficientAuthenticationException("Authentication is required");
    }

    static UUID uuidFromSubject(String subject) {
        try {
            return UUID.fromString(subject);
        } catch (RuntimeException exception) {
            throw new InsufficientAuthenticationException("JWT subject must be a UUID");
        }
    }
}
