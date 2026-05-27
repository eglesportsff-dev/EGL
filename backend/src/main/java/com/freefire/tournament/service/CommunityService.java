package com.freefire.tournament.service;

import com.freefire.tournament.dto.AppDtos.*;
import com.freefire.tournament.dto.AuthDtos.MessageResponse;
import com.freefire.tournament.entity.*;
import com.freefire.tournament.exception.ApiException;
import com.freefire.tournament.repository.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class CommunityService {
    private final GlobalMessageRepository globalMessages;
    private final PollRepository polls;
    private final PollOptionRepository pollOptions;
    private final PollVoteRepository pollVotes;
    private final UserRepository userRepository;

    public CommunityService(GlobalMessageRepository globalMessages, PollRepository polls,
                            PollOptionRepository pollOptions, PollVoteRepository pollVotes,
                            UserRepository userRepository) {
        this.globalMessages = globalMessages;
        this.polls = polls;
        this.pollOptions = pollOptions;
        this.pollVotes = pollVotes;
        this.userRepository = userRepository;
    }

    @Transactional
    public MessageResponse sendGlobalMessage(String content, User sender) {
        if (content == null || content.trim().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Message content cannot be empty");
        }
        if (content.length() > 1000) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Message content is too long");
        }

        // EMOJI CHECK: Players cannot use emojis, staff can
        if (sender.getRole() == Role.USER && containsEmoji(content)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Players are not allowed to use emojis in community chat");
        }

        GlobalMessage message = new GlobalMessage();
        message.setUser(sender);
        message.setContent(content.trim());
        message.setCreatedAt(Instant.now());
        globalMessages.save(message);

        // Update sender activity
        sender.setLastActivityAt(Instant.now());
        userRepository.save(sender);

        // Run pruning/cleanup to keep Supabase DB size small and stay on Free Plan
        pruneMessages();

        return new MessageResponse("Message sent successfully");
    }

    @Transactional(readOnly = true)
    public List<GlobalMessageRow> getGlobalMessages() {
        // 1. Get the last 10 player messages
        List<GlobalMessage> playersMsgs = globalMessages.findRecentPlayerMessages(
                Role.USER, PageRequest.of(0, 10));

        // 2. Get all staff messages from the last 24 hours
        Instant since24h = Instant.now().minusSeconds(24 * 60 * 60);
        List<GlobalMessage> staffMsgs = globalMessages.findRecentStaffMessages(
                List.of(Role.ADMIN, Role.CONTROLLER, Role.MASTER_CONTROLLER), since24h);

        // 3. Merge and sort chronologically (oldest first) for the chat room view
        return Stream.concat(playersMsgs.stream(), staffMsgs.stream())
                .sorted(Comparator.comparing(GlobalMessage::getCreatedAt))
                .map(this::toMessageRow)
                .toList();
    }

    private GlobalMessageRow toMessageRow(GlobalMessage msg) {
        User u = msg.getUser();
        Instant oneWeekAgo = Instant.now().minusSeconds(7 * 24 * 60 * 60);
        Instant oneMonthAgo = Instant.now().minusSeconds(30 * 24 * 60 * 60);

        String status;
        if (u.getLastActivityAt() != null && u.getLastActivityAt().isAfter(oneWeekAgo)) {
            status = "ACTIVE";
        } else if (u.getLastActivityAt() != null && u.getLastActivityAt().isAfter(oneMonthAgo)) {
            status = "RECENT";
        } else {
            status = "INACTIVE";
        }

        return new GlobalMessageRow(
                msg.getId(),
                u.getId(),
                u.getUsername(),
                u.getGameUid(),
                u.getProfileScreenshotUrl(),
                u.getWinningPoints(),
                status,
                msg.getContent(),
                msg.getCreatedAt()
        );
    }

    @Transactional
    public void pruneMessages() {
        // 1. Find the 10th player message's timestamp to prune older ones
        List<GlobalMessage> playersMsgs = globalMessages.findRecentPlayerMessages(
                Role.USER, PageRequest.of(0, 10));
        if (playersMsgs.size() >= 10) {
            Instant oldestAllowedPlayerTime = playersMsgs.get(playersMsgs.size() - 1).getCreatedAt();
            globalMessages.deleteOldPlayerMessages(Role.USER, oldestAllowedPlayerTime);
        }

        // 2. Delete staff messages older than 24 hours
        Instant threshold24h = Instant.now().minusSeconds(24 * 60 * 60);
        globalMessages.deleteOldStaffMessages(
                List.of(Role.ADMIN, Role.CONTROLLER, Role.MASTER_CONTROLLER), threshold24h);
    }

    @Transactional
    public MessageResponse createPoll(CreatePollRequest request, User creator) {
        if (creator.getRole() == Role.USER) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only admins and controllers can create polls");
        }
        if (request.options().size() < 2) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Poll must have at least 2 options");
        }

        Poll poll = new Poll();
        poll.setQuestion(request.question().trim());
        poll.setCreatedBy(creator);
        poll.setCreatedAt(Instant.now());
        poll.setActive(true);

        List<PollOption> options = new ArrayList<>();
        for (String optText : request.options()) {
            if (optText == null || optText.trim().isBlank()) continue;
            PollOption option = new PollOption();
            option.setPoll(poll);
            option.setOptionText(optText.trim());
            options.add(option);
        }
        poll.setOptions(options);

        polls.save(poll);
        return new MessageResponse("Poll created successfully");
    }

    @Transactional(readOnly = true)
    public List<PollDto> getActivePolls(User currentUser) {
        List<Poll> activePolls = polls.findByActiveTrueOrderByCreatedAtDesc();
        
        List<PollDto> result = new ArrayList<>();
        for (Poll poll : activePolls) {
            List<PollOptionDto> optionsList = new ArrayList<>();
            for (PollOption opt : poll.getOptions()) {
                long votesCount = pollVotes.countByOptionId(opt.getId());
                optionsList.add(new PollOptionDto(opt.getId(), opt.getOptionText(), votesCount));
            }

            Long votedOptionId = pollVotes.findVotedOptionIdByPollIdAndUserId(poll.getId(), currentUser.getId())
                    .orElse(null);

            result.add(new PollDto(
                    poll.getId(),
                    poll.getQuestion(),
                    poll.getCreatedBy().getUsername(),
                    poll.getCreatedAt(),
                    poll.isActive(),
                    optionsList,
                    votedOptionId
            ));
        }
        return result;
    }

    @Transactional
    public MessageResponse voteInPoll(Long pollId, Long optionId, User voter) {
        Poll poll = polls.findById(pollId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Poll not found"));

        if (!poll.isActive()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "This poll is closed");
        }

        // Check if user has already voted
        if (pollVotes.findByPollIdAndUserId(pollId, voter.getId()).isPresent()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "You have already voted in this poll");
        }

        PollOption option = poll.getOptions().stream()
                .filter(opt -> opt.getId().equals(optionId))
                .findFirst()
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Invalid option for this poll"));

        PollVote vote = new PollVote();
        vote.setPoll(poll);
        vote.setOption(option);
        vote.setUser(voter);
        pollVotes.save(vote);

        return new MessageResponse("Vote recorded successfully");
    }

    @Transactional
    public MessageResponse closePoll(Long pollId, User closer) {
        if (closer.getRole() == Role.USER) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only admins and controllers can close polls");
        }

        Poll poll = polls.findById(pollId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Poll not found"));

        poll.setActive(false);
        polls.save(poll);

        return new MessageResponse("Poll closed successfully");
    }

    private boolean containsEmoji(String text) {
        return text.codePoints().anyMatch(cp -> 
            (cp >= 0x1F300 && cp <= 0x1F9FF) || 
            (cp >= 0x2600 && cp <= 0x27BF)
        );
    }
}
