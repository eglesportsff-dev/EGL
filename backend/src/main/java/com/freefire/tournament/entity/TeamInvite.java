package com.freefire.tournament.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "team_invites", uniqueConstraints = @UniqueConstraint(columnNames = {"match_id", "invitee_id"}), indexes = {
        @Index(name = "idx_team_invites_match", columnList = "match_id"),
        @Index(name = "idx_team_invites_invitee", columnList = "invitee_id"),
        @Index(name = "idx_team_invites_team", columnList = "team_id")
})
public class TeamInvite {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private GameMatch match;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Team team;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private User inviter;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private User invitee;

    @Column(nullable = false)
    private boolean accepted = false;

    @Column(nullable = false)
    private boolean rejected = false;

    @Column(length = 240)
    private String note;

    @Column(length = 240)
    private String responseNote;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    private Instant acceptedAt;
    private Instant rejectedAt;

    public Long getId() { return id; }
    public GameMatch getMatch() { return match; }
    public void setMatch(GameMatch match) { this.match = match; }
    public Team getTeam() { return team; }
    public void setTeam(Team team) { this.team = team; }
    public User getInviter() { return inviter; }
    public void setInviter(User inviter) { this.inviter = inviter; }
    public User getInvitee() { return invitee; }
    public void setInvitee(User invitee) { this.invitee = invitee; }
    public boolean isAccepted() { return accepted; }
    public void setAccepted(boolean accepted) { this.accepted = accepted; }
    public boolean isRejected() { return rejected; }
    public void setRejected(boolean rejected) { this.rejected = rejected; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public String getResponseNote() { return responseNote; }
    public void setResponseNote(String responseNote) { this.responseNote = responseNote; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getAcceptedAt() { return acceptedAt; }
    public void setAcceptedAt(Instant acceptedAt) { this.acceptedAt = acceptedAt; }
    public Instant getRejectedAt() { return rejectedAt; }
    public void setRejectedAt(Instant rejectedAt) { this.rejectedAt = rejectedAt; }
}
