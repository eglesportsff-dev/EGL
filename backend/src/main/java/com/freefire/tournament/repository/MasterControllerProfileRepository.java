package com.freefire.tournament.repository;

import com.freefire.tournament.entity.MasterControllerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface MasterControllerProfileRepository extends JpaRepository<MasterControllerProfile, Long> {
    long countByActiveTrue();
    Optional<MasterControllerProfile> findFirstByActiveTrueOrderByIdDesc();
    Optional<MasterControllerProfile> findFirstByActiveTrueAndQrCodeUrlIsNotNullAndQrCodeUrlNotOrderByIdDesc(String qrCodeUrl);
    Optional<MasterControllerProfile> findByUserId(Long userId);
}
