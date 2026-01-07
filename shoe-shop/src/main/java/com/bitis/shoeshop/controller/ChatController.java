package com.bitis.shoeshop.controller;

import com.bitis.shoeshop.dto.ChatMessageDto;
import com.bitis.shoeshop.dto.MessageResponse;
import com.bitis.shoeshop.dto.SendMessageRequest;
import com.bitis.shoeshop.dto.UserDto;
import com.bitis.shoeshop.entity.User;
import com.bitis.shoeshop.service.ChatService;
import com.bitis.shoeshop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ChatController {

    private final ChatService chatService;
    private final UserRepository userRepository;

    private Long getUserIdFromAuth(Authentication auth) {
        UserDetails userDetails = (UserDetails) auth.getPrincipal();
        return userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
    }

    /**
     * ✅ REST API - Gửi tin nhắn (fallback cho non-WebSocket clients)
     */
    @PostMapping("/send")
    public ResponseEntity<ChatMessageDto> sendMessage(
            @RequestBody SendMessageRequest request,
            Authentication auth) {
        Long senderId = getUserIdFromAuth(auth);
        return ResponseEntity.ok(chatService.sendMessage(senderId, request));
    }

    /**
     * ✅ Lấy lịch sử chat với một user cụ thể
     */
    @GetMapping("/history/{otherUserId}")
    public ResponseEntity<List<ChatMessageDto>> getChatHistory(
            @PathVariable Long otherUserId,
            Authentication auth) {
        Long userId = getUserIdFromAuth(auth);
        return ResponseEntity.ok(chatService.getChatHistory(userId, otherUserId));
    }

    /**
     * ✅ Đánh dấu tin nhắn đã đọc
     */
    @PutMapping("/{messageId}/read")
    public ResponseEntity<MessageResponse> markAsRead(@PathVariable Long messageId) {
        chatService.markAsRead(messageId);
        return ResponseEntity.ok(new MessageResponse("Message marked as read"));
    }

    /**
     * ✅ Đếm số tin nhắn chưa đọc
     */
    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(Authentication auth) {
        Long userId = getUserIdFromAuth(auth);
        return ResponseEntity.ok(chatService.getUnreadCount(userId));
    }

    /**
     * ✅ Lấy danh sách tin nhắn chưa đọc
     */
    @GetMapping("/unread")
    public ResponseEntity<List<ChatMessageDto>> getUnreadMessages(Authentication auth) {
        Long userId = getUserIdFromAuth(auth);
        return ResponseEntity.ok(chatService.getUnreadMessages(userId));
    }

    /**
     * ✅ MỚI: Lấy danh sách users có thể chat
     * - USER: chỉ thấy danh sách ADMIN
     * - ADMIN: thấy tất cả users
     */
    @GetMapping("/available-users")
    public ResponseEntity<List<UserDto>> getAvailableChatUsers(Authentication auth) {
        Long currentUserId = getUserIdFromAuth(auth);
        List<User> users = chatService.getAvailableChatUsers(currentUserId);

        List<UserDto> userDtos = users.stream()
                .map(user -> new UserDto(
                        user.getId(),
                        user.getUsername(),
                        user.getFullName(),
                        user.getEmail(),
                        user.getRole().name()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(userDtos);
    }
}