package com.freefire.tournament.service;

import com.freefire.tournament.dto.AppDtos.LeaderboardRow;
import com.freefire.tournament.entity.Role;
import com.freefire.tournament.entity.User;
import com.freefire.tournament.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class LeaderboardService {
    private final UserRepository users;

    public LeaderboardService(UserRepository users) {
        this.users = users;
    }

    public List<LeaderboardRow> global(int limit) {
        List<User> rows = users.findByRoleOrderByWinningPointsDesc(Role.USER, PageRequest.of(0, Math.min(limit, 100)));
        List<LeaderboardRow> result = new ArrayList<>();
        for (User user : rows) {
            if (user.getWinningPoints().signum() <= 0) {
                continue;
            }
            int rank = result.size() + 1;
            boolean qualified = user.getWinningPoints().compareTo(new BigDecimal("500")) >= 0;
            result.add(new LeaderboardRow(rank, null, null, user.getWinningPoints(), qualified,
                    user.getId(), user.getUsername(), user.getUid(), user.getGameUid()));
        }
        return result;
    }

    public List<LeaderboardRow> teamGlobal(int limit) {
        return global(limit);
    }
}
