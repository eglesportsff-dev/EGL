package com.freefire.tournament.repository;

import com.freefire.tournament.entity.ControllerReview;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.Instant;
import java.util.List;

public interface ControllerReviewRepository extends JpaRepository<ControllerReview, Long> {
    List<ControllerReview> findAllByOrderByReviewedAtDesc();
    List<ControllerReview> findByReviewedAtGreaterThanEqualAndReviewedAtLessThanOrderByReviewedAtDesc(Instant start, Instant end);
}
