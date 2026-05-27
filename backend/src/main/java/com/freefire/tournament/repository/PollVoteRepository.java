package com.freefire.tournament.repository;

import com.freefire.tournament.entity.PollVote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PollVoteRepository extends JpaRepository<PollVote, Long> {
    Optional<PollVote> findByPollIdAndUserId(Long pollId, Long userId);
    
    long countByOptionId(Long optionId);

    @Query("SELECT pv.option.id FROM PollVote pv WHERE pv.poll.id = :pollId AND pv.user.id = :userId")
    Optional<Long> findVotedOptionIdByPollIdAndUserId(@Param("pollId") Long pollId, @Param("userId") Long userId);
}
