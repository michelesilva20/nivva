package com.nivva.api.account;

import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nivva.api.account.dto.AccountResponse;
import com.nivva.api.account.dto.CreateAccountRequest;
import com.nivva.api.account.dto.UpdateAccountRequest;
import com.nivva.api.common.error.AccountHasTransactionsException;
import com.nivva.api.common.error.AccountNotFoundException;
import com.nivva.api.transaction.TransactionRepository;

@Service
public class AccountService {

    public static final String DEFAULT_NAME = "Conta principal";

    private static final Logger log = LoggerFactory.getLogger(AccountService.class);

    private final AccountRepository accounts;
    private final TransactionRepository transactions;

    public AccountService(AccountRepository accounts, TransactionRepository transactions) {
        this.accounts = accounts;
        this.transactions = transactions;
    }

    @Transactional
    public AccountResponse createDefault(UUID userId) {
        return create(userId, new CreateAccountRequest(DEFAULT_NAME, AccountType.CHECKING, 0L));
    }

    @Transactional
    public AccountResponse create(UUID userId, CreateAccountRequest request) {
        String name = AccountRules.normalizeName(request.name());
        long openingBalanceCents = AccountRules.requireOpeningBalance(request.openingBalanceCents());

        Account account = new Account(
                UUID.randomUUID(),
                userId,
                name,
                request.type(),
                openingBalanceCents
        );
        Account saved = accounts.save(account);
        log.info("Created account {} for user {}", saved.getId(), userId);
        return AccountResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<AccountResponse> findAll(UUID userId) {
        return accounts.findAllByUserIdOrderByCreatedAtAsc(userId).stream()
                .map(AccountResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public AccountResponse findById(UUID userId, UUID id) {
        return AccountResponse.from(requireOwned(userId, id));
    }

    @Transactional
    public AccountResponse update(UUID userId, UUID id, UpdateAccountRequest request) {
        Account account = requireOwned(userId, id);
        account.replace(
                AccountRules.normalizeName(request.name()),
                request.type(),
                AccountRules.requireOpeningBalance(request.openingBalanceCents())
        );
        log.info("Updated account {} for user {}", id, userId);
        return AccountResponse.from(account);
    }

    @Transactional
    public void delete(UUID userId, UUID id) {
        requireOwned(userId, id);
        if (transactions.existsByUserIdAndAccountId(userId, id)) {
            throw new AccountHasTransactionsException();
        }

        try {
            accounts.deleteById(id);
            accounts.flush();
        } catch (DataIntegrityViolationException exception) {
            throw new AccountHasTransactionsException();
        }
        log.info("Deleted account {} for user {}", id, userId);
    }

    private Account requireOwned(UUID userId, UUID id) {
        return accounts.findByIdAndUserId(id, userId).orElseThrow(AccountNotFoundException::new);
    }
}
