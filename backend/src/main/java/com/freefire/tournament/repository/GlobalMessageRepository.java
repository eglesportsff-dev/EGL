package com.freefire.tournament.repository;

import com.freefire.tournament.entity.GlobalMessage;
import com.freefire.tournament.entity.Role;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface GlobalMessageRepository extends JpaRepository<GlobalMessage, Long> {
    @Query("SELECT gm FROM GlobalMessage gm WHERE gm.user.role = :role ORDER BY gm.createdAt DESC")
    List<GlobalMessage> findByRoleOrderByCreatedAtDesc(@Param("role") Role role, Pageable pageable);

    @Query("SELECT gm FROM GlobalMessage gm WHERE gm.user.role IN (:roles) AND gm.createdAt > :since ORDER BY gm.createdAt DESC")
    List<GlobalMessage> findByRolesAndCreatedAtAfterOrderByCreatedAtDesc(
            @Param("roles") List<Role> roles, @Param("since") Instant since);

    @Modifying
    @Query("DELETE FROM GlobalMessage gm WHERE gm.user.role = :role AND gm.createdAt < :timestamp")
    int deleteOldPlayerMessages(@Param("role") Role role, @Param("timestamp") Instant timestamp);

    @Modifying
    @Query("DELETE FROM GlobalMessage gm WHERE gm.user.role IN (:roles) AND gm.createdAt < :timestamp")
    int deleteOldStaffMessages(@Param("roles") List<Role> roles, @Param("timestamp") Instant timestamp);
}
