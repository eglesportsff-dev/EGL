package com.freefire.tournament.repository;

import com.freefire.tournament.entity.GameMatch;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.Instant;
import java.util.List;

public interface MatchRepository extends JpaRepository<GameMatch, Long> {
    List<GameMatch> findByActiveTrueOrderByMatchTimeAsc(Pageable pageable);
    List<GameMatch> findByCreatedByIdOrderByMatchTimeDesc(Long createdById);
    List<GameMatch> findByCreatedByIdAndActiveTrueOrderByMatchTimeDesc(Long createdById);
    long countByActiveTrue();
    long countByCreatedById(Long createdById);
    long countByActiveTrueAndMatchTimeAfter(Instant time);
}
