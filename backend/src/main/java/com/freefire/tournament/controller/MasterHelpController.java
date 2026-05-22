package com.freefire.tournament.controller;

import com.freefire.tournament.dto.AppDtos.HelpReplyRequest;
import com.freefire.tournament.dto.AppDtos.HelpTicketResponse;
import com.freefire.tournament.dto.AppDtos.PagedResponse;
import com.freefire.tournament.dto.AppDtos.PlayerUpdateRequest;
import com.freefire.tournament.dto.AppDtos.UpdateSummary;
import com.freefire.tournament.service.CurrentUserService;
import com.freefire.tournament.service.HelpService;
import com.freefire.tournament.service.TournamentUpdateService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/master/help")
public class MasterHelpController {
    private final HelpService helpService;
    private final TournamentUpdateService updateService;
    private final CurrentUserService currentUser;

    public MasterHelpController(HelpService helpService, TournamentUpdateService updateService,
                                CurrentUserService currentUser) {
        this.helpService = helpService;
        this.updateService = updateService;
        this.currentUser = currentUser;
    }

    @GetMapping("/tickets")
    public PagedResponse<HelpTicketResponse> tickets(@RequestParam(defaultValue = "0") int page,
                                                     @RequestParam(defaultValue = "8") int size) {
        return helpService.masterTickets(page, size);
    }

    @PostMapping("/respond")
    public HelpTicketResponse respond(@Valid @RequestBody HelpReplyRequest request) {
        return helpService.respond(currentUser.get(), request);
    }

    @PostMapping("/updates")
    public UpdateSummary sendUpdate(@Valid @RequestBody PlayerUpdateRequest request) {
        return updateService.sendToAllPlayers(request);
    }
}
