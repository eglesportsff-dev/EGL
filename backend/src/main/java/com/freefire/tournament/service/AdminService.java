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

    public AdminService(UserRepository users) {
        this.users = users;
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

    private AdminUserRow row(User user) {
        return new AdminUserRow(user.getId(), user.getUid(), user.getUsername(), user.getGameUid(),
                user.getEmail(), user.getUpiId(), user.getRole(), user.getWalletBalance(),
                user.getWinningPoints(), user.isEmailVerified());
    }
}
