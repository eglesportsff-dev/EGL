package com.freefire.tournament.controller;

import com.freefire.tournament.dto.AppDtos.MatchResultRequest;
import com.freefire.tournament.dto.AppDtos.MatchTimingRequest;
import com.freefire.tournament.dto.AppDtos.RequestAction;
import com.freefire.tournament.dto.AppDtos.AwardPointsRequest;
import com.freefire.tournament.dto.AppDtos.ControllerReviewSummary;
import com.freefire.tournament.dto.AppDtos.ParticipantSummary;
import com.freefire.tournament.dto.AppDtos.RegisteredMatchSummary;
import com.freefire.tournament.dto.AppDtos.RoomDetailsRequest;
import com.freefire.tournament.dto.AuthDtos.MessageResponse;
import com.freefire.tournament.service.ControllerReviewService;
import com.freefire.tournament.service.CurrentUserService;
import com.freefire.tournament.service.MatchService;
import com.freefire.tournament.service.WalletService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/controller")
public class ControllerManagementController {
    private final WalletService walletService;
    private final MatchService matchService;
    private final ControllerReviewService reviewService;
    private final CurrentUserService currentUser;

    public ControllerManagementController(WalletService walletService, MatchService matchService,
                                          ControllerReviewService reviewService, CurrentUserService currentUser) {
        this.walletService = walletService;
        this.matchService = matchService;
        this.reviewService = reviewService;
        this.currentUser = currentUser;
    }

    @PostMapping("/withdraw/verify")
    public MessageResponse verifyWithdraw(@Valid @RequestBody RequestAction action) {
        walletService.verifyWithdraw(action);
        return new MessageResponse("Withdraw request verified and forwarded");
    }

    @PostMapping("/matches/{matchId}/done")
    public MessageResponse matchDone(@PathVariable Long matchId) {
        matchService.closeMatch(matchId);
        return new MessageResponse("Match marked as done");
    }

    @GetMapping("/matches")
    public java.util.List<RegisteredMatchSummary> matches(@RequestParam(defaultValue = "30") int limit) {
        return matchService.controllerMatches(currentUser.get(), limit);
    }

    @GetMapping("/reviews/today")
    public ControllerReviewSummary todayReviews() {
        return reviewService.today();
    }

    @GetMapping("/reviews/total")
    public ControllerReviewSummary totalReviews() {
        return reviewService.total();
    }

    @DeleteMapping("/matches/{matchId}")
    public MessageResponse deleteMatch(@PathVariable Long matchId) {
        return matchService.deleteMatch(matchId, currentUser.get());
    }

    @GetMapping("/matches/{matchId}/participants")
    public java.util.List<ParticipantSummary> participants(@PathVariable Long matchId) {
        return matchService.participants(matchId);
    }

    @PostMapping("/matches/{matchId}/room-details")
    public MessageResponse roomDetails(@PathVariable Long matchId, @Valid @RequestBody RoomDetailsRequest request) {
        return matchService.updateRoomDetails(matchId, request);
    }

    @PostMapping("/matches/{matchId}/timing")
    public MessageResponse timing(@PathVariable Long matchId, @Valid @RequestBody MatchTimingRequest request) {
        return matchService.updateMatchTime(matchId, request);
    }

    @PostMapping("/matches/award")
    public MessageResponse award(@Valid @RequestBody AwardPointsRequest request) {
        matchService.award(request);
        return new MessageResponse("Player reward and winning points updated");
    }

    @PostMapping("/matches/{matchId}/results")
    public MessageResponse results(@PathVariable Long matchId, @Valid @RequestBody MatchResultRequest request) {
        matchService.awardMatchResults(matchId, request, currentUser.get());
        return new MessageResponse("Match results recorded");
    }
}
