package com.nivva.api.auth;

import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nivva.api.auth.dto.AuthResponse;
import com.nivva.api.auth.dto.LoginRequest;
import com.nivva.api.auth.dto.RegisterRequest;
import com.nivva.api.auth.dto.UserResponse;
import com.nivva.api.common.error.EmailAlreadyRegisteredException;
import com.nivva.api.common.error.InvalidCredentialsException;
import com.nivva.api.user.Email;
import com.nivva.api.user.User;
import com.nivva.api.user.UserRepository;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository users;
    private final PasswordEncoder passwords;
    private final TokenService tokens;

    public AuthService(UserRepository users, PasswordEncoder passwords, TokenService tokens) {
        this.users = users;
        this.passwords = passwords;
        this.tokens = tokens;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = Email.requireValid(request.email());
        String displayName = AuthRules.normalizeDisplayName(request.displayName());
        AuthRules.validatePassword(request.password());

        if (users.existsByEmail(email)) {
            throw new EmailAlreadyRegisteredException();
        }

        User user = new User(
                UUID.randomUUID(),
                email,
                passwords.encode(request.password()),
                displayName
        );

        try {
            users.saveAndFlush(user);
        } catch (DataIntegrityViolationException exception) {
            throw new EmailAlreadyRegisteredException();
        }

        log.info("Registered user {}", user.getId());
        return toAuthResponse(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String email = Email.normalize(request.email());
        User user = users.findByEmail(email).orElseThrow(InvalidCredentialsException::new);

        if (!passwords.matches(request.password(), user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }

        log.info("Authenticated user {}", user.getId());
        return toAuthResponse(user);
    }

    @Transactional(readOnly = true)
    public UserResponse me(UUID userId) {
        User user = users.findById(userId).orElseThrow(InvalidCredentialsException::new);
        return UserResponse.from(user);
    }

    private AuthResponse toAuthResponse(User user) {
        TokenService.IssuedAccessToken token = tokens.issue(user.getId());
        return new AuthResponse(token.accessToken(), "Bearer", token.expiresInSeconds(), UserResponse.from(user));
    }
}
