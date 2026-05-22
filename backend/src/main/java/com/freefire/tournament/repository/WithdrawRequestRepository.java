package com.freefire.tournament.repository;

import com.freefire.tournament.entity.RequestStatus;
import com.freefire.tournament.entity.WithdrawRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Collection;
import java.util.List;

public interface WithdrawRequestRepository extends JpaRepository<WithdrawRequest, Long> {
    List<WithdrawRequest> findTop20ByStatusOrderByCreatedAtAsc(RequestStatus status);
    List<WithdrawRequest> findTop8ByUserIdOrderByCreatedAtDesc(Long userId);
    Page<WithdrawRequest> findByStatusOrderByCreatedAtAsc(RequestStatus status, Pageable pageable);
    Page<WithdrawRequest> findByStatusInOrderByCreatedAtAsc(Collection<RequestStatus> statuses, Pageable pageable);
    boolean existsByUserIdAndStatusIn(Long userId, Collection<RequestStatus> statuses);
    long countByStatus(RequestStatus status);
}
