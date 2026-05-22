package com.freefire.tournament.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "users", indexes = {
        @Index(name = "idx_users_email", columnList = "email", unique = true),
        @Index(name = "idx_users_uid", columnList = "uid", unique = true),
        @Index(name = "idx_users_role", columnList = "role")
})
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true)
    private String uid;
    @Column(nullable = false)
    private String username;
    @Column(unique = true)
    private String gameUid;
    @Column(columnDefinition = "text")
    private String profileScreenshotUrl;
    private String upiId;
    @Column(nullable = false, unique = true)
    private String email;
    @Column(nullable = false)
    private String passwordHash;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.USER;
    @Column(nullable = false)
    private boolean emailVerified = false;
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal walletBalance = BigDecimal.ZERO;
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal winningPoints = BigDecimal.ZERO;
    private String otpHash;
    private Instant otpExpiresAt;
    @Column(nullable = false)
    private Instant createdAt = Instant.now();
    private Instant lastActivityAt;

    public Long getId() { return id; }
    public String getUid() { return uid; }
    public void setUid(String uid) { this.uid = uid; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getGameUid() { return gameUid; }
    public void setGameUid(String gameUid) { this.gameUid = gameUid; }
    public String getProfileScreenshotUrl() { return profileScreenshotUrl; }
    public void setProfileScreenshotUrl(String profileScreenshotUrl) { this.profileScreenshotUrl = profileScreenshotUrl; }
    public String getUpiId() { return upiId; }
    public void setUpiId(String upiId) { this.upiId = upiId; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public boolean isEmailVerified() { return emailVerified; }
    public void setEmailVerified(boolean emailVerified) { this.emailVerified = emailVerified; }
    public BigDecimal getWalletBalance() { return walletBalance; }
    public void setWalletBalance(BigDecimal walletBalance) { this.walletBalance = walletBalance; }
    public BigDecimal getWinningPoints() { return winningPoints; }
    public void setWinningPoints(BigDecimal winningPoints) { this.winningPoints = winningPoints; }
    public String getOtpHash() { return otpHash; }
    public void setOtpHash(String otpHash) { this.otpHash = otpHash; }
    public Instant getOtpExpiresAt() { return otpExpiresAt; }
    public void setOtpExpiresAt(Instant otpExpiresAt) { this.otpExpiresAt = otpExpiresAt; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getLastActivityAt() { return lastActivityAt; }
    public void setLastActivityAt(Instant lastActivityAt) { this.lastActivityAt = lastActivityAt; }
}
