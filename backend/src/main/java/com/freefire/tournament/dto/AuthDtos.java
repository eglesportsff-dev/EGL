package com.freefire.tournament.dto;

import com.freefire.tournament.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthDtos {
    public record RegisterRequest(
            @NotBlank @Size(min = 3, max = 40) String username,
            @NotBlank @Size(min = 4, max = 40) String gameUid,
            @NotBlank @Size(max = 5000000) String profileScreenshotUrl,
            @NotBlank @Size(min = 3, max = 80) String upiId,
            @Email @NotBlank String email,
            @NotBlank @Size(min = 8, max = 80) String password,
            String referralCode
    ) {}

    public record VerifyOtpRequest(@Email @NotBlank String email, @NotBlank String otp) {}

    public record LoginRequest(@Email @NotBlank String email, @NotBlank String password) {}

    public record AuthResponse(String token, Long id, String uid, String username, String gameUid,
                               String profileScreenshotUrl, String upiId, String email, Role role) {}

    public record MessageResponse(String message) {}
}
