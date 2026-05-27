package com.freefire.tournament.service;

import com.freefire.tournament.dto.AppDtos.*;
import com.freefire.tournament.dto.AuthDtos.MessageResponse;
import com.freefire.tournament.entity.NotificationType;
import com.freefire.tournament.entity.PlayerMessage;
import com.freefire.tournament.entity.Role;
import com.freefire.tournament.entity.User;
import com.freefire.tournament.exception.ApiException;
import com.freefire.tournament.repository.PlayerMessageRepository;
import com.freefire.tournament.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class PlayerService {
    private final UserRepository users;
    private final PlayerMessageRepository messages;
    private final NotificationService notifications;
    private final PushNotificationService pushNotificationService;

    public PlayerService(UserRepository users, PlayerMessageRepository messages, 
                         NotificationService notifications, PushNotificationService pushNotificationService) {
        this.users = users;
        this.messages = messages;
        this.notifications = notifications;
        this.pushNotificationService = pushNotificationService;
    }

    @Transactional(readOnly = true)
    public List<ActivePlayerRow> getActivePlayers(int page, int size, String search, User loggedInUser) {
        Instant oneWeekAgo = Instant.now().minusSeconds(7 * 24 * 60 * 60);
        Instant oneMonthAgo = Instant.now().minusSeconds(30 * 24 * 60 * 60);
        String normalizedSearch = search == null ? "" : search.trim();
        Long excludeId = loggedInUser != null ? loggedInUser.getId() : -1L;
        
        Page<User> playerPage = users.findPlayers(
            Role.USER,
            excludeId,
            normalizedSearch,
            oneWeekAgo,
            oneMonthAgo,
            PageRequest.of(page, size)
        );
        
        return playerPage.stream()
            .map(u -> {
                String status;
                if (u.getLastActivityAt() != null && u.getLastActivityAt().isAfter(oneWeekAgo)) {
                    status = "ACTIVE";
                } else if (u.getLastActivityAt() != null && u.getLastActivityAt().isAfter(oneMonthAgo)) {
                    status = "RECENT";
                } else {
                    status = "INACTIVE";
                }
                return new ActivePlayerRow(u.getId(), u.getUsername(), u.getGameUid(), 
                                           u.getProfileScreenshotUrl(), u.getWinningPoints(), 
                                           status, u.getLastActivityAt());
            })
            .toList();
    }

    private boolean matchesSearch(User user, String normalizedSearch) {
        if (normalizedSearch.isBlank()) {
            return true;
        }

        String username = user.getUsername() == null ? "" : user.getUsername().toLowerCase(Locale.ROOT);
        String gameUid = user.getGameUid() == null ? "" : user.getGameUid().toLowerCase(Locale.ROOT);

        return username.contains(normalizedSearch) || gameUid.contains(normalizedSearch);
    }

    private int statusPriority(String status) {
        return switch (status) {
            case "ACTIVE" -> 0;
            case "RECENT" -> 1;
            default -> 2;
        };
    }

    @Transactional
    public MessageResponse sendMessage(SendMessageRequest request, User sender) {
        if (request.content().split("\\s+").length > 10) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Message must be 10 words or less");
        }

        User recipient = users.findById(request.recipientId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Recipient not found"));

        if (sender.getId().equals(recipient.getId())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Cannot send message to yourself");
        }

        PlayerMessage message = new PlayerMessage();
        message.setSender(sender);
        message.setRecipient(recipient);
        message.setContent(request.content());
        message.setCreatedAt(Instant.now());
        messages.save(message);

        // Update sender's last activity
        sender.setLastActivityAt(Instant.now());
        users.save(sender);

        // Auto delete old messages: only keep last 10 messages in this conversation
        List<PlayerMessage> conv = messages.findConversation(sender.getId(), recipient.getId());
        if (conv.size() > 10) {
            List<PlayerMessage> toDelete = conv.subList(10, conv.size());
            messages.deleteAll(toDelete);
        }

        // Trigger Web Push Notification to recipient!
        try {
            pushNotificationService.sendPushNotification(recipient, "New Message from " + sender.getUsername(), request.content());
        } catch (Exception e) {
            System.err.println("Failed to send message push notification: " + e.getMessage());
        }

        return new MessageResponse("Message sent successfully");
    }

    @Transactional
    public MessageResponse deleteConversation(Long otherUserId, User currentUser) {
        users.findById(otherUserId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        messages.deleteConversation(currentUser.getId(), otherUserId);
        return new MessageResponse("Conversation deleted successfully");
    }

    @Transactional(readOnly = true)
    public List<PlayerMessageRow> getMessages(Long otherUserId, User currentUser) {
        users.findById(otherUserId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        return messages.findConversation(currentUser.getId(), otherUserId).stream()
                .limit(10)
                .sorted(Comparator.comparing(PlayerMessage::getCreatedAt))
                .map(m -> new PlayerMessageRow(m.getId(), m.getSender().getId(),
                                              m.getSender().getUsername(), m.getContent(),
                                              m.isRead(), m.getCreatedAt()))
                .toList();
    }

    @Transactional
    public void markMessagesAsRead(Long senderId, User currentUser) {
        List<PlayerMessage> unreadMessages = messages.findByRecipientIdOrderByCreatedAtDesc(currentUser.getId())
                .stream()
                .filter(m -> m.getSender().getId().equals(senderId) && !m.isRead())
                .toList();

        unreadMessages.forEach(m -> {
            m.setRead(true);
            messages.save(m);
        });
    }

    @Transactional(readOnly = true)
    public List<MessageConversationRow> getConversations(User currentUser) {
        List<PlayerMessage> received = messages.findByRecipientIdOrderByCreatedAtDesc(currentUser.getId());
        List<PlayerMessage> sent = messages.findBySenderIdOrderByCreatedAtDesc(currentUser.getId());

        List<PlayerMessage> allMsgs = Stream.concat(received.stream(), sent.stream()).toList();

        Map<Long, User> uniqueParticipants = Stream.concat(
                    received.stream().map(PlayerMessage::getSender),
                    sent.stream().map(PlayerMessage::getRecipient)
                )
                .collect(Collectors.toMap(User::getId, user -> user, (existing, replacement) -> existing));

        return uniqueParticipants.values().stream()
                .map(user -> {
                    PlayerMessage lastMsg = allMsgs.stream()
                            .filter(m -> m.getSender().getId().equals(user.getId()) || m.getRecipient().getId().equals(user.getId()))
                            .max(Comparator.comparing(PlayerMessage::getCreatedAt))
                            .orElse(null);

                    boolean hasUnread = received.stream()
                            .anyMatch(m -> m.getSender().getId().equals(user.getId()) && !m.isRead());

                    return new MessageConversationRow(
                        user.getId(),
                        user.getUsername(),
                        user.getGameUid(),
                        user.getProfileScreenshotUrl(),
                        lastMsg != null ? lastMsg.getContent() : "",
                        hasUnread,
                        lastMsg != null ? lastMsg.getCreatedAt() : null
                    );
                })
                .sorted((c1, c2) -> {
                    if (c1.lastMessageTime() == null) return 1;
                    if (c2.lastMessageTime() == null) return -1;
                    return c2.lastMessageTime().compareTo(c1.lastMessageTime());
                })
                .toList();
    }
}
