package com.freefire.tournament.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "match_participants", uniqueConstraints = @UniqueConstraint(columnNames = {"match_id", "user_id"}))
public class MatchParticipant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private GameMatch match;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private User user;
    @ManyToOne(fetch = FetchType.LAZY)
    private Team team;
    @Column(nullable = false)
    private Instant joinedAt = Instant.now();

    public Long getId() { return id; }
    public GameMatch getMatch() { return match; }
    public void setMatch(GameMatch match) { this.match = match; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Team getTeam() { return team; }
    public void setTeam(Team team) { this.team = team; }
    public Instant getJoinedAt() { return joinedAt; }
}
