package com.nivva.api.transaction;

import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nivva.api.account.AccountRepository;
import com.nivva.api.category.Category;
import com.nivva.api.category.CategoryRepository;
import com.nivva.api.common.error.CategoryNotFoundException;
import com.nivva.api.common.error.InvalidTransactionException;
import com.nivva.api.common.error.TransactionNotFoundException;
import com.nivva.api.transaction.dto.CreateTransactionRequest;
import com.nivva.api.transaction.dto.TransactionResponse;
import com.nivva.api.transaction.dto.UpdateTransactionRequest;

@Service
public class TransactionService {

    private static final Logger log = LoggerFactory.getLogger(TransactionService.class);

    private final TransactionRepository transactions;
    private final AccountRepository accounts;
    private final CategoryRepository categories;

    public TransactionService(
            TransactionRepository transactions,
            AccountRepository accounts,
            CategoryRepository categories
    ) {
        this.transactions = transactions;
        this.accounts = accounts;
        this.categories = categories;
    }

    @Transactional
    public TransactionResponse create(UUID userId, CreateTransactionRequest request) {
        String title = TransactionRules.normalizeTitle(request.title());
        String note = TransactionRules.normalizeNote(request.note());
        UUID accountId = requireOwnedAccount(userId, request.accountId());
        Category category = requireCategory(request.categoryId());
        TransactionRules.validateAmount(request.type(), request.amountCents());
        TransactionRules.validateCategory(request.type(), category);

        Transaction transaction = new Transaction(
                UUID.randomUUID(),
                userId,
                request.type(),
                title,
                category,
                accountId,
                request.amountCents(),
                request.occurredAt().toInstant(),
                note
        );
        try {
            Transaction saved = transactions.saveAndFlush(transaction);
            log.info("Created transaction {} for user {}", saved.getId(), userId);
            return TransactionResponse.from(saved);
        } catch (DataIntegrityViolationException exception) {
            throw new InvalidTransactionException("Account was not found");
        }
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> findAll(UUID userId) {
        return transactions.findAllByUserIdOrderByOccurredAtDesc(userId).stream()
                .map(TransactionResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public TransactionResponse findById(UUID userId, UUID id) {
        return TransactionResponse.from(requireOwnedTransaction(userId, id));
    }

    @Transactional
    public TransactionResponse update(UUID userId, UUID id, UpdateTransactionRequest request) {
        Transaction transaction = requireOwnedTransaction(userId, id);
        TransactionRules.validateTypeUnchanged(transaction.getType(), request.type());

        String title = TransactionRules.normalizeTitle(request.title());
        String note = TransactionRules.normalizeNote(request.note());
        UUID accountId = requireOwnedAccount(userId, request.accountId());
        Category category = requireCategory(request.categoryId());
        TransactionRules.validateAmount(request.type(), request.amountCents());
        TransactionRules.validateCategory(request.type(), category);

        transaction.replace(
                title,
                category,
                accountId,
                request.amountCents(),
                request.occurredAt().toInstant(),
                note
        );
        try {
            transactions.flush();
        } catch (DataIntegrityViolationException exception) {
            throw new InvalidTransactionException("Account was not found");
        }
        log.info("Updated transaction {} for user {}", id, userId);
        return TransactionResponse.from(transaction);
    }

    @Transactional
    public void delete(UUID userId, UUID id) {
        if (!transactions.existsByIdAndUserId(id, userId)) {
            throw new TransactionNotFoundException(id);
        }
        transactions.deleteById(id);
        log.info("Deleted transaction {} for user {}", id, userId);
    }

    private Transaction requireOwnedTransaction(UUID userId, UUID id) {
        return transactions.findDetailedByIdAndUserId(id, userId)
                .orElseThrow(() -> new TransactionNotFoundException(id));
    }

    private UUID requireOwnedAccount(UUID userId, UUID accountId) {
        return accounts.findByIdAndUserId(accountId, userId)
                .map(account -> account.getId())
                .orElseThrow(() -> new InvalidTransactionException("Account was not found"));
    }

    private Category requireCategory(String categoryId) {
        return categories.findById(categoryId).orElseThrow(() -> new CategoryNotFoundException(categoryId));
    }
}
