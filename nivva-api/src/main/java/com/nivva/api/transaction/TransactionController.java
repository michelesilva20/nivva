package com.nivva.api.transaction;

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

import com.nivva.api.auth.AuthenticatedUser;
import com.nivva.api.transaction.dto.CreateTransactionRequest;
import com.nivva.api.transaction.dto.TransactionResponse;
import com.nivva.api.transaction.dto.UpdateTransactionRequest;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/transactions")
@Tag(name = "Transactions")
@SecurityRequirement(name = "bearer-jwt")
public class TransactionController {

    private final TransactionService transactions;

    public TransactionController(TransactionService transactions) {
        this.transactions = transactions;
    }

    @PostMapping
    @Operation(summary = "Create a transaction")
    @ApiResponse(responseCode = "201", description = "Transaction created")
    public ResponseEntity<TransactionResponse> create(
            Authentication authentication,
            @Valid @RequestBody CreateTransactionRequest request
    ) {
        UUID userId = AuthenticatedUser.requireId(authentication);
        TransactionResponse created = transactions.create(userId, request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(created.id())
                .toUri();
        return ResponseEntity.created(location).body(created);
    }

    @GetMapping
    @Operation(summary = "List transactions of the authenticated user, newest first")
    public List<TransactionResponse> list(Authentication authentication) {
        return transactions.findAll(AuthenticatedUser.requireId(authentication));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a transaction by id")
    public TransactionResponse get(Authentication authentication, @PathVariable UUID id) {
        return transactions.findById(AuthenticatedUser.requireId(authentication), id);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Replace an editable transaction")
    public TransactionResponse update(
            Authentication authentication,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateTransactionRequest request
    ) {
        return transactions.update(AuthenticatedUser.requireId(authentication), id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a transaction")
    public void delete(Authentication authentication, @PathVariable UUID id) {
        transactions.delete(AuthenticatedUser.requireId(authentication), id);
    }
}
