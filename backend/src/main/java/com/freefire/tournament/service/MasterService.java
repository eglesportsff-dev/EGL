package com.freefire.tournament.service;

import com.freefire.tournament.dto.AppDtos.*;
import com.freefire.tournament.entity.ControllerProfile;
import com.freefire.tournament.entity.GameMatch;
import com.freefire.tournament.entity.GameType;
import com.freefire.tournament.entity.MatchVariant;
import com.freefire.tournament.entity.MasterControllerProfile;
import com.freefire.tournament.entity.RequestStatus;
import com.freefire.tournament.entity.Role;
import com.freefire.tournament.entity.TransactionType;
import com.freefire.tournament.entity.User;
import com.freefire.tournament.exception.ApiException;
import com.freefire.tournament.repository.ControllerProfileRepository;
import com.freefire.tournament.repository.ControllerReviewRepository;
import com.freefire.tournament.repository.DepositRequestRepository;
import com.freefire.tournament.repository.MatchParticipantRepository;
import com.freefire.tournament.repository.MatchRepository;
import com.freefire.tournament.repository.MasterControllerProfileRepository;
import com.freefire.tournament.repository.TeamRepository;
import com.freefire.tournament.repository.UserNotificationRepository;
import com.freefire.tournament.repository.UserRepository;
import com.freefire.tournament.repository.WalletTransactionRepository;
import com.freefire.tournament.repository.WithdrawRequestRepository;
import com.freefire.tournament.dto.AuthDtos.MessageResponse;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class MasterService {
    private final DepositRequestRepository deposits;
    private final WithdrawRequestRepository withdrawals;
    private final MasterControllerProfileRepository masters;
    private final ControllerProfileRepository controllers;
    private final ControllerReviewRepository controllerReviews;
    private final MatchRepository matches;
    private final MatchParticipantRepository participants;
    private final UserRepository users;
    private final TeamRepository teams;
    private final WalletTransactionRepository transactions;
    private final UserNotificationRepository userNotifications;

    public MasterService(DepositRequestRepository deposits, WithdrawRequestRepository withdrawals,
                         MasterControllerProfileRepository masters, ControllerProfileRepository controllers,
                         ControllerReviewRepository controllerReviews, MatchRepository matches, MatchParticipantRepository participants, UserRepository users,
                         TeamRepository teams, WalletTransactionRepository transactions,
                         UserNotificationRepository userNotifications) {
        this.deposits = deposits;
        this.withdrawals = withdrawals;
        this.masters = masters;
        this.controllers = controllers;
        this.controllerReviews = controllerReviews;
        this.matches = matches;
        this.participants = participants;
        this.users = users;
        this.teams = teams;
        this.transactions = transactions;
        this.userNotifications = userNotifications;
    }

    @Transactional(readOnly = true)
    public PagedResponse<PendingDepositRow> pendingDeposits(int page, int size) {
        var result = deposits.findByStatusOrderByCreatedAtAsc(RequestStatus.PENDING, PageRequest.of(Math.max(page, 0), Math.min(size, 20)));
        return new PagedResponse<>(result.getContent().stream()
                .map(d -> new PendingDepositRow(d.getId(), d.getUser().getUsername(), d.getUser().getUid(),
                        d.getUser().getEmail(), d.getAmount(), d.getUtrNumber(), d.getCreatedAt()))
                .toList(), result.getNumber(), result.getSize(), result.getTotalElements(), result.getTotalPages());
    }

    @Transactional(readOnly = true)
    public PagedResponse<PendingWithdrawRow> pendingWithdraws(int page, int size) {
        var result = withdrawals.findByStatusInOrderByCreatedAtAsc(List.of(RequestStatus.PENDING, RequestStatus.FORWARDED),
                PageRequest.of(Math.max(page, 0), Math.min(size, 20)));
        return new PagedResponse<>(result.getContent().stream()
                .map(w -> new PendingWithdrawRow(w.getId(), w.getUser().getUsername(), w.getUser().getUid(),
                        w.getUser().getEmail(), w.getUpiId(), w.getAmount(), w.getStatus(), w.getCreatedAt()))
                .toList(), result.getNumber(), result.getSize(), result.getTotalElements(), result.getTotalPages());
    }

    @Transactional
    public QrResponse updateQr(User user, QrRequest request) {
        MasterControllerProfile profile = masters.findByUserId(user.getId()).orElseGet(() -> {
            MasterControllerProfile created = new MasterControllerProfile();
            created.setUser(user);
            return masters.save(created);
        });
        profile.setQrCodeUrl(request.qrCodeUrl());
        return new QrResponse(profile.getQrCodeUrl());
    }

    public QrResponse activeQr() {
        return new QrResponse(masters.findFirstByActiveTrueAndQrCodeUrlIsNotNullAndQrCodeUrlNotOrderByIdDesc("")
                .map(MasterControllerProfile::getQrCodeUrl)
                .orElse(""));
    }

    @Transactional(readOnly = true)
    public List<ControllerOverviewRow> controllerOverview() {
        return controllers.findByActiveTrueOrderByCreatedAtDesc().stream()
                .map(this::controllerRow)
                .toList();
    }

    private ControllerOverviewRow controllerRow(ControllerProfile profile) {
        User user = profile.getUser();
        List<ControllerMatchRecord> records = matches.findByCreatedByIdOrderByMatchTimeDesc(user.getId()).stream()
                .map(this::controllerMatchRecord)
                .toList();
        long activeMatches = records.stream().filter(ControllerMatchRecord::active).count();
        long totalPlayers = records.stream().mapToLong(ControllerMatchRecord::players).sum();
        BigDecimal entryTotal = records.stream().map(ControllerMatchRecord::entryFeeTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal rewardTotal = records.stream().map(ControllerMatchRecord::rewardTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal savedTotal = records.stream().map(ControllerMatchRecord::savedTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new ControllerOverviewRow(profile.getId(), user.getId(), user.getUid(), user.getUsername(),
                user.getGameUid(), user.getEmail(), profile.isActive(), profile.getCreatedAt(), records.size(),
                activeMatches, totalPlayers, entryTotal, rewardTotal, savedTotal, records);
    }

    private int teamSize(MatchVariant variant) {
        return switch (variant) {
            case BR_DUO, LONE_WOLF_2V2 -> 2;
            case BR_SQUAD, CS_SQUAD -> 4;
            default -> 1;
        };
    }

    private boolean usesWinnerOnlyResult(GameMatch match) {
        return match.getGameType() == GameType.CLASH_SQUAD || match.getGameType() == GameType.LONE_WOLF;
    }

    private ControllerMatchRecord controllerMatchRecord(GameMatch match) {
        long players = participants.countByMatchId(match.getId());
        BigDecimal entryTotal = match.getEntryFee().multiply(BigDecimal.valueOf(players));
        int size = teamSize(match.getVariant());
        BigDecimal rewardTotal = usesWinnerOnlyResult(match)
                ? match.getFirstReward().multiply(BigDecimal.valueOf(size))
                : match.getFirstReward().add(match.getSecondReward()).add(match.getThirdReward()).multiply(BigDecimal.valueOf(size));
        return new ControllerMatchRecord(match.getId(), match.getTitle(), match.getGameType(), match.getVariant(),
                match.getMatchTime(), match.getRegisterBefore(), players, entryTotal, rewardTotal,
                entryTotal.subtract(rewardTotal), match.isActive());
    }

    @Transactional
    public SeasonResetSummary resetSeasonData() {
        var playerUsers = users.findByRole(Role.USER);
        playerUsers.forEach(user -> user.setWinningPoints(BigDecimal.ZERO));

        var allTeams = teams.findAll();
        allTeams.forEach(team -> team.setTotalWinningPoints(BigDecimal.ZERO));

        return new SeasonResetSummary(playerUsers.size(), allTeams.size(), 0, 0,
                0, 0, "Leaderboard reset successfully. Player winning points and team points were cleared.");
    }

    @Transactional
    public SeasonResetSummary resetAllPlayerData() {
        var playerUsers = users.findByRole(Role.USER);
        for (User user : playerUsers) {
            user.setWalletBalance(BigDecimal.ZERO);
            user.setWinningPoints(BigDecimal.ZERO);
        }
        users.saveAll(playerUsers);

        var allTeams = teams.findAll();
        for (var team : allTeams) {
            team.setTotalWinningPoints(BigDecimal.ZERO);
        }
        teams.saveAll(allTeams);

        long participantsCount = participants.count();
        participants.deleteAllInBatch();

        long txCount = transactions.count();
        transactions.deleteAllInBatch();

        long reviewsCount = controllerReviews.count();
        controllerReviews.deleteAllInBatch();

        long depositsCount = deposits.count();
        deposits.deleteAllInBatch();

        long withdrawsCount = withdrawals.count();
        withdrawals.deleteAllInBatch();

        userNotifications.deleteAllInBatch();

        return new SeasonResetSummary(
                playerUsers.size(),
                allTeams.size(),
                0,
                participantsCount,
                txCount,
                reviewsCount,
                "All player-end data has been reset to zero! Wallet balances (₹0.00), winning points (0), team points, and all transactions/match history were cleared."
        );
    }

    @Transactional
    public MessageResponse updateManualPoints(ManualPointsRequest request) {
        User user = users.findByGameUid(request.playerUid().trim())
                .or(() -> users.findByUid(request.playerUid().trim()))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Player not found"));
        if (user.getRole() != Role.USER) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Only player points can be updated");
        }
        user.setWinningPoints(request.points());
        users.save(user);
        return new MessageResponse("Player points updated successfully.");
    }
}
