package com.freefire.tournament.controller;

import com.freefire.tournament.dto.AppDtos.NotificationCenter;
import com.freefire.tournament.dto.AuthDtos.MessageResponse;
import com.freefire.tournament.service.CurrentUserService;
import com.freefire.tournament.service.NotificationService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationService notificationService;
    private final CurrentUserService currentUser;

    public NotificationController(NotificationService notificationService, CurrentUserService currentUser) {
        this.notificationService = notificationService;
        this.currentUser = currentUser;
    }

    @GetMapping
    public NotificationCenter center() {
        return notificationService.center(currentUser.get());
    }

    @PostMapping("/read")
    public MessageResponse markRead() {
        notificationService.markAllSeen(currentUser.get());
        return new MessageResponse("Notifications marked as read");
    }
}
