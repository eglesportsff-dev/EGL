package com.freefire.tournament.controller;

import com.freefire.tournament.dto.AppDtos.HelpTicketRequest;
import com.freefire.tournament.dto.AppDtos.HelpTicketResponse;
import com.freefire.tournament.dto.AppDtos.PagedResponse;
import com.freefire.tournament.service.CurrentUserService;
import com.freefire.tournament.service.HelpService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/help")
public class HelpController {
    private final HelpService helpService;
    private final CurrentUserService currentUser;

    public HelpController(HelpService helpService, CurrentUserService currentUser) {
        this.helpService = helpService;
        this.currentUser = currentUser;
    }

    @PostMapping("/tickets")
    public HelpTicketResponse create(@Valid @RequestBody HelpTicketRequest request) {
        return helpService.createTicket(currentUser.get(), request);
    }

    @GetMapping("/tickets")
    public PagedResponse<HelpTicketResponse> mine(@RequestParam(defaultValue = "0") int page,
                                                  @RequestParam(defaultValue = "8") int size) {
        return helpService.userTickets(currentUser.get(), page, size);
    }
}
