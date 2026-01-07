package com.bitis.shoeshop.repository;

import com.bitis.shoeshop.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    /**
     * ✅ FIX: Query đúng để lấy tất cả tin nhắn giữa 2 users
     * Sử dụng @Query để rõ ràng hơn
     */
    @Query("SELECT m FROM ChatMessage m WHERE " +
            "(m.sender.id = :userId1 AND m.receiver.id = :userId2) OR " +
            "(m.sender.id = :userId2 AND m.receiver.id = :userId1) " +
            "ORDER BY m.createdAt ASC")
    List<ChatMessage> findChatHistoryBetweenUsers(
            @Param("userId1") Long userId1,
            @Param("userId2") Long userId2
    );

    // Unread messages
    List<ChatMessage> findByReceiverIdAndIsReadFalse(Long receiverId);

    // Unread count
    long countByReceiverIdAndIsReadFalse(Long receiverId);
}