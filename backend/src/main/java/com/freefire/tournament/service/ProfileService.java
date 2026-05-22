package com.freefire.tournament.service;

import com.freefire.tournament.dto.AppDtos.UpdateProfileRequest;
import com.freefire.tournament.dto.AppDtos.UserProfile;
import com.freefire.tournament.entity.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProfileService {
    public UserProfile profile(User user) {
        return new UserProfile(user.getId(), user.getUid(), user.getUsername(), user.getGameUid(),
                user.getProfileScreenshotUrl(), user.getUpiId(), user.getEmail(), user.getRole(),
                user.getWalletBalance(), user.getWinningPoints(), user.isEmailVerified(),
                "Password is encrypted and cannot be displayed. Keep your password safe.");
    }

    @Transactional
    public UserProfile update(UpdateProfileRequest request, User user) {
        user.setUpiId(request.upiId());
        return profile(user);
    }
}
