package com.freefire.tournament.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "teams", indexes = @Index(name = "idx_teams_total_points", columnList = "total_winning_points"))
public class Team {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true)
    private String name;
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal totalWinningPoints = BigDecimal.ZERO;
    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public BigDecimal getTotalWinningPoints() { return totalWinningPoints; }
    public void setTotalWinningPoints(BigDecimal totalWinningPoints) { this.totalWinningPoints = totalWinningPoints; }
}
