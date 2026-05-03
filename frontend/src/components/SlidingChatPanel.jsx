import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { io } from 'socket.io-client';
import { Send, X, Loader2, MessageSquare, Crown, Users, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SlidingChatPanel = ({ clubId, clubName, userRole, onClose }) => {
  const { user, getAuthHeaders } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const socketRef = useRef();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const res = await axios.get(`${API}/api/chat/${clubId}`, { headers: getAuthHeaders() });
        setMessages(res.data);
      } catch (error) {
        console.error('Failed to load chat history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatHistory();

    socketRef.current = io(API);
    socketRef.current.emit('join_club_chat', clubId);

    socketRef.current.on('receive_message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [clubId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    socketRef.current.emit('send_message', {
      clubId,
      senderId: user._id,
      content: newMessage
    });
    setNewMessage('');
  };

  const handleDeleteMessage = async (msgId) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await axios.delete(`${API}/api/chat/message/${msgId}`, { headers: getAuthHeaders() });
      setMessages(prev => prev.filter(m => m._id !== msgId));
      toast.success('Message deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleClearChat = async () => {
    if (!window.confirm('Are you sure you want to clear all chat history for this club? This action cannot be undone.')) return;
    try {
      await axios.delete(`${API}/api/chat/${clubId}/clear`, { headers: getAuthHeaders() });
      setMessages([]);
      toast.success('Chat history cleared');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to clear chat');
    }
  };

  // Check if user can delete a message
  const canDelete = (msg) => {
    if (user.role === 'admin') return true;
    if (userRole === 'Club Head') return true;
    // Sender can delete own
    const senderId = msg.senderId?._id || msg.senderId;
    if (senderId === user._id) return true;
    // Positioned members (non-"Member" position)
    if (userRole && userRole !== 'Member') return true;
    return false;
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[60] transition-opacity"
        onClick={onClose}
      />
      
      {/* Sliding Panel */}
      <div 
        className="fixed top-0 right-0 h-full w-full sm:w-[480px] bg-white shadow-2xl z-[70] flex flex-col"
        style={{ animation: 'slideInRight 0.3s ease-out' }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2e1065] to-[#4c1d95] px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold text-sm">
              {clubName?.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-white font-bold text-base">{clubName}</h3>
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mt-0.5 ${
                userRole === 'Club Head' 
                  ? 'bg-amber-400/30 text-amber-200' 
                  : userRole === 'Admin'
                  ? 'bg-purple-400/30 text-purple-200'
                  : 'bg-blue-400/30 text-blue-200'
              }`}>
                {userRole === 'Club Head' && <Crown size={9} />}
                {(userRole === 'Member' || !userRole) && <Users size={9} />}
                {userRole || 'Member'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(userRole === 'Club Head' || userRole === 'Admin' || user?.role === 'admin') && (
              <button 
                onClick={handleClearChat}
                className="p-2 text-red-300 hover:text-red-100 hover:bg-red-500/20 rounded-xl transition-all flex items-center gap-1 text-xs font-medium"
                title="Clear all chats"
              >
                <Trash2 size={16} />
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Online indicator */}
        <div className="px-6 py-2 bg-emerald-50 border-b border-emerald-100 flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-medium text-emerald-700">Live Chat • Real-time</span>
        </div>
        
        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50/80 space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="animate-spin text-[#6c63ff] mx-auto mb-2" size={28} />
                <p className="text-gray-400 text-sm">Loading messages...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageSquare size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-400 font-medium">No messages yet</p>
                <p className="text-gray-300 text-sm mt-1">Be the first to say something!</p>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isMe = msg.senderId?._id === user._id || msg.senderId === user._id;
              return (
                <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group w-full`}>
                  <span className="text-[11px] text-gray-400 mb-1 mx-2 font-medium">{msg.senderId?.name || 'User'}</span>
                  <div className="relative max-w-[90%] sm:max-w-[85%]">
                    <div className={`px-4 py-2.5 rounded-2xl shadow-sm ${
                      isMe 
                        ? 'bg-gradient-to-r from-[#6c63ff] to-[#8b5cf6] text-white rounded-br-md' 
                        : 'bg-white text-gray-800 border border-gray-100 rounded-bl-md'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                    </div>
                    {/* Delete button */}
                    {canDelete(msg) && msg._id && (
                      <button
                        onClick={() => handleDeleteMessage(msg._id)}
                        className={`absolute top-1 ${isMe ? '-left-8' : '-right-8'} p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600`}
                        title="Delete message"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-300 mt-1 mx-2">{formatTime(msg.createdAt)}</span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 flex gap-3 flex-shrink-0">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#6c63ff] focus:ring-2 focus:ring-[#6c63ff]/20 bg-gray-50 text-sm transition-all"
            autoFocus
          />
          <button 
            type="submit" 
            disabled={!newMessage.trim()}
            className="px-5 py-3 bg-gradient-to-r from-[#6c63ff] to-[#8b5cf6] text-white rounded-xl hover:shadow-lg hover:shadow-[#6c63ff]/30 disabled:opacity-40 transition-all duration-300 flex items-center gap-2 font-semibold text-sm"
          >
            <Send size={16} />
          </button>
        </form>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default SlidingChatPanel;
