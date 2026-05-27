package com.freefire.tournament.repository;

import com.freefire.tournament.entity.Role;
import com.freefire.tournament.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.Instant;
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

    @Query("SELECT u FROM User u WHERE u.role = :role AND u.id <> :excludeId " +
           "AND (:search = '' OR LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.gameUid) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY u.lastActivityAt DESC NULLS LAST")
    Page<User> findPlayers(@Param("role") Role role, 
                          @Param("excludeId") Long excludeId, 
                          @Param("search") String search, 
                          Pageable pageable);
}
