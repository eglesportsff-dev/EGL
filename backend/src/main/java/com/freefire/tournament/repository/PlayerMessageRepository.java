package com.freefire.tournament.repository;

import com.freefire.tournament.entity.PlayerMessage;
import com.freefire.tournament.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlayerMessageRepository extends JpaRepository<PlayerMessage, Long> {
    List<PlayerMessage> findBySenderIdAndRecipientIdOrderByCreatedAtDesc(Long senderId, Long recipientId);
    List<PlayerMessage> findByRecipientIdOrderByCreatedAtDesc(Long recipientId);
    List<PlayerMessage> findBySenderIdOrderByCreatedAtDesc(Long senderId);

    @Query("select m from PlayerMessage m where (m.sender.id = :userId and m.recipient.id = :otherId) or (m.sender.id = :otherId and m.recipient.id = :userId) order by m.createdAt desc")
    List<PlayerMessage> findConversation(@Param("userId") Long userId, @Param("otherId") Long otherId);

    @Modifying
    @Query("delete from PlayerMessage m where (m.sender.id = :userId and m.recipient.id = :otherId) or (m.sender.id = :otherId and m.recipient.id = :userId)")
    int deleteConversation(@Param("userId") Long userId, @Param("otherId") Long otherId);

    long countByRecipientIdAndReadFalse(Long recipientId);
    long countByRecipientIdAndSenderIdAndReadFalse(Long recipientId, Long senderId);
}
