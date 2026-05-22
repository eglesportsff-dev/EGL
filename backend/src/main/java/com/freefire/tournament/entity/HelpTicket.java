package com.freefire.tournament.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "help_tickets", indexes = {
        @Index(name = "idx_help_user", columnList = "user_id"),
        @Index(name = "idx_help_status", columnList = "status")
})
public class HelpTicket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private User user;
    @Column(nullable = false, length = 120)
    private String subject;
    @Column(nullable = false, columnDefinition = "text")
    private String message;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private HelpTicketStatus status = HelpTicketStatus.OPEN;
    @Column(columnDefinition = "text")
    private String masterResponse;
    @ManyToOne(fetch = FetchType.LAZY)
    private User reviewedBy;
    @Column(nullable = false)
    private Instant createdAt = Instant.now();
    @Column(nullable = false)
    private Instant updatedAt = Instant.now();
    private Instant respondedAt;

    public Long getId() { return id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public HelpTicketStatus getStatus() { return status; }
    public void setStatus(HelpTicketStatus status) { this.status = status; }
    public String getMasterResponse() { return masterResponse; }
    public void setMasterResponse(String masterResponse) { this.masterResponse = masterResponse; }
    public User getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(User reviewedBy) { this.reviewedBy = reviewedBy; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
    public Instant getRespondedAt() { return respondedAt; }
    public void setRespondedAt(Instant respondedAt) { this.respondedAt = respondedAt; }
}
