package com.freefire.tournament.service;

import com.freefire.tournament.dto.AppDtos.*;
import com.freefire.tournament.dto.AuthDtos.MessageResponse;
import com.freefire.tournament.entity.*;
import com.freefire.tournament.exception.ApiException;
import com.freefire.tournament.repository.MatchRepository;
import com.freefire.tournament.repository.MatchParticipantRepository;
import com.freefire.tournament.repository.ControllerReviewRepository;
import com.freefire.tournament.repository.TeamInviteRepository;
import com.freefire.tournament.repository.TeamMemberRepository;
import com.freefire.tournament.repository.TeamRepository;
import com.freefire.tournament.repository.UserRepository;
import com.freefire.tournament.repository.WalletTransactionRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Instant;
import java.math.BigDecimal;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class MatchService {
    private static final Logger log = LoggerFactory.getLogger(MatchService.class);
    private final MatchRepository matches;
    private final ControllerReviewRepository controllerReviews;
    private final WalletTransactionRepository transactions;
    private final MatchParticipantRepository participants;
    private final TeamInviteRepository invites;
    private final TeamMemberRepository teamMembers;
    private final TeamRepository teams;
    private final UserRepository users;
    private final NotificationService notifications;

    public MatchService(MatchRepository matches, ControllerReviewRepository controllerReviews, WalletTransactionRepository transactions,
                        MatchParticipantRepository participants, TeamInviteRepository invites,
                        TeamMemberRepository teamMembers, TeamRepository teams,
                        UserRepository users, NotificationService notifications) {
        this.matches = matches;
        this.controllerReviews = controllerReviews;
        this.transactions = transactions;
        this.participants = participants;
        this.invites = invites;
        this.teamMembers = teamMembers;
        this.teams = teams;
        this.users = users;
        this.notifications = notifications;
    }

    public List<MatchSummary> activeMatches(int limit) {
        return matches.findByActiveTrueOrderByMatchTimeAsc(PageRequest.of(0, Math.min(limit, 30))).stream()
                .map(this::summary)
                .toList();
    }

    public List<RegisteredMatchSummary> controllerMatches(User controller, int limit) {
        return matches.findByCreatedByIdAndActiveTrueOrderByMatchTimeDesc(controller.getId()).stream()
                .limit(Math.min(limit, 30))
                .map(this::registeredSummary)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RegisteredMatchSummary> upcomingMatchesForUser(User user) {
        return participants.findUpcomingByUserId(user.getId()).stream()
                .map(MatchParticipant::getMatch)
                .map(this::registeredSummary)
                .toList();
    }

    public List<MasterMatchRow> masterMatches(String status) {
        Instant now = Instant.now();
        return matches.findAll().stream()
                .filter(match -> switch (status == null ? "live" : status) {
                    case "history" -> !match.isActive() || (match.getMatchTime() != null && match.getMatchTime().isBefore(now));
                    case "upcoming" -> match.isActive() && (match.getMatchTime() == null || match.getMatchTime().isAfter(now));
                    default -> match.isActive() && (match.getMatchTime() == null || match.getMatchTime().isBefore(now.plusSeconds(86400)));
                })
                .map(this::masterRow)
                .toList();
    }

    @Transactional
    public MatchSummary create(CreateMatchRequest request, User creator) {
        if (request.matchTime() != null && !request.registerBefore().isBefore(request.matchTime())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Register before time must be before match time");
        }
        GameMatch match = new GameMatch();
        match.setTitle(request.title());
        match.setGameType(request.gameType());
        match.setVariant(request.variant());
        match.setEntryFee(request.entryFee());
        match.setFirstReward(request.firstReward());
        match.setSecondReward(request.secondReward());
        match.setThirdReward(request.thirdReward());
        match.setRoomSize(request.roomSize());
        match.setMatchTime(request.matchTime());
        match.setRegisterBefore(request.registerBefore());
        match.setTeamOnly(request.teamOnly());
        match.setCreatedBy(creator);
        GameMatch saved = matches.save(match);
        notifications.notifyUsers(users.findByRole(Role.USER), NotificationType.MATCH, "New match created",
                saved.getTitle() + " is open for registration. Entry fee: Rs " + saved.getEntryFee() + ".");
        return summary(saved);
    }

    @Transactional
    public MessageResponse deleteMatch(Long matchId, User controller) {
        GameMatch match = matches.findById(matchId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Match not found"));
        if (controller.getRole() != Role.CONTROLLER) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only controllers can delete matches");
        }
        if (match.getCreatedBy() == null || !match.getCreatedBy().getId().equals(controller.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You can delete only matches created by you");
        }

        List<MatchParticipant> registeredPlayers = participants.findByMatchIdOrderByJoinedAtAsc(matchId);
        registeredPlayers.forEach(participant -> refundDeletedMatchEntry(match, participant.getUser()));
        invites.deleteByMatchId(matchId);
        participants.deleteByMatchId(matchId);
        matches.delete(match);
        return new MessageResponse("Match deleted successfully.");
    }

    private void refundDeletedMatchEntry(GameMatch match, User user) {
        if (match.getEntryFee().signum() <= 0) {
            return;
        }
        user.setWalletBalance(user.getWalletBalance().add(match.getEntryFee()));
        users.save(user);
        WalletTransaction tx = new WalletTransaction();
        tx.setUser(user);
        tx.setType(TransactionType.REFUND);
        tx.setAmount(match.getEntryFee());
        tx.setNote("Refund for deleted match: " + match.getTitle());
        transactions.save(tx);
        notifications.notifyUser(user, NotificationType.MATCH,
                "Match deleted",
                match.getTitle() + " was deleted. Your entry fee has been refunded.");
    }

    @Transactional
    public void join(Long matchId, User user) {
        GameMatch match = matches.findById(matchId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Match not found"));
        if (!match.isActive() || !Instant.now().isBefore(match.getRegisterBefore())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Registration Closed");
        }
        if (match.isTeamOnly()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "This match requires team invite registration.");
        }
        ensureSeatsAvailable(match, 1);
        if (user.getWalletBalance().compareTo(match.getEntryFee()) < 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Insufficient wallet balance");
        }
        if (participants.existsByMatchIdAndUserId(matchId, user.getId())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, alreadyRegisteredMessage(matchId, user.getId()));
        }
        deductEntryFee(match, user, "Entry fee: " + match.getTitle());
        MatchParticipant participant = new MatchParticipant();
        participant.setMatch(match);
        participant.setUser(user);
        participants.save(participant);
        notifications.notifyUser(user, NotificationType.MATCH, "Match joined",
                "You are registered for " + match.getTitle() + ". Entry fee has been deducted.",
                match.getId());
    }

    @Transactional
    public TeamValidationResult validateTeamJoin(TeamJoinRequest request, User requester) {
        GameMatch match = matches.findById(request.matchId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Match not found"));
        if (!match.isActive() || !Instant.now().isBefore(match.getRegisterBefore())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Registration Closed");
        }
        if (!match.isTeamOnly()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "This match is open registration. Register directly without player UIDs.");
        }
        int requiredTeamSize = teamSize(match.getVariant());
        if (requiredTeamSize <= 1) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "This match cannot be joined as a team.");
        }
        ensureSeatsAvailable(match, requiredTeamSize);
        if (participants.existsByMatchIdAndUserId(match.getId(), requester.getId())) {
            return new TeamValidationResult(false, List.of(), alreadyRegisteredMessage(match.getId(), requester.getId()));
        }
        int requiredInvitees = requiredTeamSize - 1;
        List<String> otherUids = normalizedUids(request.playerUids());
        log.info("validateTeamJoin: matchId={}, requesterGameUid={}, otherUids={}", match.getId(), requester.getGameUid(), otherUids);
        otherUids.forEach(uid -> {
            var present = users.findByGameUid(uid).isPresent();
            log.info("validateTeamJoin: lookup gameUid='{}' present={}", uid, present);
        });
        if (otherUids.size() != requiredInvitees) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "This match requires exactly " + requiredInvitees + " other player UID" + (requiredInvitees == 1 ? "." : "s."));
        }
        if (new LinkedHashSet<>(otherUids).size() != otherUids.size()) {
            return new TeamValidationResult(false, List.of(), "Each invited player UID must be unique.");
        }
        if (otherUids.stream().anyMatch(uid -> uid.equalsIgnoreCase(requester.getGameUid()))) {
            return new TeamValidationResult(false, List.of(requester.getGameUid()), "Do not enter your own Gaming UID. You are added as the team leader automatically.");
        }
        List<String> missing = otherUids.stream()
            .filter(uid -> users.findByGameUid(uid).isEmpty() && users.findByUid(uid).isEmpty())
            .toList();
        if (!missing.isEmpty()) {
            return new TeamValidationResult(false, missing,
                    "The following player UIDs are not registered: " + String.join(", ", missing));
        }
        List<String> alreadyApplied = otherUids.stream()
            .map(uid -> users.findByGameUid(uid).or(() -> users.findByUid(uid)).get())
            .filter(user -> participants.existsByMatchIdAndUserId(match.getId(), user.getId()))
            .map(user -> user.getGameUid() == null ? user.getUid() : user.getGameUid())
            .toList();
        if (!alreadyApplied.isEmpty()) {
            return new TeamValidationResult(false, alreadyApplied,
                    "Already applied in this match: " + String.join(", ", alreadyApplied));
        }
        List<String> pendingInvites = otherUids.stream()
            .map(uid -> users.findByGameUid(uid).or(() -> users.findByUid(uid)).get())
            .filter(user -> invites.findByMatchIdAndInviteeIdAndAcceptedFalseAndRejectedFalse(match.getId(), user.getId()).isPresent())
            .map(user -> user.getGameUid() == null ? user.getUid() : user.getGameUid())
            .toList();
        if (!pendingInvites.isEmpty()) {
            return new TeamValidationResult(false, pendingInvites,
                    "Invite already pending for this match: " + String.join(", ", pendingInvites));
        }
        return new TeamValidationResult(true, List.of(), "All player UIDs are registered. Send invite requests to continue.");
    }

    @Transactional
    public MessageResponse joinTeam(TeamJoinRequest request, User requester) {
        TeamValidationResult validation = validateTeamJoin(request, requester);
        if (!validation.valid()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, validation.message());
        }
        return inviteTeamMembers(request, requester);
    }

    private MessageResponse inviteTeamMembers(TeamJoinRequest request, User requester) {
        GameMatch match = matches.findById(request.matchId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Match not found"));
        if (!match.isActive() || !Instant.now().isBefore(match.getRegisterBefore())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Registration Closed");
        }
        ensureSeatsAvailable(match, teamSize(match.getVariant()));
        Team team = teams.findByName(request.teamName().trim()).orElseGet(() -> {
            Team created = new Team();
            created.setName(request.teamName().trim());
            return teams.save(created);
        });
        List<User> invitees = normalizedUids(request.playerUids()).stream()
            .map(uid -> users.findByGameUid(uid)
                .or(() -> users.findByUid(uid))
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Player UID not found: " + uid)))
            .toList();
        var leader = requester;
        if (participants.existsByMatchIdAndUserId(match.getId(), leader.getId())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, alreadyRegisteredMessage(match.getId(), leader.getId()));
        }
        if (leader.getWalletBalance().compareTo(match.getEntryFee()) < 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Insufficient wallet balance for team leader");
        }
        invitees.forEach(player -> {
            if (participants.existsByMatchIdAndUserId(match.getId(), player.getId())) {
                throw new ApiException(HttpStatus.BAD_REQUEST, alreadyRegisteredMessage(match.getId(), player.getId()));
            }
        });
        invitees.forEach(player -> invites.findByMatchIdAndInviteeId(match.getId(), player.getId())
                .filter(existingInvite -> !existingInvite.isRejected())
                .ifPresent(existingInvite -> {
                    throw new ApiException(HttpStatus.BAD_REQUEST, "Invite already exists for this player. Ask them to accept from Matching Friends.");
                }));
        deductEntryFee(match, leader, "Team entry fee: " + match.getTitle() + " (" + team.getName() + ")");
        ensureTeamMember(team, leader);
        MatchParticipant leaderParticipant = new MatchParticipant();
        leaderParticipant.setMatch(match);
        leaderParticipant.setUser(leader);
        leaderParticipant.setTeam(team);
        participants.save(leaderParticipant);

        TeamInvite leaderInvite = findOrCreateTeamInvite(match, team, leader, leader);
        leaderInvite.setAccepted(true);
        leaderInvite.setRejected(false);
        leaderInvite.setAcceptedAt(Instant.now());
        leaderInvite.setRejectedAt(null);
        leaderInvite.setNote(cleanNote(request.note()));
        leaderInvite.setResponseNote("");
        invites.save(leaderInvite);

        invitees.forEach(player -> {
            TeamInvite invite = findOrCreateTeamInvite(match, team, leader, player);
            invite.setAccepted(false);
            invite.setRejected(false);
            invite.setAcceptedAt(null);
            invite.setRejectedAt(null);
            invite.setNote(cleanNote(request.note()));
            invite.setResponseNote("");
            invites.save(invite);
            String noteText = cleanNote(request.note()).isBlank() ? "" : " Note: " + cleanNote(request.note());
            notifications.notifyUser(player, NotificationType.MATCH,
                    "Team Match Invitation",
                    leader.getUsername() + " invited you to team '" + team.getName() + "' for match '" + match.getTitle() + "'." + noteText,
                    match.getId());
        });
        notifications.notifyUser(leader, NotificationType.MATCH,
                "Team invitations sent",
                "Your team invitation for '" + team.getName() + "' has been sent. Members can accept from Matching With Friends.",
                match.getId());
        return new MessageResponse("Team invitations sent. Each invited player must accept from notifications to complete registration.");
    }

    private MessageResponse registerTeamMembers(TeamJoinRequest request, User requester) {
        GameMatch match = matches.findById(request.matchId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Match not found"));
        List<User> teamPlayers = request.playerUids().stream()
            .map(uid -> users.findByGameUid(uid)
                .or(() -> users.findByUid(uid))
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Player UID not found: " + uid)))
            .toList();
        teamPlayers.forEach(user -> {
            String resolvedUid = user.getGameUid() == null ? user.getUid() : user.getGameUid();
            if (participants.existsByMatchIdAndUserId(match.getId(), user.getId())) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Player already registered for this match: " + resolvedUid);
            }
            if (user.getWalletBalance().compareTo(match.getEntryFee()) < 0) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "The following players have insufficient wallet balance: " + resolvedUid);
            }
        });
        teamPlayers.forEach(user -> {
            user.setWalletBalance(user.getWalletBalance().subtract(match.getEntryFee()));
            users.save(user);
            WalletTransaction tx = new WalletTransaction();
            tx.setUser(user);
            tx.setType(TransactionType.ENTRY_FEE);
            tx.setAmount(match.getEntryFee().negate());
            tx.setNote("Team entry fee: " + match.getTitle() + " (" + request.teamName() + ")");
            transactions.save(tx);
            MatchParticipant participant = new MatchParticipant();
            participant.setMatch(match);
            participant.setUser(user);
            participants.save(participant);
        });
        notifications.notifyUsers(teamPlayers, NotificationType.MATCH,
                "Team Registered",
                "Your team '" + request.teamName() + "' has been registered for " + match.getTitle() + ". Entry fees have been deducted.",
                match.getId());
        return new MessageResponse("Team registered successfully. Entry fees have been deducted from all players.");
    }

    private int teamSize(MatchVariant variant) {
        return switch (variant) {
            case BR_DUO, LONE_WOLF_2V2 -> 2;
            case BR_SQUAD, CS_SQUAD -> 4;
            default -> 1;
        };
    }

    @Transactional
    public MessageResponse acceptTeamInvite(Long matchId, User invitee) {
        TeamInvite invite = invites.findTopByMatchIdAndInviteeIdAndAcceptedFalseAndRejectedFalseOrderByCreatedAtDesc(matchId, invitee.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "No pending team invite found for this match."));
        return acceptTeamInvite(invite, invitee, null);
    }

    @Transactional
    public MessageResponse acceptTeamInvite(InviteActionRequest request, User invitee) {
        TeamInvite invite = invites.findByIdAndInviteeId(request.inviteId(), invitee.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "No invite found."));
        return acceptTeamInvite(invite, invitee, request.note());
    }

    private MessageResponse acceptTeamInvite(TeamInvite invite, User invitee, String responseNote) {
        if (invite.isAccepted()) {
            return new MessageResponse("Invite already accepted.");
        }
        if (invite.isRejected()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "This invite was already rejected.");
        }
        GameMatch match = invite.getMatch();
        if (!match.isActive() || !Instant.now().isBefore(match.getRegisterBefore())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Registration Closed");
        }
        ensureSeatsAvailable(match, 1);
        if (invitee.getWalletBalance().compareTo(match.getEntryFee()) < 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Insufficient wallet balance to accept the invite.");
        }
        if (participants.existsByMatchIdAndUserId(match.getId(), invitee.getId())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, alreadyRegisteredMessage(match.getId(), invitee.getId()));
        }
        deductEntryFee(match, invitee, "Team entry fee accepted: " + match.getTitle() + " (" + invite.getTeam().getName() + ")");
        ensureTeamMember(invite.getTeam(), invitee);
        MatchParticipant participant = new MatchParticipant();
        participant.setMatch(match);
        participant.setUser(invitee);
        participant.setTeam(invite.getTeam());
        participants.save(participant);
        invite.setAccepted(true);
        invite.setAcceptedAt(Instant.now());
        invite.setResponseNote(cleanNote(responseNote));
        invites.save(invite);
        notifications.notifyUser(invite.getInviter(), NotificationType.MATCH,
                "Team member accepted",
                invitee.getUsername() + " accepted your team invite for " + match.getTitle() + ".",
                match.getId());
        long pending = invites.countByMatchIdAndTeamIdAndAcceptedFalseAndRejectedFalse(match.getId(), invite.getTeam().getId());
        if (pending == 0) {
            List<User> allTeam = invites.findByMatchIdAndTeamId(match.getId(), invite.getTeam().getId()).stream()
                    .filter(TeamInvite::isAccepted)
                    .map(TeamInvite::getInvitee)
                    .toList();
            notifications.notifyUser(invite.getInviter(), NotificationType.MATCH,
                    "Team registration complete",
                    "All team members have accepted. Your team is now registered for " + match.getTitle() + ".",
                    match.getId());
            notifications.notifyUsers(allTeam, NotificationType.MATCH,
                    "Team registration successful",
                    "Your team is registered for " + match.getTitle() + " and entry fees have been paid.",
                    match.getId());
        }
        return new MessageResponse("Invite accepted and your entry fee has been deducted.");
    }

    @Transactional
    public MessageResponse rejectTeamInvite(InviteActionRequest request, User invitee) {
        TeamInvite invite = invites.findByIdAndInviteeId(request.inviteId(), invitee.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "No invite found."));
        if (invite.isAccepted()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Accepted invites cannot be rejected.");
        }
        if (invite.isRejected()) {
            return new MessageResponse("Invite already rejected.");
        }
        invite.setRejected(true);
        invite.setRejectedAt(Instant.now());
        invite.setResponseNote(cleanNote(request.note()));
        invites.save(invite);
        cancelTeamRegistrationAfterReject(invite);
        notifications.notifyUser(invite.getInviter(), NotificationType.MATCH,
                "Team invite rejected",
                invitee.getUsername() + " rejected the invite for " + invite.getMatch().getTitle() + ". Your entry fee has been refunded.",
                invite.getMatch().getId());
        return new MessageResponse("Invite rejected. Team leader entry fee has been refunded.");
    }

    @Transactional(readOnly = true)
    public List<FriendInviteRow> friendInvites(User user) {
        return invites.findTop8ByInviteeIdOrInviterIdOrderByCreatedAtDesc(user.getId(), user.getId()).stream()
                .map(invite -> friendInviteRow(invite, user))
                .toList();
    }

    private FriendInviteRow friendInviteRow(TeamInvite invite, User currentUser) {
        GameMatch match = invite.getMatch();
        String status = invite.isRejected() ? "REJECTED" : invite.isAccepted() ? "ACCEPTED" : "PENDING";
        Instant respondedAt = invite.isAccepted() ? invite.getAcceptedAt() : invite.getRejectedAt();
        return new FriendInviteRow(invite.getId(), match.getId(), match.getTitle(), match.getGameType(),
                match.getVariant(), invite.getTeam().getName(), invite.getInviter().getUsername(),
                invite.getInviter().getUid(), invite.getInvitee().getUsername(), invite.getInvitee().getUid(),
                invite.getNote(), invite.getResponseNote(), status, match.getEntryFee(),
                (int) invites.countByMatchIdAndTeamIdAndAcceptedTrue(match.getId(), invite.getTeam().getId()),
                teamSize(match.getVariant()), invite.getInvitee().getId().equals(currentUser.getId()),
                invite.getCreatedAt(), respondedAt);
    }

    private List<String> normalizedUids(List<String> rawUids) {
        return rawUids == null ? List.of() : rawUids.stream()
                .map(uid -> uid == null ? "" : uid.trim())
                .filter(uid -> !uid.isBlank())
                .toList();
    }

    private String cleanNote(String note) {
        return note == null ? "" : note.trim();
    }

    private void deductEntryFee(GameMatch match, User user, String note) {
        user.setWalletBalance(user.getWalletBalance().subtract(match.getEntryFee()));
        users.save(user);
        WalletTransaction tx = new WalletTransaction();
        tx.setUser(user);
        tx.setType(TransactionType.ENTRY_FEE);
        tx.setAmount(match.getEntryFee().negate());
        tx.setNote(note);
        transactions.save(tx);
    }

    private void ensureSeatsAvailable(GameMatch match, int seatsNeeded) {
        long currentParticipants = participants.countByMatchId(match.getId());
        if (currentParticipants + seatsNeeded > match.getRoomSize()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Seat full");
        }
    }

    private TeamInvite findOrCreateTeamInvite(GameMatch match, Team team, User inviter, User invitee) {
        TeamInvite invite = invites.findByMatchIdAndInviteeId(match.getId(), invitee.getId()).orElseGet(TeamInvite::new);
        invite.setMatch(match);
        invite.setTeam(team);
        invite.setInviter(inviter);
        invite.setInvitee(invitee);
        return invite;
    }

    private String participantResultUid(MatchParticipant participant) {
        String gameUid = participant.getUser().getGameUid();
        return gameUid == null || gameUid.isBlank() ? participant.getUser().getUid() : gameUid;
    }

    private void refundEntryFee(GameMatch match, User user, String note) {
        if (match.getEntryFee().signum() <= 0) {
            return;
        }
        user.setWalletBalance(user.getWalletBalance().add(match.getEntryFee()));
        users.save(user);
        WalletTransaction tx = new WalletTransaction();
        tx.setUser(user);
        tx.setType(TransactionType.REFUND);
        tx.setAmount(match.getEntryFee());
        tx.setNote(note);
        transactions.save(tx);
    }

    private void cancelTeamRegistrationAfterReject(TeamInvite rejectedInvite) {
        GameMatch match = rejectedInvite.getMatch();
        Team team = rejectedInvite.getTeam();
        User leader = rejectedInvite.getInviter();
        participants.findByMatchIdAndUserId(match.getId(), leader.getId()).ifPresent(participant -> {
            if (participant.getTeam() != null && participant.getTeam().getId().equals(team.getId())) {
                participants.delete(participant);
                refundEntryFee(match, leader, "Refund for rejected team invite: " + match.getTitle() + " (" + team.getName() + ")");
            }
        });
    }

    private void ensureTeamMember(Team team, User user) {
        teamMembers.findByTeamIdAndUserId(team.getId(), user.getId()).orElseGet(() -> {
            TeamMember member = new TeamMember();
            member.setTeam(team);
            member.setUser(user);
            return teamMembers.save(member);
        });
    }

    private String alreadyRegisteredMessage(Long matchId, Long userId) {
        return participants.findByMatchIdAndUserId(matchId, userId)
                .map(participant -> participant.getTeam() == null
                        ? "Already registered for this match."
                        : "Already applied in this match with team " + participant.getTeam().getName() + ".")
                .orElse("Already registered for this match.");
    }

    public ControllerDashboardOverview controllerOverview(User controller) {
        long activeMatches = matches.countByActiveTrue();
        long matchesManaged = matches.countByCreatedById(controller.getId());
        BigDecimal rewardsDistributed = transactions.sumByType(TransactionType.REWARD);
        if (rewardsDistributed == null) {
            rewardsDistributed = BigDecimal.ZERO;
        }
        long pointUpdates = transactions.countByTypeIn(List.of(TransactionType.REWARD));
        long upcomingMatches = matches.countByActiveTrueAndMatchTimeAfter(Instant.now());
        return new ControllerDashboardOverview(activeMatches, matchesManaged, rewardsDistributed, pointUpdates, upcomingMatches);
    }

    @Transactional
    public void closeMatch(Long matchId) {
        GameMatch match = matches.findById(matchId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Match not found"));
        match.setActive(false);
    }

    @Transactional
    public MessageResponse updateRoomDetails(Long matchId, RoomDetailsRequest request) {
        GameMatch match = matches.findById(matchId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Match not found"));
        match.setRoomId(request.roomId().trim());
        match.setRoomPassword(request.roomPassword().trim());

        List<User> registeredPlayers = participants.findByMatchIdOrderByJoinedAtAsc(matchId).stream()
                .map(MatchParticipant::getUser)
                .toList();

        notifications.notifyUsers(registeredPlayers, NotificationType.MATCH,
                "Room details shared",
                "Room ID: " + match.getRoomId() + ". Password: " + match.getRoomPassword() + ".",
                match.getId());

        if (registeredPlayers.isEmpty()) {
            return new MessageResponse("Room details saved. No registered players yet.");
        }
        return new MessageResponse("Room details sent to " + registeredPlayers.size() + " registered player" + (registeredPlayers.size() == 1 ? "." : "s."));
    }

    @Transactional
    public MessageResponse updateMatchTime(Long matchId, MatchTimingRequest request) {
        GameMatch match = matches.findById(matchId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Match not found"));
        if (!match.getRegisterBefore().isBefore(request.matchTime())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Register before time must be before match time");
        }
        match.setMatchTime(request.matchTime());
        return new MessageResponse("Match time updated successfully.");
    }

    @Transactional(readOnly = true)
    public List<ParticipantSummary> participants(Long matchId) {
        return participants.findByMatchIdOrderByJoinedAtAsc(matchId).stream()
                .map(p -> {
                    String teamName = p.getTeam() == null ? "Solo" : p.getTeam().getName();
                    String gamingUid = p.getUser().getGameUid() == null || p.getUser().getGameUid().isBlank()
                            ? p.getUser().getUid()
                            : p.getUser().getGameUid();
                    return new ParticipantSummary(p.getUser().getId(), gamingUid, p.getUser().getUsername(),
                            gamingUid, teamName, p.getUser().getWalletBalance(), p.getUser().getWinningPoints());
                })
                .toList();
    }

    @Transactional
    public void awardMatchResults(Long matchId, MatchResultRequest request, User controller) {
        GameMatch match = matches.findById(matchId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Match not found"));
        if (match.getCreatedBy() == null || !match.getCreatedBy().getId().equals(controller.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You can submit results only for matches created by you");
        }
        if (!match.isActive()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Match results have already been recorded");
        }
        var enrollments = participants.findByMatchIdOrderByJoinedAtAsc(matchId);
        Map<String, MatchParticipant> participantByUid = enrollments.stream()
                .collect(Collectors.toMap(p -> participantResultUid(p), p -> p));
        Map<String, String> entryKeyByUid = enrollments.stream()
                .collect(Collectors.toMap(p -> participantResultUid(p), this::resultEntryKey));
        BigDecimal rewardsUpdated = BigDecimal.ZERO;
        BigDecimal pointsUpdated = BigDecimal.ZERO;
        int positionsUpdated = 0;
        String winnerSummary;

        if (usesWinnerOnlyResult(match)) {
            MatchParticipant first = participantByUid.get(request.firstUid());
            if (first == null) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Selected winner is not registered in this match");
            }
            AwardTotals totals = awardPlacement(enrollments, first, match.getFirstReward(), match.getFirstReward(),
                    "Congratulations! You won.",
                    "Congratulations! You won and Rs " + match.getFirstReward() + " has been added to your wallet.");
            rewardsUpdated = rewardsUpdated.add(totals.rewardsUpdated());
            pointsUpdated = pointsUpdated.add(totals.pointsUpdated());
            positionsUpdated += 1;
            winnerSummary = "Winner: " + participantLabel(first);
            Set<String> winningEntryKeys = Set.of(resultEntryKey(first));
            enrollments.stream()
                    .filter(participant -> !winningEntryKeys.contains(resultEntryKey(participant)))
                    .map(MatchParticipant::getUser)
                    .forEach(user -> notifications.notifyUser(user, NotificationType.MATCH,
                            "Match completed",
                            "You can be better next time."));
            match.setActive(false);
            recordReview(match, controller, winnerSummary, rewardsUpdated, pointsUpdated, positionsUpdated);
            return;
        }

        if (request.secondUid() == null || request.secondUid().isBlank()
                || request.thirdUid() == null || request.thirdUid().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "First, second and third places are required for this match");
        }
        if (Set.of(request.firstUid(), request.secondUid(), request.thirdUid()).size() < 3) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "First, second and third must be distinct participants");
        }
        MatchParticipant first = participantByUid.get(request.firstUid());
        MatchParticipant second = participantByUid.get(request.secondUid());
        MatchParticipant third = participantByUid.get(request.thirdUid());
        if (first == null || second == null || third == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "One or more selected winners are not registered in this match");
        }
        if (Set.of(entryKeyByUid.get(request.firstUid()), entryKeyByUid.get(request.secondUid()), entryKeyByUid.get(request.thirdUid())).size() < 3) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "One team or player can only be selected for one prize position");
        }

        AwardTotals firstTotals = awardPlacement(enrollments, first, match.getFirstReward(), match.getFirstReward(),
                "Congratulations! You won.",
                "Congratulations! You won and Rs " + match.getFirstReward() + " has been added to your wallet.");
        AwardTotals secondTotals = awardPlacement(enrollments, second, match.getSecondReward(), match.getSecondReward(),
                "Well done! You finished 2nd.",
                "You finished second and Rs " + match.getSecondReward() + " has been added to your wallet.");
        AwardTotals thirdTotals = awardPlacement(enrollments, third, match.getThirdReward(), match.getThirdReward(),
                "Good effort! You finished 3rd.",
                "You finished third and Rs " + match.getThirdReward() + " has been added to your wallet.");
        rewardsUpdated = rewardsUpdated
                .add(firstTotals.rewardsUpdated())
                .add(secondTotals.rewardsUpdated())
                .add(thirdTotals.rewardsUpdated());
        pointsUpdated = pointsUpdated
                .add(firstTotals.pointsUpdated())
                .add(secondTotals.pointsUpdated())
                .add(thirdTotals.pointsUpdated());
        positionsUpdated = 3;
        winnerSummary = "1st: " + participantLabel(first) + " | 2nd: " + participantLabel(second) + " | 3rd: " + participantLabel(third);
        Set<String> winningEntryKeys = Set.of(resultEntryKey(first), resultEntryKey(second), resultEntryKey(third));

        enrollments.stream()
                .filter(participant -> !winningEntryKeys.contains(resultEntryKey(participant)))
                .map(MatchParticipant::getUser)
                .forEach(user -> notifications.notifyUser(user, NotificationType.MATCH,
                        "Match completed",
                        "You can be better next time."));

        match.setActive(false);
        recordReview(match, controller, winnerSummary, rewardsUpdated, pointsUpdated, positionsUpdated);
    }

    private boolean usesWinnerOnlyResult(GameMatch match) {
        return match.getGameType() == GameType.CLASH_SQUAD || match.getGameType() == GameType.LONE_WOLF;
    }

    private AwardTotals awardPlacement(List<MatchParticipant> enrollments, MatchParticipant selected,
                                       BigDecimal reward, BigDecimal points, String title, String message) {
        User user = selected.getUser();
        List<MatchParticipant> recipients = selected.getTeam() == null
                ? List.of(selected)
                : enrollments.stream()
                        .filter(participant -> participant.getTeam() != null
                                && participant.getTeam().getId().equals(selected.getTeam().getId()))
                        .toList();

        if (reward.signum() > 0) {
            recipients.forEach(participant -> {
                User recipient = participant.getUser();
                recipient.setWalletBalance(recipient.getWalletBalance().add(reward));
                users.save(recipient);
                WalletTransaction tx = new WalletTransaction();
                tx.setUser(recipient);
                tx.setType(TransactionType.REWARD);
                tx.setAmount(reward);
                tx.setNote(message);
                transactions.save(tx);
            });
        }

        if (points.signum() > 0) {
            recipients.forEach(participant -> participant.getUser()
                    .setWinningPoints(participant.getUser().getWinningPoints().add(points)));
            BigDecimal teamPoints = points.multiply(BigDecimal.valueOf(recipients.size()));
            if (selected.getTeam() != null) {
                selected.getTeam().setTotalWinningPoints(selected.getTeam().getTotalWinningPoints().add(teamPoints));
            } else {
                teamMembers.findFirstByUserId(user.getId()).ifPresent(member ->
                        member.getTeam().setTotalWinningPoints(member.getTeam().getTotalWinningPoints().add(points)));
            }
        }

        notifications.notifyUser(user, NotificationType.MATCH, title, message);
        recipients.stream()
                .map(MatchParticipant::getUser)
                .filter(recipient -> !recipient.getId().equals(user.getId()))
                .forEach(recipient -> {
                    String msg;
                    if (reward.signum() > 0) {
                        msg = message;
                    } else {
                        msg = "Your team result was approved and " + points + " winning points were added.";
                    }
                    notifications.notifyUser(recipient, NotificationType.MATCH, title, msg);
                });

        return new AwardTotals(
                reward.multiply(BigDecimal.valueOf(recipients.size())),
                points.multiply(BigDecimal.valueOf(recipients.size()))
        );
    }

    private void recordReview(GameMatch match, User controller, String winnerSummary,
                              BigDecimal rewardsUpdated, BigDecimal pointsUpdated, int positionsUpdated) {
        ControllerReview review = new ControllerReview();
        review.setMatchId(match.getId());
        review.setMatchTitle(match.getTitle());
        review.setGameType(match.getGameType());
        review.setVariant(match.getVariant());
        review.setController(controller);
        review.setWinnerSummary(winnerSummary);
        review.setRewardsUpdated(rewardsUpdated);
        review.setPointsUpdated(pointsUpdated);
        review.setPositionsUpdated(positionsUpdated);
        review.setReviewedAt(Instant.now());
        controllerReviews.save(review);
    }

    private String participantLabel(MatchParticipant participant) {
        String teamName = participant.getTeam() == null ? "Solo" : participant.getTeam().getName();
        return participant.getUser().getUsername() + " (" + teamName + ")";
    }

    private String resultEntryKey(MatchParticipant participant) {
        return participant.getTeam() == null ? "solo:" + participant.getUser().getId() : "team:" + participant.getTeam().getId();
    }

    private record AwardTotals(BigDecimal rewardsUpdated, BigDecimal pointsUpdated) {}

    @Transactional
    public void award(AwardPointsRequest request) {
        User user = participants.findByMatchIdOrderByJoinedAtAsc(request.matchId()).stream()
                .map(MatchParticipant::getUser)
                .filter(u -> u.getUid().equals(request.userUid()))
                .findFirst()
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Participant not found in this match"));
        BigDecimal winningPoints = request.walletReward().signum() > 0 ? request.walletReward() : request.winningPoints();
        if (request.walletReward().signum() > 0) {
            user.setWalletBalance(user.getWalletBalance().add(request.walletReward()));
            users.save(user);
            WalletTransaction tx = new WalletTransaction();
            tx.setUser(user);
            tx.setType(TransactionType.REWARD);
            tx.setAmount(request.walletReward());
            tx.setNote(request.note() == null ? "Match wallet reward" : request.note());
            transactions.save(tx);
        }
        if (winningPoints.signum() > 0) {
            user.setWinningPoints(user.getWinningPoints().add(winningPoints));
            teamMembers.findFirstByUserId(user.getId()).ifPresent(member ->
                    member.getTeam().setTotalWinningPoints(member.getTeam().getTotalWinningPoints().add(winningPoints)));
        }
    }

    public MatchSummary summary(GameMatch match) {
        long currentParticipants = participants.countByMatchId(match.getId());
        long pendingInvites = invites.countByMatchIdAndAcceptedFalseAndRejectedFalse(match.getId());
        int seatsLeft = Math.max(0, match.getRoomSize() - (int) currentParticipants);
        return new MatchSummary(match.getId(), match.getTitle(), match.getGameType(), match.getVariant(),
                match.getEntryFee(), match.getFirstReward(), match.getSecondReward(), match.getThirdReward(),
                match.getRoomSize(), match.getMatchTime(), match.getRegisterBefore(),
                match.isActive() && Instant.now().isBefore(match.getRegisterBefore()), match.isActive(), match.isTeamOnly(),
                currentParticipants, seatsLeft, pendingInvites);
    }

    public RegisteredMatchSummary registeredSummary(GameMatch match) {
        MatchSummary summary = summary(match);
        return new RegisteredMatchSummary(summary.id(), summary.title(), summary.gameType(), summary.variant(),
                summary.entryFee(), summary.firstReward(), summary.secondReward(), summary.thirdReward(),
                summary.roomSize(), summary.matchTime(), summary.registerBefore(), summary.registrationOpen(),
                summary.active(), summary.teamOnly(), summary.currentParticipants(), summary.seatsLeft(),
                summary.pendingInvites(), match.getRoomId(), match.getRoomPassword());
    }

    private MasterMatchRow masterRow(GameMatch match) {
        long players = participants.countByMatchId(match.getId());
        BigDecimal entryTotal = match.getEntryFee().multiply(BigDecimal.valueOf(players));
        int size = teamSize(match.getVariant());
        BigDecimal rewardTotal = usesWinnerOnlyResult(match)
                ? match.getFirstReward().multiply(BigDecimal.valueOf(size))
                : match.getFirstReward().add(match.getSecondReward()).add(match.getThirdReward()).multiply(BigDecimal.valueOf(size));
        return new MasterMatchRow(match.getId(), match.getTitle(), match.getGameType(), match.getVariant(),
                match.getMatchTime(), match.getRegisterBefore(), players, entryTotal, rewardTotal,
                entryTotal.subtract(rewardTotal), match.isActive());
    }
}
