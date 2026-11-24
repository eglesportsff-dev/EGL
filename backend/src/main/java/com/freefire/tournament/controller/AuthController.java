package com.freefire.tournament.controller;

import com.freefire.tournament.dto.AuthDtos.*;
import com.freefire.tournament.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public MessageResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/verify-otp")
    public MessageResponse verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        return authService.verifyOtp(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/email-status")
    public java.util.Map<String, Object> emailStatus() {
        return authService.getEmailStatus();
    }
}
