package com.freefire.tournament.repository;

import com.freefire.tournament.entity.Role;
import com.freefire.tournament.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUid(String uid);
    Optional<User> findByGameUid(String gameUid);
    boolean existsByEmail(String email);
    boolean existsByGameUid(String gameUid);
    long countByRole(Role role);
    List<User> findByRole(Role role);
    Page<User> findByRoleOrderByCreatedAtDesc(Role role, Pageable pageable);
    List<User> findByRoleOrderByWinningPointsDesc(Role role, Pageable pageable);
}
