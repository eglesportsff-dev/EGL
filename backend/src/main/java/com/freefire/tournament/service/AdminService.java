package com.freefire.tournament.service;

import com.freefire.tournament.dto.AppDtos.AdminUserRow;
import com.freefire.tournament.dto.AppDtos.PagedResponse;
import com.freefire.tournament.entity.Role;
import com.freefire.tournament.entity.User;
import com.freefire.tournament.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminService {
    private final UserRepository users;
    private final org.springframework.jdbc.core.JdbcTemplate jdbc;

    public AdminService(UserRepository users, org.springframework.jdbc.core.JdbcTemplate jdbc) {
        this.users = users;
        this.jdbc = jdbc;
    }

    @Transactional(readOnly = true)
    public PagedResponse<AdminUserRow> users(Role role, int page, int size) {
        var result = users.findByRoleOrderByCreatedAtDesc(role, PageRequest.of(Math.max(page, 0), Math.min(size, 50)));
        return new PagedResponse<>(
                result.getContent().stream().map(this::row).toList(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages()
        );
    }

    @Transactional
    public void deleteUser(Long id) {
        jdbc.update("UPDATE matches SET created_by_id = NULL WHERE created_by_id = ?", id);
        jdbc.update("DELETE FROM controller_reviews WHERE controller_id = ?", id);
        jdbc.update("DELETE FROM controllers WHERE user_id = ?", id);
        jdbc.update("DELETE FROM master_controllers WHERE user_id = ?", id);
        jdbc.update("DELETE FROM deposit_requests WHERE user_id = ?", id);
        jdbc.update("DELETE FROM withdraw_requests WHERE user_id = ?", id);
        jdbc.update("DELETE FROM wallet_transactions WHERE user_id = ?", id);
        jdbc.update("DELETE FROM user_notifications WHERE user_id = ?", id);
        jdbc.update("DELETE FROM match_participants WHERE user_id = ?", id);
        jdbc.update("DELETE FROM team_members WHERE user_id = ?", id);
        jdbc.update("DELETE FROM team_invites WHERE inviter_id = ? OR invitee_id = ?", id, id);
        jdbc.update("DELETE FROM player_messages WHERE sender_id = ? OR recipient_id = ?", id, id);
        jdbc.update("DELETE FROM help_tickets WHERE user_id = ? OR reviewed_by_id = ?", id, id);
        jdbc.update("DELETE FROM push_subscriptions WHERE user_id = ?", id);
        jdbc.update("DELETE FROM users WHERE id = ?", id);
    }

    private AdminUserRow row(User user) {
        return new AdminUserRow(user.getId(), user.getUid(), user.getUsername(), user.getGameUid(),
                user.getEmail(), user.getUpiId(), user.getRole(), user.getWalletBalance(),
                user.getWinningPoints(), user.isEmailVerified());
    }
}
