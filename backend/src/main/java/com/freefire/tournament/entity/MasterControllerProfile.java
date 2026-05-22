package com.freefire.tournament.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "master_controllers")
public class MasterControllerProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    private User user;
    @Column(columnDefinition = "text")
    private String qrCodeUrl;
    @Column(nullable = false)
    private boolean active = true;
    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    public Long getId() { return id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getQrCodeUrl() { return qrCodeUrl; }
    public void setQrCodeUrl(String qrCodeUrl) { this.qrCodeUrl = qrCodeUrl; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
