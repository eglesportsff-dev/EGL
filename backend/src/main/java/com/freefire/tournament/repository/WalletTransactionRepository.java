package com.freefire.tournament.repository;

import com.freefire.tournament.entity.TransactionType;
import com.freefire.tournament.entity.WalletTransaction;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.math.BigDecimal;
import java.util.Collection;
import java.util.List;

public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {
    List<WalletTransaction> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    @Query("select coalesce(sum(w.amount), 0) from WalletTransaction w where w.type = :type")
    BigDecimal sumByType(TransactionType type);

    long countByTypeIn(Collection<TransactionType> types);

    void deleteByTypeIn(Collection<TransactionType> types);
}
