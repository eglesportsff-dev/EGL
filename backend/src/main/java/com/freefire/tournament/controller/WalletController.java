package com.freefire.tournament.controller;

import com.freefire.tournament.dto.AppDtos.*;
import com.freefire.tournament.dto.AuthDtos.MessageResponse;
import com.freefire.tournament.service.CurrentUserService;
import com.freefire.tournament.service.MasterService;
import com.freefire.tournament.service.WalletService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wallet")
public class WalletController {
    private final WalletService walletService;
    private final CurrentUserService currentUser;
    private final MasterService masterService;

    public WalletController(WalletService walletService, CurrentUserService currentUser, MasterService masterService) {
        this.walletService = walletService;
        this.currentUser = currentUser;
        this.masterService = masterService;
    }

    @PostMapping("/deposit")
    public MessageResponse deposit(@Valid @RequestBody DepositRequestDto request) {
        walletService.deposit(request, currentUser.get());
        return new MessageResponse("Deposit request submitted");
    }

    @PostMapping("/withdraw")
    public MessageResponse withdraw(@Valid @RequestBody WithdrawRequestDto request) {
        walletService.withdraw(request, currentUser.get());
        return new MessageResponse("Withdraw request submitted");
    }

    @GetMapping("/deposit-qr")
    public QrResponse qr() {
        return masterService.activeQr();
    }
}
