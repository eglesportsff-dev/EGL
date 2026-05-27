package com.freefire.tournament.service;

import com.freefire.tournament.dto.AuthDtos.*;
import com.freefire.tournament.entity.Role;
import com.freefire.tournament.entity.User;
import com.freefire.tournament.exception.ApiException;
import com.freefire.tournament.entity.PendingRegistration;
import com.freefire.tournament.repository.PendingRegistrationRepository;
import com.freefire.tournament.repository.UserRepository;
import com.freefire.tournament.security.JwtService;
import com.freefire.tournament.util.CodeGenerator;
import com.freefire.tournament.entity.TransactionType;
import com.freefire.tournament.entity.WalletTransaction;
import com.freefire.tournament.entity.NotificationType;
import com.freefire.tournament.repository.WalletTransactionRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;

@Service
public class AuthService {
    private final UserRepository users;
    private final PendingRegistrationRepository pendingRegistrations;
    private final PasswordEncoder encoder;
    private final EmailService emailService;
    private final JwtService jwtService;
    private final WalletTransactionRepository transactions;
    private final NotificationService notifications;
    private final long otpTtlMinutes;

    public AuthService(UserRepository users, PendingRegistrationRepository pendingRegistrations,
                       PasswordEncoder encoder, EmailService emailService,
                       JwtService jwtService, WalletTransactionRepository transactions,
                       NotificationService notifications,
                       @Value("${app.otp.ttl-minutes}") long otpTtlMinutes) {
        this.users = users;
        this.pendingRegistrations = pendingRegistrations;
        this.encoder = encoder;
        this.emailService = emailService;
        this.jwtService = jwtService;
        this.transactions = transactions;
        this.notifications = notifications;
        this.otpTtlMinutes = otpTtlMinutes;
    }

    @Transactional
    public MessageResponse register(RegisterRequest request) {
        String emailLower = request.email().toLowerCase();
        
        // 1. Check if email is already registered in the users table
        if (users.existsByEmail(emailLower)) {
            throw new ApiException(HttpStatus.CONFLICT, "Email already registered");
        }

        // 2. Check if gaming UID is already registered in the users table
        if (users.existsByGameUid(request.gameUid())) {
            throw new ApiException(HttpStatus.CONFLICT, "Gaming UID already registered");
        }

        // 3. Generate new OTP
        String otp = CodeGenerator.otp();
        
        // Check if there is an existing pending registration for this email
        PendingRegistration pending = pendingRegistrations.findByEmail(emailLower).orElse(null);
        if (pending == null) {
            pending = new PendingRegistration();
            pending.setEmail(emailLower);
        }

        pending.setUsername(request.username());
        pending.setGameUid(request.gameUid());
        pending.setProfileScreenshotUrl(request.profileScreenshotUrl());
        pending.setUpiId(request.upiId());
        pending.setPasswordHash(encoder.encode(request.password()));
        pending.setOtpHash(otp); // Plain text storage for temporary OTP
        pending.setOtpExpiresAt(Instant.now().plusSeconds(otpTtlMinutes * 60));

        // Check if referral code is provided
        if (request.referralCode() != null && !request.referralCode().isBlank()) {
            String refCode = request.referralCode().trim();
            if (!users.findByUid(refCode).isPresent()) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid referral code");
            }
            pending.setReferralCode(refCode);
        } else {
            pending.setReferralCode(null);
        }
        
        pendingRegistrations.save(pending);
        
        emailService.sendOtp(pending.getEmail(), otp);
        return new MessageResponse("Registration started. Verify OTP sent to email.");
    }

    @Transactional
    public MessageResponse verifyOtp(VerifyOtpRequest request) {
        String emailLower = request.email().toLowerCase();
        
        // Check if user is already in the main users table (already verified)
        if (users.existsByEmail(emailLower)) {
            return new MessageResponse("Email already verified");
        }

        // Find the pending registration
        PendingRegistration pending = pendingRegistrations.findByEmail(emailLower)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "No registration pending for this email"));

        // Verify OTP
        if (pending.getOtpExpiresAt() == null || pending.getOtpExpiresAt().isBefore(Instant.now())
                || !pending.getOtpHash().equals(request.otp())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid or expired OTP");
        }

        // Create the actual user
        User user = new User();
        user.setUid(CodeGenerator.uid());
        user.setUsername(pending.getUsername());
        user.setGameUid(pending.getGameUid());
        user.setProfileScreenshotUrl(pending.getProfileScreenshotUrl());
        user.setUpiId(pending.getUpiId());
        user.setEmail(pending.getEmail());
        user.setPasswordHash(pending.getPasswordHash());
        user.setEmailVerified(true);
        
        User referrer = null;
        if (pending.getReferralCode() != null && !pending.getReferralCode().isBlank()) {
            referrer = users.findByUid(pending.getReferralCode()).orElse(null);
            if (referrer != null) {
                user.setReferredById(referrer.getId());
                user.setWalletBalance(BigDecimal.valueOf(5.00));
            }
        }

        users.save(user);

        // Record signup bonus transaction if referred
        if (referrer != null) {
            WalletTransaction tx = new WalletTransaction();
            tx.setUser(user);
            tx.setType(TransactionType.REFERRAL_BONUS);
            tx.setAmount(BigDecimal.valueOf(5.00));
            tx.setNote("Referral sign-up bonus");
            transactions.save(tx);

            notifications.notifyUser(user, NotificationType.PAYMENT, "Sign-up Bonus Credited",
                    "Rs 5.00 referral bonus has been added to your wallet.");
        }

        // Delete the pending registration record
        pendingRegistrations.delete(pending);

        return new MessageResponse("Email verified. Login with email and password.");
    }

    public AuthResponse login(LoginRequest request) {
        User user = users.findByEmail(request.email().toLowerCase())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "No account found with this email"));
        if (!user.isEmailVerified()) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Verify registration OTP before login");
        }
        if (!encoder.matches(request.password(), user.getPasswordHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Password is incorrect");
        }
        return response(user);
    }

    @Transactional
    public User createStaff(String username, String email, String password, Role role) {
        if (role == Role.ADMIN) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Admin accounts are managed by backend startup only");
        }
        if (users.existsByEmail(email.toLowerCase())) {
            throw new ApiException(HttpStatus.CONFLICT, "Email already registered");
        }
        User user = new User();
        user.setUid(CodeGenerator.uid());
        user.setUsername(username);
        user.setGameUid("STAFF-" + CodeGenerator.uid());
        user.setProfileScreenshotUrl("Staff account");
        user.setUpiId("staff@upi");
        user.setEmail(email.toLowerCase());
        user.setPasswordHash(encoder.encode(password));
        user.setRole(role);
        user.setEmailVerified(true);
        return users.save(user);
    }

    private AuthResponse response(User user) {
        return new AuthResponse(jwtService.createToken(user), user.getId(), user.getUid(),
                user.getUsername(), user.getGameUid(), user.getProfileScreenshotUrl(), user.getUpiId(),
                user.getEmail(), user.getRole());
    }
}
