package com.freefire.tournament.service;

import com.freefire.tournament.dto.AuthDtos.*;
import com.freefire.tournament.entity.Role;
import com.freefire.tournament.entity.User;
import com.freefire.tournament.exception.ApiException;
import com.freefire.tournament.repository.UserRepository;
import com.freefire.tournament.security.JwtService;
import com.freefire.tournament.util.CodeGenerator;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class AuthService {
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final EmailService emailService;
    private final JwtService jwtService;
    private final long otpTtlMinutes;

    public AuthService(UserRepository users, PasswordEncoder encoder, EmailService emailService,
                       JwtService jwtService,
                       @Value("${app.otp.ttl-minutes}") long otpTtlMinutes) {
        this.users = users;
        this.encoder = encoder;
        this.emailService = emailService;
        this.jwtService = jwtService;
        this.otpTtlMinutes = otpTtlMinutes;
    }

    @Transactional
    public MessageResponse register(RegisterRequest request) {
        if (users.existsByEmail(request.email())) {
            throw new ApiException(HttpStatus.CONFLICT, "Email already registered");
        }
        if (users.existsByGameUid(request.gameUid())) {
            throw new ApiException(HttpStatus.CONFLICT, "Gaming UID already registered");
        }
        String otp = CodeGenerator.otp();
        User user = new User();
        user.setUid(CodeGenerator.uid());
        user.setUsername(request.username());
        user.setGameUid(request.gameUid());
        user.setProfileScreenshotUrl(request.profileScreenshotUrl());
        user.setUpiId(request.upiId());
        user.setEmail(request.email().toLowerCase());
        user.setPasswordHash(encoder.encode(request.password()));
        user.setOtpHash(encoder.encode(otp));
        user.setOtpExpiresAt(Instant.now().plusSeconds(otpTtlMinutes * 60));
        users.save(user);
        emailService.sendOtp(user.getEmail(), otp);
        return new MessageResponse("Registration started. Verify OTP sent to email.");
    }

    @Transactional
    public MessageResponse verifyOtp(VerifyOtpRequest request) {
        User user = users.findByEmail(request.email().toLowerCase())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        if (user.isEmailVerified()) {
            return new MessageResponse("Email already verified");
        }
        if (user.getOtpExpiresAt() == null || user.getOtpExpiresAt().isBefore(Instant.now())
                || !encoder.matches(request.otp(), user.getOtpHash())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid or expired OTP");
        }
        user.setEmailVerified(true);
        user.setOtpHash(null);
        user.setOtpExpiresAt(null);
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
