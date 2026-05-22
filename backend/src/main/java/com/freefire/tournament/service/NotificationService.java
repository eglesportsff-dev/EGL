package com.freefire.tournament.service;

import com.freefire.tournament.dto.AppDtos.NotificationCenter;
import com.freefire.tournament.dto.AppDtos.NotificationSummary;
import com.freefire.tournament.entity.NotificationType;
import com.freefire.tournament.entity.User;
import com.freefire.tournament.entity.UserNotification;
import com.freefire.tournament.repository.UserNotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.List;

@Service
public class NotificationService {
    private static final int MAX_NOTIFICATIONS_PER_USER = 12;

    private final UserNotificationRepository notifications;

    public NotificationService(UserNotificationRepository notifications) {
        this.notifications = notifications;
    }

    @Transactional
    public void notifyUser(User user, NotificationType type, String title, String message) {
        notifyUser(user, type, title, message, null);
    }

    @Transactional
    public void notifyUser(User user, NotificationType type, String title, String message, Long referenceId) {
        if (user == null || user.getId() == null) {
            return;
        }
        UserNotification notification = new UserNotification();
        notification.setUser(user);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setReferenceId(referenceId);
        notifications.save(notification);
        trim(user.getId());
    }

    @Transactional
    public void notifyUsers(Collection<User> users, NotificationType type, String title, String message) {
        users.forEach(user -> notifyUser(user, type, title, message));
    }

    @Transactional
    public void notifyUsers(Collection<User> users, NotificationType type, String title, String message, Long referenceId) {
        users.forEach(user -> notifyUser(user, type, title, message, referenceId));
    }

    @Transactional
    public NotificationCenter center(User user) {
        trim(user.getId());
        return new NotificationCenter(latest(user.getId()), notifications.countByUserIdAndSeenFalse(user.getId()));
    }

    @Transactional
    public void markAllSeen(User user) {
        notifications.findByUserIdAndSeenFalse(user.getId()).forEach(notification -> notification.setSeen(true));
    }

    private List<NotificationSummary> latest(Long userId) {
        return notifications.findTop12ByUserIdOrderByCreatedAtDescIdDesc(userId).stream()
                .map(this::summary)
                .toList();
    }

    private NotificationSummary summary(UserNotification notification) {
        return new NotificationSummary(notification.getId(), notification.getType(), notification.getTitle(),
                notification.getMessage(), notification.isSeen(), notification.getCreatedAt(), notification.getReferenceId());
    }

    private void trim(Long userId) {
        List<UserNotification> all = notifications.findByUserIdOrderByCreatedAtDescIdDesc(userId);
        if (all.size() <= MAX_NOTIFICATIONS_PER_USER) {
            return;
        }
        notifications.deleteAll(all.subList(MAX_NOTIFICATIONS_PER_USER, all.size()));
    }
}
