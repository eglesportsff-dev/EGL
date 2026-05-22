package com.freefire.tournament.repository;

import com.freefire.tournament.entity.Team;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface TeamRepository extends JpaRepository<Team, Long> {
    List<Team> findAllByOrderByTotalWinningPointsDesc(Pageable pageable);
    Optional<Team> findByName(String name);
}
