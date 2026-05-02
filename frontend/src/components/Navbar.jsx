import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Home, Bell, MessageSquare, Megaphone, Crown, Users, Clock, ChevronRight, Shield, Trash2, Settings } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import SlidingChatPanel from './SlidingChatPanel';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Navbar = () => {
  const { user, logout, getAuthHeaders } = useContext(AuthContext);
  const navigate = useNavigate();

  const [showNotifs, setShowNotifs] = useState(false);
  const [showChats, setShowChats] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [chatSummary, setChatSummary] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const [loadingChats, setLoadingChats] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [chatCount, setChatCount] = useState(0);
  const [activeChatClub, setActiveChatClub] = useState(null);

  const notifsRef = useRef(null);
  const chatsRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifsRef.current && !notifsRef.current.contains(e.target)) setShowNotifs(false);
      if (chatsRef.current && !chatsRef.current.contains(e.target)) setShowChats(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch initial counts on login
  useEffect(() => {
    if (user) {
      fetchInitialCounts();
    }
  }, [user]);

  const fetchInitialCounts = async () => {
    try {
      const [announcementsRes, chatRes] = await Promise.all([
        axios.get(`${API}/api/announcements/user/all`, { headers: getAuthHeaders() }),
        axios.get(`${API}/api/chat/user/summary`, { headers: getAuthHeaders() })
      ]);
      setNotifCount(announcementsRes.data.length);
      const total = chatRes.data.reduce((sum, c) => sum + c.totalMessages, 0);
      setChatCount(total);
      setChatSummary(chatRes.data);
    } catch (err) {
      console.error('Failed to fetch counts', err);
    }
  };

  // Fetch announcements & CLEAR count when bell is opened
  const toggleNotifs = async () => {
    setShowChats(false);
    const opening = !showNotifs;
    setShowNotifs(opening);
    if (opening && user) {
      setNotifCount(0); // Clear badge
      setLoadingNotifs(true);
      try {
        const { data } = await axios.get(`${API}/api/announcements/user/all`, { headers: getAuthHeaders() });
        setAnnouncements(data);
      } catch (err) {
        console.error('Failed to fetch announcements', err);
      }
      setLoadingNotifs(false);
    }
  };

  // Fetch chats & CLEAR count when chat is opened
  const toggleChats = async () => {
    setShowNotifs(false);
    const opening = !showChats;
    setShowChats(opening);
    if (opening && user) {
      setChatCount(0); // Clear badge
      setLoadingChats(true);
      try {
        const { data } = await axios.get(`${API}/api/chat/user/summary`, { headers: getAuthHeaders() });
        setChatSummary(data);
      } catch (err) {
        console.error('Failed to fetch chat summary', err);
      }
      setLoadingChats(false);
    }
  };

  const openChat = (club) => {
    setShowChats(false);
    setActiveChatClub(club);
  };

  // Delete announcement handler
  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await axios.delete(`${API}/api/announcements/delete/${id}`, { headers: getAuthHeaders() });
      setAnnouncements(prev => prev.filter(a => a._id !== id));
      toast.success('Announcement deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const canDeleteAnnouncement = (a) => {
    if (user.role === 'admin') return true;
    if (user.role === 'club_head') return true;
    return false;
  };

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  // User's club info for navbar badges
  const getUserClubInfo = () => {
    if (!user || chatSummary.length === 0) return null;
    const headClubs = chatSummary.filter(c => c.userRole === 'Club Head');
    if (headClubs.length > 0) return { type: 'head', clubs: headClubs };
    const memberClubs = chatSummary.filter(c => c.userRole !== 'Admin');
    if (memberClubs.length > 0) return { type: 'member', clubs: memberClubs };
    return null;
  };

  const clubInfo = getUserClubInfo();

  return (
    <>
      <nav className="bg-[#2e1065] shadow-md sticky top-0 z-50 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-6">
              <Link to="/" className="flex-shrink-0 flex items-center gap-4 hover-lift">
                <img src="/images/dkte-logo.png" alt="DKTE Logo" className="h-10 w-auto bg-white rounded-lg p-1 shadow-md object-contain" />
                <span className="font-extrabold text-xl text-white tracking-tight hidden sm:block">DKTE Campus Portal</span>
              </Link>
            </div>
            
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2 text-white/90 hover:text-white font-semibold transition-colors bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm border border-white/10">
                <Home size={16} />
                Home
              </Link>
              
              {user ? (
                <div className="flex items-center gap-2">
                  
                  {/* NOTIFICATIONS BELL */}
                  <div className="relative" ref={notifsRef}>
                    <button 
                      onClick={toggleNotifs}
                      className={`relative p-2.5 rounded-xl transition-all duration-300 ${showNotifs ? 'bg-white/20 text-white' : 'text-white/80 hover:text-white hover:bg-white/10'}`}
                    >
                      <Bell size={20} />
                      {notifCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-pink-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center px-1 border-2 border-[#2e1065] animate-pulse">
                          {notifCount > 9 ? '9+' : notifCount}
                        </span>
                      )}
                    </button>

                    {showNotifs && (
                      <div className="absolute right-0 top-full mt-2 w-[380px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50" style={{ animation: 'fadeIn 0.2s ease-out' }}>
                        <div className="px-5 py-4 bg-gradient-to-r from-[#2e1065] to-[#4c1d95] flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Megaphone size={18} className="text-yellow-300" />
                            <h3 className="text-white font-bold text-sm">Announcements</h3>
                          </div>
                          <span className="text-white/70 text-xs font-medium">{announcements.length} total</span>
                        </div>
                        
                        <div className="max-h-[350px] overflow-y-auto">
                          {loadingNotifs ? (
                            <div className="p-8 text-center">
                              <div className="w-6 h-6 border-2 border-[#6c63ff] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                              <p className="text-gray-400 text-sm">Loading...</p>
                            </div>
                          ) : announcements.length === 0 ? (
                            <div className="p-8 text-center">
                              <Bell size={32} className="mx-auto text-gray-300 mb-2" />
                              <p className="text-gray-400 text-sm font-medium">No announcements yet</p>
                              <p className="text-gray-300 text-xs mt-1">Join clubs to receive announcements</p>
                            </div>
                          ) : (
                            announcements.map((a) => (
                              <div key={a._id} className="px-5 py-3.5 border-b border-gray-50 hover:bg-gray-50/80 transition-colors group relative">
                                <div className="flex items-start gap-3">
                                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                                    {a.clubId?.clubName?.substring(0, 2).toUpperCase() || '📢'}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                      <span className="text-xs font-bold text-[#2e1065]">{a.clubId?.clubName || 'Club'}</span>
                                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                        <Clock size={10} />{timeAgo(a.createdAt)}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-700 line-clamp-2 leading-snug">{a.content}</p>
                                    <p className="text-[11px] text-gray-400 mt-1">by {a.createdBy?.name || 'Admin'}</p>
                                  </div>
                                  {/* Delete button for club head / admin */}
                                  {canDeleteAnnouncement(a) && (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleDeleteAnnouncement(a._id); }}
                                      className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 flex-shrink-0"
                                      title="Delete announcement"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* CHAT MESSAGES */}
                  <div className="relative" ref={chatsRef}>
                    <button 
                      onClick={toggleChats}
                      className={`relative p-2.5 rounded-xl transition-all duration-300 ${showChats ? 'bg-white/20 text-white' : 'text-white/80 hover:text-white hover:bg-white/10'}`}
                    >
                      <MessageSquare size={20} />
                      {chatCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-green-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center px-1 border-2 border-[#2e1065]">
                          {chatCount > 99 ? '99+' : chatCount}
                        </span>
                      )}
                    </button>

                    {showChats && (
                      <div className="absolute right-0 top-full mt-2 w-[380px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50" style={{ animation: 'fadeIn 0.2s ease-out' }}>
                        <div className="px-5 py-4 bg-gradient-to-r from-[#065f46] to-[#047857] flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <MessageSquare size={18} className="text-green-300" />
                            <h3 className="text-white font-bold text-sm">Club Chats</h3>
                          </div>
                          <span className="text-white/70 text-xs font-medium">{chatSummary.length} clubs</span>
                        </div>
                        
                        <div className="max-h-[400px] overflow-y-auto">
                          {loadingChats ? (
                            <div className="p-8 text-center">
                              <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                              <p className="text-gray-400 text-sm">Loading...</p>
                            </div>
                          ) : chatSummary.length === 0 ? (
                            <div className="p-8 text-center">
                              <MessageSquare size={32} className="mx-auto text-gray-300 mb-2" />
                              <p className="text-gray-400 text-sm font-medium">No club chats</p>
                              <p className="text-gray-300 text-xs mt-1">Join clubs to access chat rooms</p>
                            </div>
                          ) : (
                            chatSummary.map((club) => (
                              <div 
                                key={club.clubId} 
                                className="px-5 py-3.5 border-b border-gray-50 hover:bg-emerald-50/50 transition-colors cursor-pointer group"
                                onClick={() => openChat(club)}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                    {club.clubName?.substring(0, 2).toUpperCase()}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-0.5">
                                      <span className="text-sm font-bold text-gray-900">{club.clubName}</span>
                                      <ChevronRight size={14} className="text-gray-300 group-hover:text-emerald-500 transition-colors" />
                                    </div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                        club.userRole === 'Club Head' 
                                          ? 'bg-amber-100 text-amber-700' 
                                          : club.userRole === 'Admin'
                                          ? 'bg-purple-100 text-purple-700'
                                          : 'bg-blue-100 text-blue-700'
                                      }`}>
                                        {club.userRole === 'Club Head' && <Crown size={10} />}
                                        {club.userRole === 'Member' && <Users size={10} />}
                                        {club.userRole === 'Admin' && <Shield size={10} />}
                                        {club.userRole}
                                      </span>
                                      <span className="text-[10px] text-gray-400 font-medium">{club.totalMessages} msgs</span>
                                    </div>
                                    {club.latestMessage ? (
                                      <p className="text-xs text-gray-500 truncate">
                                        <span className="font-semibold text-gray-600">{club.latestMessage.sender}:</span> {club.latestMessage.content}
                                      </p>
                                    ) : (
                                      <p className="text-xs text-gray-400 italic">No messages yet — tap to start</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* User Info + Club Tags */}
                  <div className="flex items-center gap-2 ml-1">
                    <div className="flex items-center gap-2 text-sm text-[#2e1065] bg-white px-3 py-1.5 rounded-full shadow-sm">
                      <span className="font-bold max-w-[120px] truncate">{user?.name || 'User'}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-[#2e1065] px-2 py-0.5 rounded-full">
                        {user?.role.replace('_', ' ')}
                      </span>
                    </div>

                    {clubInfo && (
                      <div className="hidden lg:flex items-center gap-1">
                        {clubInfo.clubs.slice(0, 2).map((c) => (
                          <span 
                            key={c.clubId} 
                            className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-full whitespace-nowrap ${
                              c.userRole === 'Club Head'
                                ? 'bg-amber-400/30 text-amber-200 border border-amber-400/40'
                                : 'bg-blue-400/30 text-blue-200 border border-blue-400/40'
                            }`}
                          >
                            {c.userRole === 'Club Head' ? <Crown size={9} /> : <Users size={9} />}
                            {c.clubName}
                          </span>
                        ))}
                        {clubInfo.clubs.length > 2 && (
                          <span className="text-[9px] text-white/50 font-medium">+{clubInfo.clubs.length - 2}</span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Settings */}
                  <button
                    onClick={() => navigate('/settings')}
                    className="p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 transition-all duration-300 rounded-full"
                    title="Settings"
                  >
                    <Settings size={18} />
                  </button>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="p-2 text-white/80 hover:text-white bg-white/10 hover:bg-red-500/30 transition-all duration-300 rounded-full"
                    title="Logout"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </nav>

      {activeChatClub && (
        <SlidingChatPanel
          clubId={activeChatClub.clubId}
          clubName={activeChatClub.clubName}
          userRole={activeChatClub.userRole}
          onClose={() => setActiveChatClub(null)}
        />
      )}
    </>
  );
};

export default Navbar;
