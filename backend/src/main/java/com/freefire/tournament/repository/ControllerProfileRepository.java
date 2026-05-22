package com.freefire.tournament.repository;

import com.freefire.tournament.entity.ControllerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ControllerProfileRepository extends JpaRepository<ControllerProfile, Long> {
    long countByActiveTrue();
    List<ControllerProfile> findByActiveTrueOrderByCreatedAtDesc();
}
