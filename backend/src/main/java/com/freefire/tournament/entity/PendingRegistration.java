package com.freefire.tournament.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "pending_registrations", indexes = {
        @Index(name = "idx_pending_email", columnList = "email", unique = true)
})
public class PendingRegistration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private String gameUid;

    @Column(columnDefinition = "text")
    private String profileScreenshotUrl;

    private String upiId;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private String otpHash;

    @Column(nullable = false)
    private Instant otpExpiresAt;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "referral_code", length = 32)
    private String referralCode;

    public Long getId() { return id; }
    
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
    
    public String getOtpHash() { return otpHash; }
    public void setOtpHash(String otpHash) { this.otpHash = otpHash; }
    
    public Instant getOtpExpiresAt() { return otpExpiresAt; }
    public void setOtpExpiresAt(Instant otpExpiresAt) { this.otpExpiresAt = otpExpiresAt; }
    
    public Instant getCreatedAt() { return createdAt; }

    public String getReferralCode() { return referralCode; }
    public void setReferralCode(String referralCode) { this.referralCode = referralCode; }
}
