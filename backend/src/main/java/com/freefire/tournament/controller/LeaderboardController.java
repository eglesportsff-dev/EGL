package com.freefire.tournament.controller;

import com.freefire.tournament.dto.AppDtos.LeaderboardRow;
import com.freefire.tournament.dto.AppDtos.UpdateSummary;
import com.freefire.tournament.repository.TournamentUpdateRepository;
import com.freefire.tournament.service.LeaderboardService;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class LeaderboardController {
    private final LeaderboardService leaderboardService;
    private final TournamentUpdateRepository updates;

    public LeaderboardController(LeaderboardService leaderboardService, TournamentUpdateRepository updates) {
        this.leaderboardService = leaderboardService;
        this.updates = updates;
    }

    @GetMapping("/api/leaderboard")
    public List<LeaderboardRow> leaderboard(@RequestParam(defaultValue = "50") int limit) {
        return leaderboardService.global(limit);
    }

    @GetMapping("/api/tournament/{id}/point-table")
    public List<LeaderboardRow> pointTable(@PathVariable Long id) {
        return leaderboardService.teamGlobal(20);
    }

    @GetMapping("/api/tournaments/updates")
    public List<UpdateSummary> updates() {
        return updates.findAllByOrderByCreatedAtDesc(PageRequest.of(0, 5)).stream()
                .map(u -> new UpdateSummary(u.getId(), u.getTitle(), u.getMessage(), u.getCreatedAt()))
                .toList();
    }
}
