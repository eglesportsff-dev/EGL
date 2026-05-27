package com.freefire.tournament.dto;

import com.freefire.tournament.entity.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public class AppDtos {
    public record MatchSummary(Long id, String title, GameType gameType, MatchVariant variant, BigDecimal entryFee,
                               BigDecimal firstReward, BigDecimal secondReward, BigDecimal thirdReward,
                               Integer roomSize, Instant matchTime, Instant registerBefore, boolean registrationOpen, boolean active, boolean teamOnly,
                               long currentParticipants, int seatsLeft, long pendingInvites) {}

    public record RegisteredMatchSummary(Long id, String title, GameType gameType, MatchVariant variant, BigDecimal entryFee,
                                         BigDecimal firstReward, BigDecimal secondReward, BigDecimal thirdReward,
                                         Integer roomSize, Instant matchTime, Instant registerBefore, boolean registrationOpen, boolean active, boolean teamOnly,
                                         long currentParticipants, int seatsLeft, long pendingInvites,
                                         String roomId, String roomPassword) {}

    public record CreateMatchRequest(@NotBlank String title, @NotNull GameType gameType, @NotNull MatchVariant variant,
                                     @DecimalMin("0.00") BigDecimal entryFee, @DecimalMin("0.00") BigDecimal firstReward,
                                     @DecimalMin("0.00") BigDecimal secondReward, @DecimalMin("0.00") BigDecimal thirdReward,
                                     @Min(2) Integer roomSize, Instant matchTime, @NotNull Instant registerBefore,
                                     boolean teamOnly) {}

    public record JoinMatchRequest(@NotNull Long matchId) {}

    public record TeamJoinRequest(@NotNull Long matchId, @NotBlank String teamName,
                                  @NotNull List<@NotBlank String> playerUids,
                                  boolean confirm,
                                  @Size(max = 240) String note) {}

    public record TeamValidationResult(boolean valid, List<String> missingUids, String message) {}

    public record AcceptInviteRequest(@NotNull Long matchId) {}

    public record InviteActionRequest(@NotNull Long inviteId, @Size(max = 240) String note) {}

    public record FriendInviteRow(Long id, Long matchId, String matchTitle, GameType gameType, MatchVariant variant,
                                  String teamName, String inviterUsername, String inviterUid,
                                  String inviteeUsername, String inviteeUid, String note, String responseNote,
                                  String status, BigDecimal entryFee, int acceptedCount, int requiredCount,
                                  boolean incoming, Instant createdAt, Instant respondedAt) {}

    public record ControllerDashboardOverview(long activeMatches, long matchesManaged,
                                               BigDecimal rewardsDistributed, long pointUpdates,
                                               long upcomingMatches) {}

    public record WalletSummary(BigDecimal walletBalance, BigDecimal winningPoints) {}

    public record DepositRequestDto(@DecimalMin("12.00") @DecimalMax("2000.00") BigDecimal amount,
                                    @NotBlank String utrNumber) {}

    public record WithdrawRequestDto(@NotBlank String upiId, @NotBlank String userUid,
                                     @DecimalMin("1.00") BigDecimal amount) {}

    public record UserProfile(Long id, String uid, String username, String gameUid, String profileScreenshotUrl,
                              String upiId, String email, Role role, BigDecimal walletBalance,
                              BigDecimal winningPoints, boolean emailVerified, String passwordStatus) {}

    public record UpdateProfileRequest(@NotBlank @Size(min = 3, max = 80) String upiId) {}

    public record RequestAction(@NotNull Long requestId, String note, String rejectionReason, String transferReference) {}

    public record ParticipantSummary(Long userId, String uid, String username, String gameUid,
                                     String teamName, BigDecimal walletBalance, BigDecimal winningPoints) {}

    public record AwardPointsRequest(@NotNull Long matchId, @NotBlank String userUid,
                                     @DecimalMin("0.00") BigDecimal walletReward,
                                     @DecimalMin("0.00") BigDecimal winningPoints,
                                     String note) {}

    public record MatchResultRequest(@NotBlank String firstUid,
                                     String secondUid,
                                     String thirdUid,
                                     String fourthUid) {}

    public record RoomDetailsRequest(@NotBlank @Size(max = 80) String roomId,
                                     @NotBlank @Size(max = 80) String roomPassword) {}

    public record MatchTimingRequest(@NotNull Instant matchTime) {}

    public record PendingDepositRow(Long id, String username, String uid, String email,
                                    BigDecimal amount, String utrNumber, Instant createdAt) {}

    public record PendingWithdrawRow(Long id, String username, String uid, String email,
                                     String upiId, BigDecimal amount, RequestStatus status, Instant createdAt) {}

    public record QrRequest(@NotBlank String qrCodeUrl) {}

    public record QrResponse(String qrCodeUrl) {}

    public record MasterMatchRow(Long id, String title, GameType gameType, MatchVariant variant,
                                 Instant matchTime, Instant registerBefore, long players,
                                 BigDecimal entryFeeTotal, BigDecimal rewardTotal, BigDecimal savedTotal,
                                 boolean active) {}

    public record ControllerMatchRecord(Long id, String title, GameType gameType, MatchVariant variant,
                                        Instant matchTime, Instant registerBefore, long players,
                                        BigDecimal entryFeeTotal, BigDecimal rewardTotal, BigDecimal savedTotal,
                                        boolean active) {}

    public record ControllerOverviewRow(Long controllerProfileId, Long userId, String uid, String username,
                                        String gameUid, String email, boolean active, Instant createdAt,
                                        long totalMatches, long activeMatches, long totalPlayers,
                                        BigDecimal entryFeeTotal, BigDecimal rewardTotal, BigDecimal savedTotal,
                                        List<ControllerMatchRecord> matches) {}

    public record SeasonResetSummary(long usersReset, long teamsReset, long matchesDeleted,
                                     long participantsDeleted, long matchTransactionsDeleted,
                                     long controllerReviewsDeleted,
                                     String message) {}

    public record ManualPointsRequest(@NotBlank String playerUid,
                                      @DecimalMin("0.00") BigDecimal points) {}

    public record LeaderboardRow(Integer rank, Long teamId, String teamName, BigDecimal totalWinningPoints,
                                 boolean qualified, Long playerId, String playerName, String playerUid,
                                 String gameUid) {}

    public record ControllerReviewRow(Long id, Long matchId, String matchTitle, GameType gameType,
                                      MatchVariant variant, String controllerUsername,
                                      String winnerSummary, BigDecimal rewardsUpdated,
                                      BigDecimal pointsUpdated, int positionsUpdated,
                                      Instant reviewedAt) {}

    public record ControllerReviewSummary(long totalReviews, BigDecimal rewardsUpdated,
                                          BigDecimal pointsUpdated, int positionsUpdated,
                                          Instant since, List<ControllerReviewRow> items) {}

    public record UpdateSummary(Long id, String title, String message, Instant createdAt) {}

    public record TransactionSummary(Long id, TransactionType type, BigDecimal amount, String note, Instant createdAt) {}

    public record RequestUpdate(Long id, String type, RequestStatus status, BigDecimal amount,
                                String reference, String message, Instant createdAt) {}

    public record UserDashboard(WalletSummary wallet, List<MatchSummary> lastMatches,
                                List<TransactionSummary> lastTransactions, List<UpdateSummary> updates,
                                List<RequestUpdate> requestUpdates, String qualificationStatus, Integer teamRank) {}

    public record DashboardStats(long totalUsers, long totalControllers, long totalMasterControllers, long activeMatches,
                                 BigDecimal totalDeposits, BigDecimal totalWithdrawals, BigDecimal platformRevenue,
                                 BigDecimal rewardDistribution) {}

    public record NotificationSummary(Long id, NotificationType type, String title, String message,
                                      boolean seen, Instant createdAt, Long referenceId) {}

    public record CreateStaffRequest(@NotBlank String username, @Email @NotBlank String email,
                                     @NotBlank @Size(min = 8) String password) {}

    public record AdminUserRow(Long id, String uid, String username, String gameUid, String email,
                               String upiId, Role role, BigDecimal walletBalance, BigDecimal winningPoints,
                               boolean emailVerified) {}

    public record PagedResponse<T>(List<T> items, int page, int size, long totalElements, int totalPages) {}

    public record HelpTicketRequest(@NotBlank @Size(max = 120) String subject,
                                    @NotBlank @Size(max = 2000) String message) {}

    public record HelpReplyRequest(@NotNull Long ticketId,
                                   @NotBlank @Size(max = 2000) String response,
                                   HelpTicketStatus status) {}

    public record HelpTicketResponse(Long id, String username, String uid, String email,
                                     String subject, String message, HelpTicketStatus status,
                                     String masterResponse, Instant createdAt, Instant updatedAt,
                                     Instant respondedAt) {}

    public record PlayerUpdateRequest(@NotBlank @Size(max = 120) String title,
                                      @NotBlank @Size(max = 4000) String message) {}

    public record NotificationCenter(List<NotificationSummary> notifications, long unreadCount) {}

    public record ActivePlayerRow(Long userId, String username, String gameUid, String profileScreenshotUrl,
                                  BigDecimal winningPoints, String status, Instant lastActivityAt) {}

    public record SendMessageRequest(@NotNull Long recipientId, @NotBlank @Size(max = 150) String content) {}

    public record PlayerMessageRow(Long id, Long senderId, String senderUsername, String content,
                                   boolean read, Instant createdAt) {}

    public record MessageConversationRow(Long userId, String username, String gameUid, String profileScreenshotUrl,
                                        String lastMessage, boolean hasUnread, Instant lastMessageTime) {}

    public record PushSubscriptionRequest(String endpoint, String p256dh, String auth) {}
    public record VapidPublicKeyResponse(String publicKey) {}

    public record GlobalMessageRow(Long id, Long senderId, String senderUsername, String senderGameUid,
                                   String senderProfileScreenshotUrl, BigDecimal senderWinningPoints,
                                   String senderStatus, String content, Instant createdAt) {}

    public record PollOptionDto(Long id, String optionText, long votesCount) {}

    public record PollDto(Long id, String question, String createdByUsername, Instant createdAt,
                          boolean active, List<PollOptionDto> options, Long userVotedOptionId) {}

    public record CreatePollRequest(@NotBlank String question, @NotEmpty List<String> options) {}
}
