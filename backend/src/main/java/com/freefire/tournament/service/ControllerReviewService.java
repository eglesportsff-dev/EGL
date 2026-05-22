package com.freefire.tournament.service;

import com.freefire.tournament.dto.AppDtos.ControllerReviewRow;
import com.freefire.tournament.dto.AppDtos.ControllerReviewSummary;
import com.freefire.tournament.entity.ControllerReview;
import com.freefire.tournament.repository.ControllerReviewRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Comparator;
import java.util.List;

@Service
public class ControllerReviewService {
    private final ControllerReviewRepository reviews;

    public ControllerReviewService(ControllerReviewRepository reviews) {
        this.reviews = reviews;
    }

    @Transactional(readOnly = true)
    public ControllerReviewSummary today() {
        ZoneId zone = ZoneId.systemDefault();
        Instant start = LocalDate.now(zone).atStartOfDay(zone).toInstant();
        Instant end = LocalDate.now(zone).plusDays(1).atStartOfDay(zone).toInstant();
        return summary(reviews.findByReviewedAtGreaterThanEqualAndReviewedAtLessThanOrderByReviewedAtDesc(start, end), start);
    }

    @Transactional(readOnly = true)
    public ControllerReviewSummary total() {
        List<ControllerReview> rows = reviews.findAllByOrderByReviewedAtDesc();
        Instant since = rows.stream()
                .map(ControllerReview::getReviewedAt)
                .min(Comparator.naturalOrder())
                .orElse(null);
        return summary(rows, since);
    }

    private ControllerReviewSummary summary(List<ControllerReview> rows, Instant since) {
        BigDecimal rewards = rows.stream()
                .map(ControllerReview::getRewardsUpdated)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal points = rows.stream()
                .map(ControllerReview::getPointsUpdated)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        int positions = rows.stream().mapToInt(ControllerReview::getPositionsUpdated).sum();
        return new ControllerReviewSummary(rows.size(), rewards, points, positions, since,
                rows.stream().map(this::row).toList());
    }

    private ControllerReviewRow row(ControllerReview review) {
        return new ControllerReviewRow(review.getId(), review.getMatchId(), review.getMatchTitle(),
                review.getGameType(), review.getVariant(), review.getController().getUsername(),
                review.getWinnerSummary(), review.getRewardsUpdated(), review.getPointsUpdated(),
                review.getPositionsUpdated(), review.getReviewedAt());
    }
}
