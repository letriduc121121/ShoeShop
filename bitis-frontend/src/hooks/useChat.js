// src/hooks/useChat.js - FIXED OPTIMISTIC UPDATE
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatApi } from '../api/chat';
import useAuthStore from '../store/authStore'; // ✅ Import để lấy currentUser

// Get available users to chat with
export const useAvailableUsers = () => {
  return useQuery({
    queryKey: ['chat-users'],
    queryFn: () => chatApi.getAvailableUsers(),
    staleTime: 60 * 1000,
  });
};

// Get chat history with specific user
export const useChatHistory = (otherUserId) => {
  return useQuery({
    queryKey: ['chat-history', otherUserId],
    queryFn: async () => {
      console.log('📄 Fetching chat history with user:', otherUserId);
      const messages = await chatApi.getChatHistory(otherUserId);
      console.log('✅ Received messages:', messages?.length || 0);
      
      if (messages && messages.length > 0) {
        console.log('First message:', messages[0]);
        console.log('Last message:', messages[messages.length - 1]);
      }
      
      return messages;
    },
    enabled: !!otherUserId,
    staleTime: 5 * 1000,
    refetchInterval: 3000,
    refetchOnWindowFocus: true,
  });
};

// ✅ FIXED: Send message with CORRECT optimistic update
export const useSendMessage = () => {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user); // ✅ Lấy currentUser

  return useMutation({
    mutationFn: async ({ receiverId, message }) => {
      console.log('📤 Sending message to:', receiverId, 'Message:', message);
      const result = await chatApi.sendMessage(receiverId, message);
      console.log('✅ Message sent:', result);
      return result;
    },
    onMutate: async ({ receiverId, message }) => {
      const queryKey = ['chat-history', receiverId];
      
      await queryClient.cancelQueries(queryKey);
      
      const previousMessages = queryClient.getQueryData(queryKey);
      
      // ✅ FIX: Sử dụng ID thật của currentUser, không phải 'current'
      if (previousMessages && currentUser) {
        const tempMessage = {
          id: `temp-${Date.now()}`, // Temporary ID với prefix để dễ debug
          senderId: currentUser.id, // ✅ ĐÚNG: Dùng ID thật
          senderName: currentUser.fullName,
          receiverId: receiverId,
          message: message,
          createdAt: new Date().toISOString(),
          isRead: false,
        };
        
        console.log('🔄 Optimistic update with message:', tempMessage);
        queryClient.setQueryData(queryKey, [...previousMessages, tempMessage]);
      }
      
      return { previousMessages, queryKey };
    },
    onSuccess: (data, variables, context) => {
      console.log('✅ Message sent successfully, refetching...');
      queryClient.invalidateQueries(['chat-history', variables.receiverId]);
      queryClient.invalidateQueries(['chat-unread-count']);
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousMessages) {
        queryClient.setQueryData(context.queryKey, context.previousMessages);
      }
      console.error('❌ Failed to send message:', error);
    },
  });
};

// Mark as read
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId) => chatApi.markAsRead(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries(['chat-unread-count']);
      queryClient.invalidateQueries(['chat-unread']);
    },
  });
};

// Get unread count
export const useUnreadCount = () => {
  return useQuery({
    queryKey: ['chat-unread-count'],
    queryFn: () => chatApi.getUnreadCount(),
    staleTime: 10 * 1000,
    refetchInterval: 10000,
  });
};

// Get unread messages
export const useUnreadMessages = () => {
  return useQuery({
    queryKey: ['chat-unread'],
    queryFn: () => chatApi.getUnreadMessages(),
    staleTime: 10 * 1000,
  });
};