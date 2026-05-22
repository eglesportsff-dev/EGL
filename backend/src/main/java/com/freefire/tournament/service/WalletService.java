package com.freefire.tournament.service;

import com.freefire.tournament.dto.AppDtos.*;
import com.freefire.tournament.entity.*;
import com.freefire.tournament.exception.ApiException;
import com.freefire.tournament.repository.DepositRequestRepository;
import com.freefire.tournament.repository.UserRepository;
import com.freefire.tournament.repository.WalletTransactionRepository;
import com.freefire.tournament.repository.WithdrawRequestRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class WalletService {
    private final DepositRequestRepository deposits;
    private final WithdrawRequestRepository withdrawals;
    private final WalletTransactionRepository transactions;
    private final UserRepository users;
    private final NotificationService notifications;

    public WalletService(DepositRequestRepository deposits, WithdrawRequestRepository withdrawals,
                         WalletTransactionRepository transactions, UserRepository users,
                         NotificationService notifications) {
        this.deposits = deposits;
        this.withdrawals = withdrawals;
        this.transactions = transactions;
        this.users = users;
        this.notifications = notifications;
    }

    @Transactional
    public void deposit(DepositRequestDto request, User user) {
        String utrNumber = request.utrNumber().trim();
        if (deposits.existsByUtrNumberAndStatusIn(utrNumber, List.of(RequestStatus.PENDING))) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Wait for the approval/rejection as your UTR is same as last request");
        }
        if (deposits.existsByUtrNumberAndStatusIn(utrNumber, List.of(RequestStatus.APPROVED, RequestStatus.REJECTED))) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid UTR as this is already claimed");
        }
        DepositRequest deposit = new DepositRequest();
        deposit.setUser(user);
        deposit.setAmount(request.amount());
        deposit.setUtrNumber(utrNumber);
        deposits.save(deposit);
        notifications.notifyUser(user, NotificationType.PAYMENT, "Deposit request submitted",
                "Your deposit request of " + amount(request.amount()) + " is pending verification.");
    }

    @Transactional
    public void withdraw(WithdrawRequestDto request, User user) {
        if (!user.getUid().equals(request.userUid())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "User UID does not match");
        }
        if (user.getWalletBalance().compareTo(request.amount()) < 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Insufficient wallet balance");
        }
        if (withdrawals.existsByUserIdAndStatusIn(user.getId(), List.of(RequestStatus.PENDING, RequestStatus.FORWARDED))) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "You already have a withdraw request waiting to be processed");
        }
        WithdrawRequest withdraw = new WithdrawRequest();
        withdraw.setUser(user);
        user.setUpiId(request.upiId().trim());
        withdraw.setUpiId(user.getUpiId());
        withdraw.setAmount(request.amount());
        withdrawals.save(withdraw);
        notifications.notifyUser(user, NotificationType.PAYMENT, "Withdraw request submitted",
                "Your withdraw request of " + amount(request.amount()) + " is pending verification.");
    }

    @Transactional
    public void approveDeposit(RequestAction action) {
        DepositRequest deposit = deposits.findById(action.requestId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Deposit request not found"));
        if (deposit.getStatus() != RequestStatus.PENDING) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Deposit already processed");
        }
        User user = deposit.getUser();
        user.setWalletBalance(user.getWalletBalance().add(deposit.getAmount()));
        users.save(user);
        deposit.setStatus(RequestStatus.APPROVED);
        deposit.setNote(action.note() == null || action.note().isBlank() ? "Thank you for your deposit" : action.note());
        WalletTransaction tx = new WalletTransaction();
        tx.setUser(user);
        tx.setType(TransactionType.DEPOSIT);
        tx.setAmount(deposit.getAmount());
        tx.setNote("Deposit approved: " + deposit.getUtrNumber());
        transactions.save(tx);
        notifications.notifyUser(user, NotificationType.PAYMENT, "Deposit approved",
                amount(deposit.getAmount()) + " has been added to your wallet. " + deposit.getNote());
    }

    @Transactional
    public void rejectDeposit(RequestAction action) {
        DepositRequest deposit = deposits.findById(action.requestId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Deposit request not found"));
        if (deposit.getStatus() != RequestStatus.PENDING) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Deposit already processed");
        }
        deposit.setStatus(RequestStatus.REJECTED);
        deposit.setRejectionReason(action.rejectionReason() == null || action.rejectionReason().isBlank()
                ? "Payment could not be verified"
                : action.rejectionReason());
        notifications.notifyUser(deposit.getUser(), NotificationType.PAYMENT, "Deposit rejected",
                "Your deposit request of " + amount(deposit.getAmount()) + " was rejected. " + deposit.getRejectionReason());
    }

    @Transactional
    public void verifyWithdraw(RequestAction action) {
        WithdrawRequest withdraw = withdrawals.findById(action.requestId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Withdraw request not found"));
        if (withdraw.getUser().getWalletBalance().compareTo(withdraw.getAmount()) < 0) {
            withdraw.setStatus(RequestStatus.REJECTED);
            withdraw.setRejectionReason("Insufficient wallet balance");
            notifications.notifyUser(withdraw.getUser(), NotificationType.PAYMENT, "Withdraw rejected",
                    "Your withdraw request of " + amount(withdraw.getAmount()) + " was rejected. Insufficient wallet balance.");
            return;
        }
        withdraw.setStatus(RequestStatus.FORWARDED);
        notifications.notifyUser(withdraw.getUser(), NotificationType.PAYMENT, "Withdraw forwarded",
                "Your withdraw request of " + amount(withdraw.getAmount()) + " was verified and forwarded for payout.");
    }

    @Transactional
    public void completeWithdraw(RequestAction action) {
        WithdrawRequest withdraw = withdrawals.findById(action.requestId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Withdraw request not found"));
        if (withdraw.getStatus() != RequestStatus.FORWARDED && withdraw.getStatus() != RequestStatus.PENDING) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Withdraw already processed");
        }
        User user = withdraw.getUser();
        if (user.getWalletBalance().compareTo(withdraw.getAmount()) < 0) {
            withdraw.setStatus(RequestStatus.REJECTED);
            withdraw.setRejectionReason("Insufficient wallet balance");
            throw new ApiException(HttpStatus.BAD_REQUEST, "Insufficient wallet balance");
        }
        user.setWalletBalance(user.getWalletBalance().subtract(withdraw.getAmount()));
        users.save(user);
        withdraw.setStatus(RequestStatus.COMPLETED);
        withdraw.setTransferReference(action.transferReference());
        WalletTransaction tx = new WalletTransaction();
        tx.setUser(user);
        tx.setType(TransactionType.WITHDRAWAL);
        tx.setAmount(withdraw.getAmount().negate());
        tx.setNote("Withdrawal completed");
        transactions.save(tx);
        String reference = withdraw.getTransferReference() == null || withdraw.getTransferReference().isBlank()
                ? ""
                : " Reference: " + withdraw.getTransferReference();
        notifications.notifyUser(user, NotificationType.PAYMENT, "Withdraw completed",
                "Your withdraw request of " + amount(withdraw.getAmount()) + " is completed." + reference);
    }

    @Transactional
    public void rejectWithdraw(RequestAction action) {
        WithdrawRequest withdraw = withdrawals.findById(action.requestId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Withdraw request not found"));
        if (withdraw.getStatus() != RequestStatus.PENDING && withdraw.getStatus() != RequestStatus.FORWARDED) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Withdraw already processed");
        }
        withdraw.setStatus(RequestStatus.REJECTED);
        withdraw.setRejectionReason(action.rejectionReason() == null || action.rejectionReason().isBlank()
                ? "Withdrawal request could not be verified"
                : action.rejectionReason());
        notifications.notifyUser(withdraw.getUser(), NotificationType.PAYMENT, "Withdraw rejected",
                "Your withdraw request of " + amount(withdraw.getAmount()) + " was rejected. " + withdraw.getRejectionReason());
    }

    private String amount(BigDecimal value) {
        return "Rs " + value;
    }
}
