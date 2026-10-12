package com.nivva.api.transaction;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    @Query("""
            select t from Transaction t
            join fetch t.category
            where t.userId = :userId
            order by t.occurredAt desc
            """)
    List<Transaction> findAllByUserIdOrderByOccurredAtDesc(@Param("userId") UUID userId);

    @Query("""
            select t from Transaction t
            join fetch t.category
            where t.id = :id and t.userId = :userId
            """)
    Optional<Transaction> findDetailedByIdAndUserId(@Param("id") UUID id, @Param("userId") UUID userId);

    boolean existsByIdAndUserId(UUID id, UUID userId);

    boolean existsByUserIdAndAccountId(UUID userId, UUID accountId);
}
