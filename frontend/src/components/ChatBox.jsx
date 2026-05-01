import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { io } from 'socket.io-client';
import { Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const ChatBox = ({ clubId }) => {
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
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/chat/${clubId}`, { headers: getAuthHeaders() });
        setMessages(res.data);
      } catch (error) {
        toast.error('Failed to load chat history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatHistory();

    socketRef.current = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
    
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

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-indigo-500" /></div>;
  }

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="bg-indigo-50 p-4 border-b border-indigo-100 font-semibold text-indigo-900 flex justify-between items-center">
        <span>Club Chat</span>
        <span className="text-xs text-indigo-500 bg-white px-2 py-1 rounded-full border border-indigo-200">Real-time</span>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50/50 space-y-4">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">No messages yet. Start the conversation!</p>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.senderId?._id === user._id || msg.senderId === user._id;
            return (
              <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <span className="text-xs text-gray-500 mb-1 ml-1">{msg.senderId?.name || 'User'}</span>
                <div className={`px-4 py-2 rounded-2xl max-w-[80%] ${isMe ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm shadow-sm'}`}>
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-200 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-gray-50"
        />
        <button 
          type="submit" 
          disabled={!newMessage.trim()}
          className="p-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
