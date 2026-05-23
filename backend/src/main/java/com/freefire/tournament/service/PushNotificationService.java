package com.freefire.tournament.service;

import com.freefire.tournament.entity.PushSubscription;
import com.freefire.tournament.entity.User;
import com.freefire.tournament.repository.PushSubscriptionRepository;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import nl.martijndwars.webpush.Subscription;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.security.*;
import java.security.interfaces.ECPrivateKey;
import java.security.interfaces.ECPublicKey;
import java.security.spec.ECGenParameterSpec;
import java.security.spec.ECPoint;
import java.util.Base64;
import java.util.List;
import java.util.Optional;

@Service
public class PushNotificationService {
    private final PushSubscriptionRepository repository;
    private final String mailTo;
    
    private String publicKey;
    private String privateKey;
    private PushService pushService;

    public PushNotificationService(
            PushSubscriptionRepository repository,
            @Value("${app.vapid.mailto:mailto:eglesportsff@gmail.com}") String mailTo,
            @Value("${app.vapid.public-key:}") String publicKey,
            @Value("${app.vapid.private-key:}") String privateKey) {
        this.repository = repository;
        this.mailTo = mailTo;
        this.publicKey = publicKey;
        this.privateKey = privateKey;
    }

    @PostConstruct
    public void init() {
        // Register BouncyCastle provider if not already present
        if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
            Security.addProvider(new BouncyCastleProvider());
        }

        // Load or generate VAPID keys
        if (publicKey == null || publicKey.isBlank() || privateKey == null || privateKey.isBlank()) {
            loadOrGenerateKeys();
        }

        try {
            this.pushService = new PushService(publicKey, privateKey, mailTo);
            System.out.println("PushNotificationService: Initialized successfully with VAPID Public Key: " + publicKey);
        } catch (Exception e) {
            System.err.println("PushNotificationService: Failed to initialize PushService: " + e.getMessage());
        }
    }

    private void loadOrGenerateKeys() {
        File keyFile = new File("vapid.keys");
        if (keyFile.exists()) {
            try {
                List<String> lines = Files.readAllLines(keyFile.toPath());
                if (lines.size() >= 2) {
                    this.publicKey = lines.get(0).trim();
                    this.privateKey = lines.get(1).trim();
                    System.out.println("PushNotificationService: Loaded VAPID keys from vapid.keys file");
                    return;
                }
            } catch (IOException e) {
                System.err.println("Failed to read vapid.keys file: " + e.getMessage());
            }
        }

        // Generate brand new VAPID keys
        try {
            KeyPairGenerator kpg = KeyPairGenerator.getInstance("EC", BouncyCastleProvider.PROVIDER_NAME);
            ECGenParameterSpec ecsp = new ECGenParameterSpec("secp256r1");
            kpg.initialize(ecsp);
            KeyPair kp = kpg.generateKeyPair();
            ECPrivateKey priv = (ECPrivateKey) kp.getPrivate();
            ECPublicKey pub = (ECPublicKey) kp.getPublic();

            // Encode Private Key
            byte[] privBytes = priv.getS().toByteArray();
            byte[] privateKeyBytes = new byte[32];
            if (privBytes.length > 32) {
                System.arraycopy(privBytes, privBytes.length - 32, privateKeyBytes, 0, 32);
            } else {
                System.arraycopy(privBytes, 0, privateKeyBytes, 32 - privBytes.length, privBytes.length);
            }

            // Encode Public Key
            ECPoint w = pub.getW();
            byte[] xBytes = w.getAffineX().toByteArray();
            byte[] yBytes = w.getAffineY().toByteArray();

            byte[] publicKeyBytes = new byte[65];
            publicKeyBytes[0] = 0x04;
            int xLen = xBytes.length;
            if (xLen > 32) {
                System.arraycopy(xBytes, xLen - 32, publicKeyBytes, 1, 32);
            } else {
                System.arraycopy(xBytes, 0, publicKeyBytes, 1 + 32 - xLen, xLen);
            }
            int yLen = yBytes.length;
            if (yLen > 32) {
                System.arraycopy(yBytes, yLen - 32, publicKeyBytes, 33, 32);
            } else {
                System.arraycopy(yBytes, 0, publicKeyBytes, 33 + 32 - yLen, yLen);
            }

            this.publicKey = Base64.getUrlEncoder().withoutPadding().encodeToString(publicKeyBytes);
            this.privateKey = Base64.getUrlEncoder().withoutPadding().encodeToString(privateKeyBytes);

            // Write to file for persistence
            Files.write(keyFile.toPath(), List.of(this.publicKey, this.privateKey));
            System.out.println("PushNotificationService: Generated new persistent VAPID keys and saved to vapid.keys");

        } catch (Exception e) {
            System.err.println("Failed to generate VAPID keys: " + e.getMessage());
        }
    }

    public String getPublicKey() {
        return publicKey;
    }

    @Transactional
    public void subscribe(User user, String endpoint, String p256dh, String auth) {
        Optional<PushSubscription> existing = repository.findByEndpoint(endpoint);
        if (existing.isPresent()) {
            PushSubscription sub = existing.get();
            sub.setUser(user);
            sub.setP256dh(p256dh);
            sub.setAuth(auth);
            repository.save(sub);
        } else {
            PushSubscription sub = new PushSubscription();
            sub.setUser(user);
            sub.setEndpoint(endpoint);
            sub.setP256dh(p256dh);
            sub.setAuth(auth);
            repository.save(sub);
        }
    }

    @Transactional
    public void unsubscribe(String endpoint) {
        repository.deleteByEndpoint(endpoint);
    }

    public void sendPushNotification(User user, String title, String body) {
        List<PushSubscription> subs = repository.findByUserId(user.getId());
        if (subs.isEmpty()) return;

        // payload in JSON format
        String payload = String.format("{\"title\":\"%s\", \"body\":\"%s\"}", 
            title.replace("\"", "\\\""), 
            body.replace("\"", "\\\"")
        );

        for (PushSubscription sub : subs) {
            try {
                Subscription subscription = new Subscription(
                    sub.getEndpoint(),
                    new Subscription.Keys(sub.getP256dh(), sub.getAuth())
                );
                Notification notification = new Notification(subscription, payload);
                pushService.sendAsync(notification);
            } catch (Exception e) {
                // If it fails with 410 Gone (unsubscribed), we can clean it up
                if (e.getMessage() != null && (e.getMessage().contains("410") || e.getMessage().contains("404"))) {
                    try {
                        cleanupSubscription(sub.getEndpoint());
                    } catch (Exception ex) {
                        // ignore
                    }
                }
                System.err.println("Failed to send push notification to subscription " + sub.getId() + ": " + e.getMessage());
            }
        }
    }

    @Transactional
    public void cleanupSubscription(String endpoint) {
        repository.deleteByEndpoint(endpoint);
    }
}
