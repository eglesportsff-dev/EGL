package com.freefire.tournament.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "controller_reviews", indexes = {
        @Index(name = "idx_controller_reviews_reviewed_at", columnList = "reviewed_at"),
        @Index(name = "idx_controller_reviews_controller", columnList = "controller_id")
})
public class ControllerReview {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long matchId;
    @Column(nullable = false)
    private String matchTitle;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GameType gameType;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MatchVariant variant;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private User controller;
    @Column(nullable = false, columnDefinition = "text")
    private String winnerSummary;
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal rewardsUpdated = BigDecimal.ZERO;
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal pointsUpdated = BigDecimal.ZERO;
    @Column(nullable = false)
    private int positionsUpdated;
    @Column(nullable = false, name = "reviewed_at")
    private Instant reviewedAt = Instant.now();

    public Long getId() { return id; }
    public Long getMatchId() { return matchId; }
    public void setMatchId(Long matchId) { this.matchId = matchId; }
    public String getMatchTitle() { return matchTitle; }
    public void setMatchTitle(String matchTitle) { this.matchTitle = matchTitle; }
    public GameType getGameType() { return gameType; }
    public void setGameType(GameType gameType) { this.gameType = gameType; }
    public MatchVariant getVariant() { return variant; }
    public void setVariant(MatchVariant variant) { this.variant = variant; }
    public User getController() { return controller; }
    public void setController(User controller) { this.controller = controller; }
    public String getWinnerSummary() { return winnerSummary; }
    public void setWinnerSummary(String winnerSummary) { this.winnerSummary = winnerSummary; }
    public BigDecimal getRewardsUpdated() { return rewardsUpdated; }
    public void setRewardsUpdated(BigDecimal rewardsUpdated) { this.rewardsUpdated = rewardsUpdated; }
    public BigDecimal getPointsUpdated() { return pointsUpdated; }
    public void setPointsUpdated(BigDecimal pointsUpdated) { this.pointsUpdated = pointsUpdated; }
    public int getPositionsUpdated() { return positionsUpdated; }
    public void setPositionsUpdated(int positionsUpdated) { this.positionsUpdated = positionsUpdated; }
    public Instant getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(Instant reviewedAt) { this.reviewedAt = reviewedAt; }
}
