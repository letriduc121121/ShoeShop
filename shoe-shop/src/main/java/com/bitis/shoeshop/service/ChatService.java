package com.bitis.shoeshop.service;

import com.bitis.shoeshop.dto.ChatMessageDto;
import com.bitis.shoeshop.dto.SendMessageRequest;
import com.bitis.shoeshop.entity.ChatMessage;
import com.bitis.shoeshop.entity.User;
import com.bitis.shoeshop.repository.ChatMessageRepository;
import com.bitis.shoeshop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private static final Logger logger = LoggerFactory.getLogger(ChatService.class);

    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;

    @Transactional
    public ChatMessageDto sendMessage(Long senderId, SendMessageRequest request) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        // ✅ VALIDATION: Kiểm tra quy tắc chat
        validateChatRules(sender, receiver);

        ChatMessage message = new ChatMessage();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setMessage(request.getMessage());
        message.setIsRead(false);

        ChatMessage saved = chatMessageRepository.save(message);

        logger.info("💾 Message saved: {} -> {} | Text: {}",
                sender.getUsername(), receiver.getUsername(), request.getMessage());

        return convertToDto(saved);
    }

    private void validateChatRules(User sender, User receiver) {
        // Nếu sender là USER
        if ("USER".equals(sender.getRole().name())) {
            // USER chỉ được gửi tin cho ADMIN
            if (!"ADMIN".equals(receiver.getRole().name())) {
                logger.error("❌ USER {} tried to send message to another USER {}",
                        sender.getUsername(), receiver.getUsername());
                throw new RuntimeException("Customers can only chat with administrators");
            }
        }

        // ADMIN có thể chat với bất kỳ ai (không cần validate)
        logger.info("✅ Chat validation passed: {} ({}) -> {} ({})",
                sender.getUsername(), sender.getRole(),
                receiver.getUsername(), receiver.getRole());
    }

    /**
     * ✅ FIX: Sử dụng query mới để lấy chat history
     */
    public List<ChatMessageDto> getChatHistory(Long userId, Long otherUserId) {
        logger.info("📖 Fetching chat history between {} and {}", userId, otherUserId);

        List<ChatMessage> messages = chatMessageRepository
                .findChatHistoryBetweenUsers(userId, otherUserId);

        logger.info("📊 Found {} messages", messages.size());

        // Convert to DTO và log để debug
        List<ChatMessageDto> dtos = messages.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

        if (!dtos.isEmpty()) {
            logger.info("📝 First message: {}", dtos.get(0).getMessage());
            logger.info("📝 Last message: {}", dtos.get(dtos.size() - 1).getMessage());
        }

        return dtos;
    }

    @Transactional
    public void markAsRead(Long messageId) {
        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        message.setIsRead(true);
        chatMessageRepository.save(message);

        logger.info("✓ Message #{} marked as read", messageId);
    }

    public long getUnreadCount(Long userId) {
        long count = chatMessageRepository.countByReceiverIdAndIsReadFalse(userId);
        logger.info("📬 Unread count for user {}: {}", userId, count);
        return count;
    }

    public List<ChatMessageDto> getUnreadMessages(Long userId) {
        List<ChatMessage> messages = chatMessageRepository.findByReceiverIdAndIsReadFalse(userId);
        return messages.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    public List<User> getAvailableChatUsers(Long currentUserId) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if ("USER".equals(currentUser.getRole().name())) {
            // USER chỉ thấy ADMIN
            List<User> admins = userRepository.findAll().stream()
                    .filter(u -> "ADMIN".equals(u.getRole().name()))
                    .collect(Collectors.toList());

            logger.info("👤 USER {} can chat with {} admins", currentUserId, admins.size());
            return admins;
        } else {
            // ADMIN thấy tất cả user khác (trừ chính mình)
            List<User> others = userRepository.findAll().stream()
                    .filter(u -> !u.getId().equals(currentUserId))
                    .collect(Collectors.toList());

            logger.info("👨‍💼 ADMIN {} can chat with {} users", currentUserId, others.size());
            return others;
        }
    }

    private ChatMessageDto convertToDto(ChatMessage message) {
        return new ChatMessageDto(
                message.getId(),
                message.getSender().getId(),
                message.getSender().getFullName(),
                message.getReceiver().getId(),
                message.getReceiver().getFullName(),
                message.getMessage(),
                message.getIsRead(),
                message.getCreatedAt().toString() // ISO 8601 format
        );
    }
}