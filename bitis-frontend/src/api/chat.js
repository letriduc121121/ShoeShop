// src/api/chat.js
import { apiCall } from './axios';

export const chatApi = {
  // Get available users to chat with
  getAvailableUsers: () => apiCall.get('/chat/available-users'),
  
  // Get chat history with a specific user
  getChatHistory: (otherUserId) => apiCall.get(`/chat/history/${otherUserId}`),
  
  // Send message
  sendMessage: (receiverId, message) => 
    apiCall.post('/chat/send', { receiverId, message }),
  
  // Mark message as read
  markAsRead: (messageId) => apiCall.put(`/chat/${messageId}/read`),
  
  // Get unread count
  getUnreadCount: () => apiCall.get('/chat/unread-count'),
  
  // Get unread messages
  getUnreadMessages: () => apiCall.get('/chat/unread'),
};