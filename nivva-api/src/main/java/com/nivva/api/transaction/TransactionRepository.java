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
            join fetch t.account
            order by t.occurredAt desc
            """)
    List<Transaction> findAllByOrderByOccurredAtDesc();

    @Query("""
            select t from Transaction t
            join fetch t.category
            join fetch t.account
            where t.id = :id
            """)
    Optional<Transaction> findDetailedById(@Param("id") UUID id);
}
