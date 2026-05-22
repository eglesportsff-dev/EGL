package com.freefire.tournament.repository;

import com.freefire.tournament.entity.TournamentUpdate;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TournamentUpdateRepository extends JpaRepository<TournamentUpdate, Long> {
    List<TournamentUpdate> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
