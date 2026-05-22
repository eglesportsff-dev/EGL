package com.freefire.tournament.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "matches", indexes = {
        @Index(name = "idx_matches_type", columnList = "game_type,variant"),
        @Index(name = "idx_matches_match_time", columnList = "match_time"),
        @Index(name = "idx_matches_active", columnList = "active")
})
public class GameMatch {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String title;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GameType gameType;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MatchVariant variant;
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal entryFee;
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal firstReward;
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal secondReward;
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal thirdReward;
    @Column(nullable = false)
    private Integer roomSize;
    private Instant matchTime;
    @Column(nullable = false)
    private Instant registerBefore;
    @Column(nullable = false)
    private boolean active = true;
    @Column(nullable = false)
    private boolean teamOnly = false;
    private String roomId;
    private String roomPassword;
    @ManyToOne(fetch = FetchType.LAZY)
    private User createdBy;

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public GameType getGameType() { return gameType; }
    public void setGameType(GameType gameType) { this.gameType = gameType; }
    public MatchVariant getVariant() { return variant; }
    public void setVariant(MatchVariant variant) { this.variant = variant; }
    public BigDecimal getEntryFee() { return entryFee; }
    public void setEntryFee(BigDecimal entryFee) { this.entryFee = entryFee; }
    public BigDecimal getFirstReward() { return firstReward; }
    public void setFirstReward(BigDecimal firstReward) { this.firstReward = firstReward; }
    public BigDecimal getSecondReward() { return secondReward; }
    public void setSecondReward(BigDecimal secondReward) { this.secondReward = secondReward; }
    public BigDecimal getThirdReward() { return thirdReward; }
    public void setThirdReward(BigDecimal thirdReward) { this.thirdReward = thirdReward; }
    public Integer getRoomSize() { return roomSize; }
    public void setRoomSize(Integer roomSize) { this.roomSize = roomSize; }
    public Instant getMatchTime() { return matchTime; }
    public void setMatchTime(Instant matchTime) { this.matchTime = matchTime; }
    public Instant getRegisterBefore() { return registerBefore; }
    public void setRegisterBefore(Instant registerBefore) { this.registerBefore = registerBefore; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public boolean isTeamOnly() { return teamOnly; }
    public void setTeamOnly(boolean teamOnly) { this.teamOnly = teamOnly; }
    public String getRoomId() { return roomId; }
    public void setRoomId(String roomId) { this.roomId = roomId; }
    public String getRoomPassword() { return roomPassword; }
    public void setRoomPassword(String roomPassword) { this.roomPassword = roomPassword; }
    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }
}
