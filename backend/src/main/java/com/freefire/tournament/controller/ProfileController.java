package com.freefire.tournament.controller;

import com.freefire.tournament.dto.AppDtos.UpdateProfileRequest;
import com.freefire.tournament.dto.AppDtos.UserProfile;
import com.freefire.tournament.service.CurrentUserService;
import com.freefire.tournament.service.ProfileService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {
    private final CurrentUserService currentUser;
    private final ProfileService profileService;

    public ProfileController(CurrentUserService currentUser, ProfileService profileService) {
        this.currentUser = currentUser;
        this.profileService = profileService;
    }

    @GetMapping
    public UserProfile me() {
        return profileService.profile(currentUser.get());
    }

    @PutMapping
    public UserProfile update(@Valid @RequestBody UpdateProfileRequest request) {
        return profileService.update(request, currentUser.get());
    }
}
