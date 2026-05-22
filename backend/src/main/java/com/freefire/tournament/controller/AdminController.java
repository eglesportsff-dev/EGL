package com.freefire.tournament.controller;

import com.freefire.tournament.dto.AppDtos.CreateStaffRequest;
import com.freefire.tournament.dto.AppDtos.AdminUserRow;
import com.freefire.tournament.dto.AppDtos.PagedResponse;
import com.freefire.tournament.entity.Role;
import com.freefire.tournament.dto.AuthDtos.MessageResponse;
import com.freefire.tournament.service.AdminService;
import com.freefire.tournament.service.StaffService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final StaffService staffService;
    private final AdminService adminService;

    public AdminController(StaffService staffService, AdminService adminService) {
        this.staffService = staffService;
        this.adminService = adminService;
    }

    @PostMapping("/master-controllers")
    public Map<String, Object> createMaster(@Valid @RequestBody CreateStaffRequest request) {
        return Map.of("masterControllerProfileId", staffService.createMaster(request),
                "message", "Master Controller created");
    }

    @GetMapping("/players")
    public PagedResponse<AdminUserRow> players(@RequestParam(defaultValue = "0") int page,
                                               @RequestParam(defaultValue = "15") int size) {
        return adminService.users(Role.USER, page, size);
    }

    @GetMapping("/controllers")
    public PagedResponse<AdminUserRow> controllers(@RequestParam(defaultValue = "0") int page,
                                                   @RequestParam(defaultValue = "15") int size) {
        return adminService.users(Role.CONTROLLER, page, size);
    }

    @GetMapping("/masters")
    public PagedResponse<AdminUserRow> masters(@RequestParam(defaultValue = "0") int page,
                                               @RequestParam(defaultValue = "10") int size) {
        return adminService.users(Role.MASTER_CONTROLLER, page, size);
    }
}
