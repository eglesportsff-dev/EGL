package com.freefire.tournament.service;

import com.freefire.tournament.dto.AppDtos.PlayerUpdateRequest;
import com.freefire.tournament.dto.AppDtos.UpdateSummary;
import com.freefire.tournament.entity.NotificationType;
import com.freefire.tournament.entity.Role;
import com.freefire.tournament.entity.TournamentUpdate;
import com.freefire.tournament.exception.ApiException;
import com.freefire.tournament.repository.TournamentUpdateRepository;
import com.freefire.tournament.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TournamentUpdateService {
    private static final int MAX_UPDATE_WORDS = 500;

    private final TournamentUpdateRepository updates;
    private final UserRepository users;
    private final NotificationService notifications;

    public TournamentUpdateService(TournamentUpdateRepository updates, UserRepository users,
                                   NotificationService notifications) {
        this.updates = updates;
        this.users = users;
        this.notifications = notifications;
    }

    @Transactional
    public UpdateSummary sendToAllPlayers(PlayerUpdateRequest request) {
        if (wordCount(request.message()) >= MAX_UPDATE_WORDS) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Update message must be less than 500 words");
        }
        TournamentUpdate update = new TournamentUpdate();
        update.setTitle(request.title().trim());
        update.setMessage(request.message().trim());
        TournamentUpdate saved = updates.save(update);
        notifications.notifyUsers(users.findByRole(Role.USER), NotificationType.UPDATE, saved.getTitle(), saved.getMessage());
        return new UpdateSummary(saved.getId(), saved.getTitle(), saved.getMessage(), saved.getCreatedAt());
    }

    private int wordCount(String value) {
        String text = value == null ? "" : value.trim();
        if (text.isEmpty()) {
            return 0;
        }
        return text.split("\\s+").length;
    }
}
