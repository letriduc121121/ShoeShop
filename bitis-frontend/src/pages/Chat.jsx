// src/pages/Chat.jsx - MESSENGER STYLE FIXED
import { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Clock, CheckCheck, RefreshCw } from 'lucide-react';
import useAuthStore from '../store/authStore';
import {
  useAvailableUsers,
  useChatHistory,
  useSendMessage,
} from '../hooks/useChat';
import Loading from '../components/common/Loading';
import AdminChatPanel from '../components/chat/AdminChatPanel';

export default function Chat() {
  const currentUser = useAuthStore((state) => state.user);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  const { data: availableUsers, isLoading: loadingUsers } = useAvailableUsers();
  const { 
    data: messages, 
    isLoading: loadingMessages,
    refetch: refetchMessages 
  } = useChatHistory(selectedUser?.id);
  const sendMessage = useSendMessage();

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedUser) return;

    const messageText = message.trim();
    setMessage('');

    try {
      await sendMessage.mutateAsync({
        receiverId: selectedUser.id,
        message: messageText,
      });

      setTimeout(() => refetchMessages(), 500);
    } catch (error) {
      setMessage(messageText);
      window.dispatchEvent(
        new CustomEvent('app:toast', {
          detail: { message: error.message || 'Gửi tin nhắn thất bại', type: 'error' },
        })
      );
    }
  };

  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid time';
      }
      return date.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    } catch (error) {
      return 'Error';
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === today.toDateString()) {
        return 'Hôm nay';
      } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Hôm qua';
      } else {
        return date.toLocaleDateString('vi-VN', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric' 
        });
      }
    } catch (error) {
      return '';
    }
  };

  if (loadingUsers) {
    return <Loading message="Đang tải danh sách..." />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-heading font-bold mb-8">CHAT HỖ TRỢ</h1>

      {/* Admin Stats Panel */}
      {currentUser?.role === 'ADMIN' && <AdminChatPanel />}

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-gray-200">
        <div className="grid md:grid-cols-[320px_1fr] h-[600px]">
          {/* ✅ Users Sidebar - FIXED HEIGHT */}
          <div className="border-r-2 border-gray-200 bg-gray-50 flex flex-col h-[600px]">
            {/* Header - Fixed */}
            <div className="p-4 bg-gradient-to-r from-primary to-red-600 text-white flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading font-bold">TIN NHẮN</h3>
                  <p className="text-sm opacity-90">
                    {availableUsers?.length || 0} người
                  </p>
                </div>
              </div>
            </div>

            {/* ✅ Users List - Scrollable, but fixed in layout */}
            <div className="flex-1 overflow-y-auto">
              {availableUsers?.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {availableUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        setSelectedUser(user);
                        console.log('Selected user:', user);
                      }}
                      className={`w-full p-4 flex items-center gap-3 hover:bg-white transition-colors text-left ${
                        selectedUser?.id === user.id ? 'bg-white border-l-4 border-primary' : ''
                      }`}
                    >
                      {/* Avatar */}
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${
                          user.role === 'ADMIN' ? 'bg-primary' : 'bg-blue-500'
                        }`}
                      >
                        {user.fullName.charAt(0).toUpperCase()}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold truncate">{user.fullName}</h4>
                          {user.role === 'ADMIN' && (
                            <span className="text-xs bg-primary text-white px-2 py-0.5 rounded">
                              ADMIN
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate">@{user.username}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <MessageCircle className="w-16 h-16 mx-auto mb-3 opacity-30" />
                  <p>Không có người dùng nào</p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Window */}
          {selectedUser ? (
            <div className="flex flex-col h-[600px]">
              {/* ✅ Chat Header - Fixed */}
              <div className="p-4 border-b-2 border-gray-200 bg-white flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                      selectedUser.role === 'ADMIN' ? 'bg-primary' : 'bg-blue-500'
                    }`}
                  >
                    {selectedUser.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold">{selectedUser.fullName}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Online</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => refetchMessages()}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Làm mới tin nhắn"
                >
                  <RefreshCw className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* ✅ Messages - Scrollable, takes remaining space */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                      <p className="text-gray-600">Đang tải tin nhắn...</p>
                    </div>
                  </div>
                ) : messages?.length > 0 ? (
                  <>
                    {/* ✅ Messages in correct order: oldest first, newest last */}
                    {[...messages].map((msg, index) => {
                      // ✅ Compare with type conversion to avoid string vs number issues
                      const isSent = String(msg.senderId) === String(currentUser.id);
                      
                      // ✅ IMPORTANT: Don't use selectedUser for sender name!
                      // Backend already provides senderName in the message object
                      const senderName = msg.senderName || (isSent ? currentUser.fullName : selectedUser.fullName);
                      const senderId = msg.senderId;
                      
                      // Show date divider if date changed
                      const showDateDivider = index === 0 || 
                        formatDate(messages[index - 1].createdAt) !== formatDate(msg.createdAt);

                      return (
                        <div key={msg.id}>
                          {/* Date Divider */}
                          {showDateDivider && (
                            <div className="flex items-center gap-3 my-4">
                              <div className="flex-1 h-px bg-gray-300"></div>
                              <span className="text-xs text-gray-500 font-semibold px-3 py-1 bg-white rounded-full border border-gray-300">
                                {formatDate(msg.createdAt)}
                              </span>
                              <div className="flex-1 h-px bg-gray-300"></div>
                            </div>
                          )}
                          
                          {/* ✅ MESSENGER STYLE: Avatar + Message */}
                          <div
                            className={`flex gap-2 ${isSent ? 'justify-end' : 'justify-start'} animate-fade-in`}
                          >
                            {/* ✅ Avatar for received messages (left side) */}
                            {!isSent && (
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 self-end ${
                                  // Use senderId to determine if sender is admin
                                  msg.senderId !== currentUser.id && selectedUser.role === 'ADMIN' 
                                    ? 'bg-primary' 
                                    : 'bg-blue-500'
                                }`}
                              >
                                {senderName.charAt(0).toUpperCase()}
                              </div>
                            )}

                            {/* Message Bubble */}
                            <div className="flex flex-col max-w-[70%]">
                              {/* ✅ Sender name for received messages - USE msg.senderName */}
                              {!isSent && (
                                <span className="text-xs text-gray-600 font-semibold mb-1 ml-2">
                                  {senderName}
                                </span>
                              )}
                              
                              <div
                                className={`rounded-2xl px-4 py-3 ${
                                  isSent
                                    ? 'bg-primary text-white rounded-br-sm'
                                    : 'bg-white border-2 border-gray-200 rounded-bl-sm'
                                }`}
                              >
                                <p className="break-words whitespace-pre-wrap">{msg.message}</p>
                                <div
                                  className={`flex items-center gap-1 mt-1 text-xs ${
                                    isSent ? 'text-white/80 justify-end' : 'text-gray-500'
                                  }`}
                                >
                                  <Clock className="w-3 h-3" />
                                  <span>{formatTime(msg.createdAt)}</span>
                                  {isSent && msg.isRead && (
                                    <CheckCheck className="w-4 h-4 text-blue-300" />
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* ✅ Avatar for sent messages (right side) */}
                            {isSent && (
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 self-end bg-primary"
                              >
                                {currentUser.fullName.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <MessageCircle className="w-16 h-16 mx-auto mb-3 opacity-30" />
                      <p>Chưa có tin nhắn nào</p>
                      <p className="text-sm">Hãy bắt đầu cuộc trò chuyện!</p>
                    </div>
                  </div>
                )}
              </div>

              {/* ✅ Message Input - Fixed at bottom */}
              <form onSubmit={handleSendMessage} className="p-4 border-t-2 border-gray-200 bg-white flex-shrink-0">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!message.trim() || sendMessage.isLoading}
                    className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-red-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    <span className="hidden sm:inline">Gửi</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* No User Selected */
            <div className="flex items-center justify-center bg-gray-50">
              <div className="text-center text-gray-500">
                <MessageCircle className="w-24 h-24 mx-auto mb-4 opacity-20" />
                <h3 className="text-xl font-semibold mb-2">Chọn một cuộc trò chuyện</h3>
                <p>Chọn người dùng từ danh sách để bắt đầu chat</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info Box for Users */}
      {currentUser?.role !== 'ADMIN' && (
        <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">Hỗ trợ khách hàng</h4>
              <p className="text-sm text-blue-800">
                Bạn có thể nhắn tin với đội ngũ quản trị viên để được hỗ trợ. 
                Chúng tôi sẽ phản hồi trong thời gian sớm nhất!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}