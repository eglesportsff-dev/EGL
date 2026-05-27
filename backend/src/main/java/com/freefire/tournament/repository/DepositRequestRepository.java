package com.freefire.tournament.repository;

import com.freefire.tournament.entity.DepositRequest;
import com.freefire.tournament.entity.RequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Collection;
import java.util.List;

public interface DepositRequestRepository extends JpaRepository<DepositRequest, Long> {
    List<DepositRequest> findTop20ByStatusOrderByCreatedAtAsc(RequestStatus status);
    List<DepositRequest> findTop8ByUserIdOrderByCreatedAtDesc(Long userId);
    Page<DepositRequest> findByStatusOrderByCreatedAtAsc(RequestStatus status, Pageable pageable);
    boolean existsByUtrNumberAndStatusIn(String utrNumber, Collection<RequestStatus> statuses);
    boolean existsByUserIdAndStatus(Long userId, RequestStatus status);
    long countByStatus(RequestStatus status);
}
