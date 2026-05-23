package com.freefire.tournament.controller;

import com.freefire.tournament.dto.AppDtos.PushSubscriptionRequest;
import com.freefire.tournament.dto.AppDtos.VapidPublicKeyResponse;
import com.freefire.tournament.dto.AuthDtos.MessageResponse;
import com.freefire.tournament.entity.User;
import com.freefire.tournament.service.CurrentUserService;
import com.freefire.tournament.service.PushNotificationService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/push")
public class PushController {
    private final PushNotificationService pushService;
    private final CurrentUserService currentUser;

    public PushController(PushNotificationService pushService, CurrentUserService currentUser) {
        this.pushService = pushService;
        this.currentUser = currentUser;
    }

    @GetMapping("/vapid-public-key")
    public VapidPublicKeyResponse getVapidPublicKey() {
        return new VapidPublicKeyResponse(pushService.getPublicKey());
    }

    @PostMapping("/subscribe")
    public MessageResponse subscribe(@Valid @RequestBody PushSubscriptionRequest request) {
        User user = currentUser.get();
        pushService.subscribe(user, request.endpoint(), request.p256dh(), request.auth());
        return new MessageResponse("Subscribed to push notifications successfully");
    }

    @PostMapping("/unsubscribe")
    public MessageResponse unsubscribe(@RequestParam String endpoint) {
        pushService.unsubscribe(endpoint);
        return new MessageResponse("Unsubscribed from push notifications successfully");
    }
}
