package com.freefire.tournament.service;

import com.freefire.tournament.dto.AppDtos.HelpReplyRequest;
import com.freefire.tournament.dto.AppDtos.HelpTicketRequest;
import com.freefire.tournament.dto.AppDtos.HelpTicketResponse;
import com.freefire.tournament.dto.AppDtos.PagedResponse;
import com.freefire.tournament.entity.HelpTicket;
import com.freefire.tournament.entity.HelpTicketStatus;
import com.freefire.tournament.entity.User;
import com.freefire.tournament.exception.ApiException;
import com.freefire.tournament.repository.HelpTicketRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class HelpService {
    private final HelpTicketRepository tickets;

    public HelpService(HelpTicketRepository tickets) {
        this.tickets = tickets;
    }

    @Transactional
    public HelpTicketResponse createTicket(User user, HelpTicketRequest request) {
        HelpTicket ticket = new HelpTicket();
        ticket.setUser(user);
        ticket.setSubject(request.subject().trim());
        ticket.setMessage(request.message().trim());
        return toResponse(tickets.save(ticket));
    }

    @Transactional(readOnly = true)
    public PagedResponse<HelpTicketResponse> userTickets(User user, int page, int size) {
        var result = tickets.findByUserIdOrderByUpdatedAtDesc(user.getId(),
                PageRequest.of(Math.max(page, 0), Math.min(size, 8)));
        return paged(result.map(this::toResponse));
    }

    @Transactional(readOnly = true)
    public PagedResponse<HelpTicketResponse> masterTickets(int page, int size) {
        var result = tickets.findAllByOrderByUpdatedAtDesc(PageRequest.of(Math.max(page, 0), Math.min(size, 8)));
        return paged(result.map(this::toResponse));
    }

    @Transactional
    public HelpTicketResponse respond(User master, HelpReplyRequest request) {
        HelpTicket ticket = tickets.findById(request.ticketId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Help ticket not found"));
        HelpTicketStatus status = request.status() == null ? HelpTicketStatus.RESPONDED : request.status();
        if (status == HelpTicketStatus.OPEN) {
            status = HelpTicketStatus.IN_REVIEW;
        }
        ticket.setReviewedBy(master);
        ticket.setMasterResponse(request.response().trim());
        ticket.setStatus(status);
        ticket.setRespondedAt(Instant.now());
        ticket.setUpdatedAt(Instant.now());
        return toResponse(ticket);
    }

    private PagedResponse<HelpTicketResponse> paged(org.springframework.data.domain.Page<HelpTicketResponse> result) {
        return new PagedResponse<>(result.getContent(), result.getNumber(), result.getSize(),
                result.getTotalElements(), result.getTotalPages());
    }

    private HelpTicketResponse toResponse(HelpTicket ticket) {
        User user = ticket.getUser();
        return new HelpTicketResponse(ticket.getId(), user.getUsername(), user.getUid(), user.getEmail(),
                ticket.getSubject(), ticket.getMessage(), ticket.getStatus(), ticket.getMasterResponse(),
                ticket.getCreatedAt(), ticket.getUpdatedAt(), ticket.getRespondedAt());
    }
}
