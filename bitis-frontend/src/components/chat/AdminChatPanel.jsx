// src/components/chat/AdminChatPanel.jsx
// Optional: Enhanced Admin Chat Experience
import { useState } from 'react';
import { Users, MessageSquare, TrendingUp } from 'lucide-react';
import { useAvailableUsers, useUnreadMessages } from '../../hooks/useChat';

export default function AdminChatPanel() {
  const { data: availableUsers } = useAvailableUsers();
  const { data: unreadMessages } = useUnreadMessages();

  // Group unread messages by sender
  const unreadBySender = unreadMessages?.reduce((acc, msg) => {
    acc[msg.senderId] = (acc[msg.senderId] || 0) + 1;
    return acc;
  }, {});

  const totalUsers = availableUsers?.length || 0;
  const usersWithUnread = Object.keys(unreadBySender || {}).length;
  const totalUnread = unreadMessages?.length || 0;

  return (
    <div className="grid md:grid-cols-3 gap-4 mb-6">
      {/* Total Conversations */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <Users className="w-8 h-8 opacity-80" />
          <span className="text-3xl font-heading font-bold">{totalUsers}</span>
        </div>
        <h3 className="font-semibold">Tổng người dùng</h3>
        <p className="text-sm opacity-80">Có thể nhắn tin</p>
      </div>

      {/* Unread Messages */}
      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <MessageSquare className="w-8 h-8 opacity-80" />
          <span className="text-3xl font-heading font-bold">{totalUnread}</span>
        </div>
        <h3 className="font-semibold">Tin chưa đọc</h3>
        <p className="text-sm opacity-80">Cần phản hồi</p>
      </div>

      {/* Active Chats */}
      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <TrendingUp className="w-8 h-8 opacity-80" />
          <span className="text-3xl font-heading font-bold">{usersWithUnread}</span>
        </div>
        <h3 className="font-semibold">Cuộc trò chuyện</h3>
        <p className="text-sm opacity-80">Đang hoạt động</p>
      </div>
    </div>
  );
}