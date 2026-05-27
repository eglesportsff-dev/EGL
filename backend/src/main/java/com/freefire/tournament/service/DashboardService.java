package com.freefire.tournament.service;

import com.freefire.tournament.dto.AppDtos.*;
import com.freefire.tournament.entity.Role;
import com.freefire.tournament.entity.TransactionType;
import com.freefire.tournament.entity.User;
import com.freefire.tournament.repository.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Stream;

@Service
public class DashboardService {
    private final MatchRepository matches;
    private final WalletTransactionRepository transactions;
    private final TournamentUpdateRepository updates;
    private final UserRepository users;
    private final ControllerProfileRepository controllers;
    private final MasterControllerProfileRepository masters;
    private final DepositRequestRepository deposits;
    private final WithdrawRequestRepository withdrawals;

    public DashboardService(MatchRepository matches, WalletTransactionRepository transactions,
                            TournamentUpdateRepository updates, UserRepository users,
                            ControllerProfileRepository controllers, MasterControllerProfileRepository masters,
                            DepositRequestRepository deposits, WithdrawRequestRepository withdrawals) {
        this.matches = matches;
        this.transactions = transactions;
        this.updates = updates;
        this.users = users;
        this.controllers = controllers;
        this.masters = masters;
        this.deposits = deposits;
        this.withdrawals = withdrawals;
    }

    public UserDashboard user(User user) {
        var tx = transactions.findByUserIdOrderByCreatedAtDesc(user.getId(), PageRequest.of(0, 5)).stream()
                .map(t -> new TransactionSummary(t.getId(), t.getType(), t.getAmount(), t.getNote(), t.getCreatedAt()))
                .toList();
        var up = updates.findAllByOrderByCreatedAtDesc(PageRequest.of(0, 5)).stream()
                .map(u -> new UpdateSummary(u.getId(), u.getTitle(), u.getMessage(), u.getCreatedAt()))
                .toList();
        var requestUpdates = Stream.concat(
                deposits.findTop8ByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                        .map(d -> new RequestUpdate(d.getId(), "Deposit", d.getStatus(), d.getAmount(), d.getUtrNumber(),
                                requestMessage(d.getStatus(), d.getNote(), d.getRejectionReason(), "Deposit request submitted"),
                                d.getCreatedAt())),
                withdrawals.findTop8ByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                        .map(w -> new RequestUpdate(w.getId(), "Withdraw", w.getStatus(), w.getAmount(), w.getUpiId(),
                                requestMessage(w.getStatus(), null, w.getRejectionReason(), "Withdraw request submitted"),
                                w.getCreatedAt()))
        ).sorted(Comparator.comparing(RequestUpdate::createdAt).reversed()).limit(8).toList();
        return new UserDashboard(new WalletSummary(user.getWalletBalance(), user.getWinningPoints()),
                List.of(), tx, up, requestUpdates, "NQ", null);
    }

    private String requestMessage(com.freefire.tournament.entity.RequestStatus status, String note,
                                  String rejectionReason, String fallback) {
        return switch (status) {
            case APPROVED, COMPLETED -> note == null || note.isBlank() ? "Request approved" : note;
            case REJECTED -> rejectionReason == null || rejectionReason.isBlank()
                    ? "Request rejected"
                    : rejectionReason;
            case FORWARDED -> "Request verified and forwarded for payment";
            case PENDING -> fallback;
        };
    }

    public DashboardStats stats() {
        BigDecimal deposits = transactions.sumByType(TransactionType.DEPOSIT);
        if (deposits == null) {
            deposits = BigDecimal.ZERO;
        }

        BigDecimal rawWithdrawals = transactions.sumByType(TransactionType.WITHDRAWAL);
        BigDecimal withdrawals = rawWithdrawals == null ? BigDecimal.ZERO : rawWithdrawals.abs();

        BigDecimal rawFees = transactions.sumByType(TransactionType.ENTRY_FEE);
        BigDecimal fees = rawFees == null ? BigDecimal.ZERO : rawFees.abs();

        BigDecimal rewards = transactions.sumByType(TransactionType.REWARD);
        if (rewards == null) {
            rewards = BigDecimal.ZERO;
        }

        BigDecimal referralSignUpBonus = transactions.sumByType(TransactionType.REFERRAL_BONUS);
        if (referralSignUpBonus == null) {
            referralSignUpBonus = BigDecimal.ZERO;
        }

        BigDecimal referralAcquisitionRewards = transactions.sumByType(TransactionType.REFERRAL_REWARD);
        if (referralAcquisitionRewards == null) {
            referralAcquisitionRewards = BigDecimal.ZERO;
        }

        return new DashboardStats(users.count(), controllers.countByActiveTrue(), masters.countByActiveTrue(),
                matches.countByActiveTrue(), deposits, withdrawals, fees.subtract(rewards), rewards,
                referralSignUpBonus, referralAcquisitionRewards);
    }
}
