package com.freefire.tournament.service;

import com.freefire.tournament.dto.AppDtos.CreateStaffRequest;
import com.freefire.tournament.entity.*;
import com.freefire.tournament.repository.ControllerProfileRepository;
import com.freefire.tournament.repository.MasterControllerProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StaffService {
    private final AuthService authService;
    private final ControllerProfileRepository controllers;
    private final MasterControllerProfileRepository masters;

    public StaffService(AuthService authService, ControllerProfileRepository controllers,
                        MasterControllerProfileRepository masters) {
        this.authService = authService;
        this.controllers = controllers;
        this.masters = masters;
    }

    @Transactional
    public Long createController(CreateStaffRequest request) {
        User user = authService.createStaff(request.username(), request.email(), request.password(), Role.CONTROLLER);
        ControllerProfile profile = new ControllerProfile();
        profile.setUser(user);
        return controllers.save(profile).getId();
    }

    @Transactional
    public Long createMaster(CreateStaffRequest request) {
        User user = authService.createStaff(request.username(), request.email(), request.password(), Role.MASTER_CONTROLLER);
        MasterControllerProfile profile = new MasterControllerProfile();
        profile.setUser(user);
        return masters.save(profile).getId();
    }
}
