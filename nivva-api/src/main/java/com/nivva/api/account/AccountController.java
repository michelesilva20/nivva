package com.nivva.api.account;

import java.net.URI;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.nivva.api.account.dto.AccountResponse;
import com.nivva.api.account.dto.CreateAccountRequest;
import com.nivva.api.account.dto.UpdateAccountRequest;
import com.nivva.api.auth.AuthenticatedUser;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/accounts")
@Tag(name = "Accounts")
@SecurityRequirement(name = "bearer-jwt")
public class AccountController {

    private final AccountService accounts;

    public AccountController(AccountService accounts) {
        this.accounts = accounts;
    }

    @GetMapping
    @Operation(summary = "List accounts of the authenticated user")
    public List<AccountResponse> list(Authentication authentication) {
        return accounts.findAll(AuthenticatedUser.requireId(authentication));
    }

    @PostMapping
    @Operation(summary = "Create an account")
    @ApiResponse(responseCode = "201", description = "Account created")
    public ResponseEntity<AccountResponse> create(
            Authentication authentication,
            @Valid @RequestBody CreateAccountRequest request
    ) {
        AccountResponse created = accounts.create(AuthenticatedUser.requireId(authentication), request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(created.id())
                .toUri();
        return ResponseEntity.created(location).body(created);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get an account by id")
    public AccountResponse get(Authentication authentication, @PathVariable UUID id) {
        return accounts.findById(AuthenticatedUser.requireId(authentication), id);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Replace an account")
    public AccountResponse update(
            Authentication authentication,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateAccountRequest request
    ) {
        return accounts.update(AuthenticatedUser.requireId(authentication), id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete an empty account")
    public void delete(Authentication authentication, @PathVariable UUID id) {
        accounts.delete(AuthenticatedUser.requireId(authentication), id);
    }
}
