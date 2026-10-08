package com.nivva.api.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank @Size(max = 80) String displayName,
        @NotBlank @Size(max = 320) String email,
        @NotBlank String password
) {
}
