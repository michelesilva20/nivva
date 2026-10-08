package com.nivva.api.auth.dto;

import java.util.UUID;

import com.nivva.api.user.User;

public record UserResponse(
        UUID id,
        String displayName,
        String email
) {

    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getDisplayName(), user.getEmail());
    }
}
