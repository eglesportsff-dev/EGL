package com.freefire.tournament.repository;

import com.freefire.tournament.entity.GameMatch;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.Instant;
import java.util.List;

public interface MatchRepository extends JpaRepository<GameMatch, Long> {
    List<GameMatch> findByActiveTrueOrderByMatchTimeAsc(Pageable pageable);
    List<GameMatch> findByCreatedByIdOrderByMatchTimeDesc(Long createdById);
    List<GameMatch> findByCreatedByIdAndActiveTrueOrderByMatchTimeDesc(Long createdById);
    long countByActiveTrue();
    long countByCreatedById(Long createdById);
    long countByActiveTrueAndMatchTimeAfter(Instant time);

    @Query("SELECT m FROM GameMatch m WHERE m.active = false OR (m.matchTime IS NOT NULL AND m.matchTime < :now) ORDER BY m.matchTime DESC")
    List<GameMatch> findHistoryMatches(@Param("now") Instant now);

    @Query("SELECT m FROM GameMatch m WHERE m.active = true AND (m.matchTime IS NULL OR m.matchTime > :now) ORDER BY m.matchTime ASC")
    List<GameMatch> findUpcomingMatches(@Param("now") Instant now);

    @Query("SELECT m FROM GameMatch m WHERE m.active = true AND (m.matchTime IS NULL OR m.matchTime < :plus24h) ORDER BY m.matchTime ASC")
    List<GameMatch> findLiveMatches(@Param("plus24h") Instant plus24h);
}
