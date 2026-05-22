package com.freefire.tournament.controller;

import com.freefire.tournament.dto.AppDtos.*;
import com.freefire.tournament.dto.AuthDtos.MessageResponse;
import com.freefire.tournament.service.CurrentUserService;
import com.freefire.tournament.service.PlayerService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/players")
public class PlayerController {
    private final PlayerService playerService;
    private final CurrentUserService currentUser;

    public PlayerController(PlayerService playerService, CurrentUserService currentUser) {
        this.playerService = playerService;
        this.currentUser = currentUser;
    }

    @GetMapping("/active")
    public List<ActivePlayerRow> getActivePlayers(@RequestParam(defaultValue = "0") int page,
                                                   @RequestParam(defaultValue = "10") int size,
                                                   @RequestParam(required = false) String q) {
        return playerService.getActivePlayers(page, size, q);
    }

    @PostMapping("/messages/send")
    public MessageResponse sendMessage(@Valid @RequestBody SendMessageRequest request) {
        return playerService.sendMessage(request, currentUser.get());
    }

    @GetMapping("/messages/{userId}")
    public List<PlayerMessageRow> getMessages(@PathVariable Long userId) {
        return playerService.getMessages(userId, currentUser.get());
    }

    @PostMapping("/messages/{userId}/read")
    public MessageResponse markAsRead(@PathVariable Long userId) {
        playerService.markMessagesAsRead(userId, currentUser.get());
        return new MessageResponse("Messages marked as read");
    }

    @DeleteMapping("/messages/{userId}")
    public MessageResponse deleteConversation(@PathVariable Long userId) {
        return playerService.deleteConversation(userId, currentUser.get());
    }

    @GetMapping("/conversations")
    public List<MessageConversationRow> getConversations() {
        return playerService.getConversations(currentUser.get());
    }
}
