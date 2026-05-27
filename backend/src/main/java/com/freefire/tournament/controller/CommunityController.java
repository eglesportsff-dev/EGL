package com.freefire.tournament.controller;

import com.freefire.tournament.dto.AppDtos.*;
import com.freefire.tournament.dto.AuthDtos.MessageResponse;
import com.freefire.tournament.service.CommunityService;
import com.freefire.tournament.service.CurrentUserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/community")
public class CommunityController {
    private final CommunityService communityService;
    private final CurrentUserService currentUser;

    public CommunityController(CommunityService communityService, CurrentUserService currentUser) {
        this.communityService = communityService;
        this.currentUser = currentUser;
    }

    @GetMapping("/messages")
    public List<GlobalMessageRow> getGlobalMessages() {
        return communityService.getGlobalMessages();
    }

    @PostMapping("/messages/send")
    public MessageResponse sendGlobalMessage(@RequestBody String content) {
        return communityService.sendGlobalMessage(content, currentUser.get());
    }

    @GetMapping("/polls")
    public List<PollDto> getActivePolls() {
        return communityService.getActivePolls(currentUser.get());
    }

    @PostMapping("/polls/create")
    public MessageResponse createPoll(@Valid @RequestBody CreatePollRequest request) {
        return communityService.createPoll(request, currentUser.get());
    }

    @PostMapping("/polls/{pollId}/vote")
    public MessageResponse voteInPoll(@PathVariable Long pollId, @RequestParam Long optionId) {
        return communityService.voteInPoll(pollId, optionId, currentUser.get());
    }

    @PostMapping("/polls/{pollId}/close")
    public MessageResponse closePoll(@PathVariable Long pollId) {
        return communityService.closePoll(pollId, currentUser.get());
    }
}
