package com.freefire.tournament.controller;

import com.freefire.tournament.dto.AppDtos.CreateStaffRequest;
import com.freefire.tournament.dto.AppDtos.ControllerOverviewRow;
import com.freefire.tournament.dto.AppDtos.MasterMatchRow;
import com.freefire.tournament.dto.AppDtos.ManualPointsRequest;
import com.freefire.tournament.dto.AppDtos.PendingDepositRow;
import com.freefire.tournament.dto.AppDtos.PendingWithdrawRow;
import com.freefire.tournament.dto.AppDtos.QrRequest;
import com.freefire.tournament.dto.AppDtos.QrResponse;
import com.freefire.tournament.dto.AppDtos.PagedResponse;
import com.freefire.tournament.dto.AppDtos.RequestAction;
import com.freefire.tournament.dto.AppDtos.SeasonResetSummary;
import com.freefire.tournament.dto.AuthDtos.MessageResponse;
import com.freefire.tournament.service.CurrentUserService;
import com.freefire.tournament.service.MasterService;
import com.freefire.tournament.service.MatchService;
import com.freefire.tournament.service.StaffService;
import com.freefire.tournament.service.WalletService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/master")
public class MasterController {
    private final WalletService walletService;
    private final StaffService staffService;
    private final MasterService masterService;
    private final MatchService matchService;
    private final CurrentUserService currentUser;

    public MasterController(WalletService walletService, StaffService staffService, MasterService masterService,
                            MatchService matchService, CurrentUserService currentUser) {
        this.walletService = walletService;
        this.staffService = staffService;
        this.masterService = masterService;
        this.matchService = matchService;
        this.currentUser = currentUser;
    }

    @PostMapping("/controllers")
    public Map<String, Long> createController(@Valid @RequestBody CreateStaffRequest request) {
        return Map.of("controllerProfileId", staffService.createController(request));
    }

    @GetMapping("/controllers")
    public List<ControllerOverviewRow> controllers() {
        return masterService.controllerOverview();
    }

    @PostMapping("/withdraw/complete")
    public MessageResponse completeWithdraw(@Valid @RequestBody RequestAction action) {
        walletService.completeWithdraw(action);
        return new MessageResponse("Withdrawal completed and wallet deducted");
    }

    @PostMapping("/withdraw/reject")
    public MessageResponse rejectWithdraw(@Valid @RequestBody RequestAction action) {
        walletService.rejectWithdraw(action);
        return new MessageResponse("Withdrawal rejected");
    }

    @PostMapping("/deposit/approve")
    public MessageResponse approveDeposit(@Valid @RequestBody RequestAction action) {
        walletService.approveDeposit(action);
        return new MessageResponse("Deposit approved and wallet updated");
    }

    @PostMapping("/deposit/reject")
    public MessageResponse rejectDeposit(@Valid @RequestBody RequestAction action) {
        walletService.rejectDeposit(action);
        return new MessageResponse("Deposit rejected");
    }

    @GetMapping("/deposits/pending")
    public PagedResponse<PendingDepositRow> pendingDeposits(@RequestParam(defaultValue = "0") int page,
                                                            @RequestParam(defaultValue = "8") int size) {
        return masterService.pendingDeposits(page, size);
    }

    @GetMapping("/withdraws/pending")
    public PagedResponse<PendingWithdrawRow> pendingWithdraws(@RequestParam(defaultValue = "0") int page,
                                                              @RequestParam(defaultValue = "8") int size) {
        return masterService.pendingWithdraws(page, size);
    }

    @PostMapping("/qr")
    public QrResponse updateQr(@Valid @RequestBody QrRequest request) {
        return masterService.updateQr(currentUser.get(), request);
    }

    @GetMapping("/matches")
    public List<MasterMatchRow> matches(@RequestParam(defaultValue = "live") String status) {
        return matchService.masterMatches(status);
    }

    @PostMapping("/reset-season")
    public SeasonResetSummary resetSeason() {
        return masterService.resetSeasonData();
    }

    @PostMapping("/reset-player-data")
    public SeasonResetSummary resetPlayerData() {
        return masterService.resetAllPlayerData();
    }

    @PostMapping("/manual-points")
    public MessageResponse manualPoints(@Valid @RequestBody ManualPointsRequest request) {
        return masterService.updateManualPoints(request);
    }
}
