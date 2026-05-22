package com.freefire.tournament.controller;

import com.freefire.tournament.dto.AppDtos.DashboardStats;
import com.freefire.tournament.dto.AppDtos.UserDashboard;
import com.freefire.tournament.service.CurrentUserService;
import com.freefire.tournament.service.DashboardService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    private final DashboardService dashboardService;
    private final CurrentUserService currentUser;

    public DashboardController(DashboardService dashboardService, CurrentUserService currentUser) {
        this.dashboardService = dashboardService;
        this.currentUser = currentUser;
    }

    @GetMapping("/me")
    public UserDashboard me() {
        return dashboardService.user(currentUser.get());
    }

    @GetMapping("/stats")
    public DashboardStats stats() {
        return dashboardService.stats();
    }
}
