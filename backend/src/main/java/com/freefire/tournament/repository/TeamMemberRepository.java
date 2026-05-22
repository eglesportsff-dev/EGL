package com.freefire.tournament.repository;

import com.freefire.tournament.entity.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.Optional;

public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {
    Optional<TeamMember> findFirstByUserId(Long userId);
    Optional<TeamMember> findByTeamIdAndUserId(Long teamId, Long userId);
    long countByTeamId(Long teamId);

    @Query("select count(tm) from TeamMember tm where tm.team.id = :teamId and tm.user.winningPoints < 250")
    long countMembersBelowQualification(Long teamId);
}
