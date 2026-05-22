package com.freefire.tournament.repository;

import com.freefire.tournament.entity.HelpTicket;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HelpTicketRepository extends JpaRepository<HelpTicket, Long> {
    Page<HelpTicket> findByUserIdOrderByUpdatedAtDesc(Long userId, Pageable pageable);
    Page<HelpTicket> findAllByOrderByUpdatedAtDesc(Pageable pageable);
}
