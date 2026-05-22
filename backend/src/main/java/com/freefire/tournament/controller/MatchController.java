package com.freefire.tournament.controller;

import com.freefire.tournament.dto.AppDtos.*;
import com.freefire.tournament.dto.AuthDtos.MessageResponse;
import com.freefire.tournament.service.CurrentUserService;
import com.freefire.tournament.service.MatchService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/matches")
public class MatchController {
    private final MatchService matchService;
    private final CurrentUserService currentUser;

    public MatchController(MatchService matchService, CurrentUserService currentUser) {
        this.matchService = matchService;
        this.currentUser = currentUser;
    }

    @GetMapping
    public List<MatchSummary> list(@RequestParam(defaultValue = "20") int limit) {
        return matchService.activeMatches(limit);
    }

    @GetMapping("/upcoming")
    public List<RegisteredMatchSummary> upcoming() {
        return matchService.upcomingMatchesForUser(currentUser.get());
    }

    @PostMapping("/create")
    public MatchSummary create(@Valid @RequestBody CreateMatchRequest request) {
        return matchService.create(request, currentUser.get());
    }

    @PostMapping("/join")
    public MessageResponse join(@Valid @RequestBody JoinMatchRequest request) {
        matchService.join(request.matchId(), currentUser.get());
        return new MessageResponse("Joined match. Entry fee deducted from wallet.");
    }

    @PostMapping("/team/validate")
    public TeamValidationResult validateTeam(@Valid @RequestBody TeamJoinRequest request) {
        return matchService.validateTeamJoin(request, currentUser.get());
    }

    @PostMapping("/join-team")
    public MessageResponse joinTeam(@Valid @RequestBody TeamJoinRequest request) {
        return matchService.joinTeam(request, currentUser.get());
    }

    @PostMapping("/invite/accept")
    public MessageResponse acceptTeamInvite(@Valid @RequestBody AcceptInviteRequest request) {
        return matchService.acceptTeamInvite(request.matchId(), currentUser.get());
    }

    @GetMapping("/friend-invites")
    public List<FriendInviteRow> friendInvites() {
        return matchService.friendInvites(currentUser.get());
    }

    @PostMapping("/friend-invites/accept")
    public MessageResponse acceptFriendInvite(@Valid @RequestBody InviteActionRequest request) {
        return matchService.acceptTeamInvite(request, currentUser.get());
    }

    @PostMapping("/friend-invites/reject")
    public MessageResponse rejectFriendInvite(@Valid @RequestBody InviteActionRequest request) {
        return matchService.rejectTeamInvite(request, currentUser.get());
    }

    @GetMapping("/overview")
    public ControllerDashboardOverview overview() {
        return matchService.controllerOverview(currentUser.get());
    }
}
