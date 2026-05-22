package com.freefire.tournament.repository;

import com.freefire.tournament.entity.MatchParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface MatchParticipantRepository extends JpaRepository<MatchParticipant, Long> {
    boolean existsByMatchIdAndUserId(Long matchId, Long userId);
    Optional<MatchParticipant> findByMatchIdAndUserId(Long matchId, Long userId);
    List<MatchParticipant> findByMatchIdOrderByJoinedAtAsc(Long matchId);
    void deleteByMatchId(Long matchId);
    @Query("""
            select p from MatchParticipant p
            join fetch p.match m
            where p.user.id = :userId
              and m.active = true
              and (m.matchTime is null or m.matchTime >= :now)
            order by m.matchTime asc
            """)
    List<MatchParticipant> findUpcomingByUserId(@Param("userId") Long userId, @Param("now") Instant now);
    long countByMatchId(Long matchId);
}
