package com.nivva.api.goal;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;

public interface GoalRepository extends JpaRepository<Goal, UUID> {

    List<Goal> findAllByUserId(UUID userId);

    Optional<Goal> findByIdAndUserId(UUID id, UUID userId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT g FROM Goal g WHERE g.id = :id AND g.userId = :userId")
    Optional<Goal> findByIdAndUserIdForUpdate(@Param("id") UUID id, @Param("userId") UUID userId);
}
