package com.bitis.shoeshop.controller;

import com.bitis.shoeshop.dto.ChatMessageDto;
import com.bitis.shoeshop.dto.SendMessageRequest;
import com.bitis.shoeshop.service.ChatService;
import com.bitis.shoeshop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class WebSocketChatController {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketChatController.class);

    private final ChatService chatService;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    private Long getUserIdFromAuth(Authentication auth) {
        UserDetails userDetails = (UserDetails) auth.getPrincipal();
        return userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
    }

    /**
     * WebSocket endpoint để gửi tin nhắn real-time
     * Client gửi tin đến: /app/chat.send
     */
    @MessageMapping("/chat.send")
    public void sendMessage(@Payload SendMessageRequest request, Authentication auth) {
        try {
            Long senderId = getUserIdFromAuth(auth);

            // Lưu tin nhắn vào DB và validate role
            ChatMessageDto savedMessage = chatService.sendMessage(senderId, request);

            logger.info("💬 Message sent from {} to {}", senderId, request.getReceiverId());

            // Gửi tin nhắn real-time đến receiver qua WebSocket
            messagingTemplate.convertAndSendToUser(
                    request.getReceiverId().toString(),
                    "/queue/messages",
                    savedMessage
            );

            // Gửi confirmation về cho sender
            messagingTemplate.convertAndSendToUser(
                    senderId.toString(),
                    "/queue/messages",
                    savedMessage
            );

        } catch (RuntimeException e) {
            logger.error("❌ Error sending message: {}", e.getMessage());
            // Gửi error về cho sender
            messagingTemplate.convertAndSendToUser(
                    getUserIdFromAuth(auth).toString(),
                    "/queue/errors",
                    e.getMessage()
            );
        }
    }

    /**
     * Đánh dấu tin nhắn đã đọc
     */
    @MessageMapping("/chat.read")
    public void markAsRead(@Payload Long messageId, Authentication auth) {
        try {
            chatService.markAsRead(messageId);

            // Thông báo cho sender rằng tin đã được đọc
            // (Có thể implement thêm nếu cần)
            logger.info("✅ Message {} marked as read", messageId);

        } catch (Exception e) {
            logger.error("❌ Error marking message as read: {}", e.getMessage());
        }
    }
}