package com.freefire.tournament.repository;

import com.freefire.tournament.entity.UserNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UserNotificationRepository extends JpaRepository<UserNotification, Long> {
    List<UserNotification> findTop12ByUserIdOrderByCreatedAtDescIdDesc(Long userId);
    List<UserNotification> findByUserIdOrderByCreatedAtDescIdDesc(Long userId);
    List<UserNotification> findByUserIdAndSeenFalse(Long userId);
    long countByUserIdAndSeenFalse(Long userId);
}
