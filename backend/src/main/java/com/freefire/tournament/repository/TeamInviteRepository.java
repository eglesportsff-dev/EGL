package com.freefire.tournament.repository;

import com.freefire.tournament.entity.TeamInvite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TeamInviteRepository extends JpaRepository<TeamInvite, Long> {
    Optional<TeamInvite> findByMatchIdAndInviteeIdAndAcceptedFalse(Long matchId, Long inviteeId);
    Optional<TeamInvite> findByMatchIdAndInviteeIdAndAcceptedFalseAndRejectedFalse(Long matchId, Long inviteeId);
    Optional<TeamInvite> findTopByMatchIdAndInviteeIdAndAcceptedFalseAndRejectedFalseOrderByCreatedAtDesc(Long matchId, Long inviteeId);
    Optional<TeamInvite> findByMatchIdAndInviteeId(Long matchId, Long inviteeId);
    Optional<TeamInvite> findByIdAndInviteeId(Long id, Long inviteeId);
    long countByMatchIdAndAcceptedFalse(Long matchId);
    long countByMatchIdAndAcceptedFalseAndRejectedFalse(Long matchId);
    long countByMatchIdAndTeamIdAndAcceptedFalse(Long matchId, Long teamId);
    long countByMatchIdAndTeamIdAndAcceptedFalseAndRejectedFalse(Long matchId, Long teamId);
    long countByMatchIdAndTeamIdAndAcceptedTrue(Long matchId, Long teamId);
    List<TeamInvite> findByMatchIdAndTeamId(Long matchId, Long teamId);
    List<TeamInvite> findTop8ByInviteeIdOrInviterIdOrderByCreatedAtDesc(Long inviteeId, Long inviterId);
    void deleteByMatchId(Long matchId);
}
