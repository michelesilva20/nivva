package com.nivva.api.transaction;

import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nivva.api.account.Account;
import com.nivva.api.account.AccountRepository;
import com.nivva.api.category.Category;
import com.nivva.api.category.CategoryRepository;
import com.nivva.api.common.error.AccountNotFoundException;
import com.nivva.api.common.error.CategoryNotFoundException;
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
    public TransactionResponse create(CreateTransactionRequest request) {
        String title = TransactionRules.normalizeTitle(request.title());
        String note = TransactionRules.normalizeNote(request.note());
        Account account = requireAccount(request.accountId());
        Category category = requireCategory(request.categoryId());
        TransactionRules.validateAmount(request.type(), request.amountCents());
        TransactionRules.validateCategory(request.type(), category);

        Transaction transaction = new Transaction(
                UUID.randomUUID(),
                request.type(),
                title,
                category,
                account,
                request.amountCents(),
                request.occurredAt().toInstant(),
                note
        );
        Transaction saved = transactions.save(transaction);
        log.info("Created transaction {}", saved.getId());
        return TransactionResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> findAll() {
        return transactions.findAllByOrderByOccurredAtDesc().stream().map(TransactionResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public TransactionResponse findById(UUID id) {
        return TransactionResponse.from(requireTransaction(id));
    }

    @Transactional
    public TransactionResponse update(UUID id, UpdateTransactionRequest request) {
        Transaction transaction = requireTransaction(id);
        TransactionRules.validateTypeUnchanged(transaction.getType(), request.type());

        String title = TransactionRules.normalizeTitle(request.title());
        String note = TransactionRules.normalizeNote(request.note());
        Account account = requireAccount(request.accountId());
        Category category = requireCategory(request.categoryId());
        TransactionRules.validateAmount(request.type(), request.amountCents());
        TransactionRules.validateCategory(request.type(), category);

        transaction.replace(
                title,
                category,
                account,
                request.amountCents(),
                request.occurredAt().toInstant(),
                note
        );
        log.info("Updated transaction {}", id);
        return TransactionResponse.from(transaction);
    }

    @Transactional
    public void delete(UUID id) {
        if (!transactions.existsById(id)) {
            throw new TransactionNotFoundException(id);
        }
        transactions.deleteById(id);
        log.info("Deleted transaction {}", id);
    }

    private Transaction requireTransaction(UUID id) {
        return transactions.findDetailedById(id).orElseThrow(() -> new TransactionNotFoundException(id));
    }

    private Account requireAccount(String accountId) {
        return accounts.findById(accountId).orElseThrow(() -> new AccountNotFoundException(accountId));
    }

    private Category requireCategory(String categoryId) {
        return categories.findById(categoryId).orElseThrow(() -> new CategoryNotFoundException(categoryId));
    }
}
