import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Calendar, Users, Award, Shield, ArrowRight, BookOpen, Clock, Heart, X } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const [clubs, setClubs] = useState([]);
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClub, setSelectedClub] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { login, register } = React.useContext(AuthContext);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'

  const formatImageUrl = (url) => {
    if (!url) return null;
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    if (url.includes('/uploads/')) {
      const filename = url.split('/uploads/')[1];
      return `${API_URL}/uploads/${filename}`;
    }
    return url;
  };
  
  const [authForm, setAuthForm] = useState({
    name: '', email: '', password: '', prn: '', department: '', year: '1'
  });
  const [authError, setAuthError] = useState('');

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (authMode === 'login') {
      const res = await login(authForm.email, authForm.password);
      if (!res.success) setAuthError(res.message);
    } else {
      const res = await register(
        authForm.name, authForm.email, authForm.password, 'student',
        authForm.prn, authForm.department, Number(authForm.year)
      );
      if (!res.success) setAuthError(res.message);
    }
  };

  useEffect(() => {
    // Fetch public data
    const fetchPublicData = async () => {
      try {
        const [clubsRes, eventsRes] = await Promise.all([
          axios.get((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/clubs'),
          axios.get((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/events')
        ]);
        setClubs(clubsRes.data);
        // Only show upcoming events
        const upcomingEvents = eventsRes.data.filter(e => new Date(e.date) > new Date());
        setEvents(upcomingEvents.slice(0, 3)); // Top 3 events
      } catch (error) {
        console.error("Error fetching public data:", error);
      }
    };
    fetchPublicData();
  }, []);

  const handleActionClick = () => {
    navigate('/login');
  };

  const filteredClubs = clubs.filter(c => c.clubName.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-brand-primary selection:text-white overflow-x-hidden">
      
      {/* Top spacing for fixed navbar if any, though we are flex-col in App.jsx */}

      {/* Running Marquee Text */}
      <div className="bg-[#facc15] text-gray-900 py-3 overflow-hidden flex items-center whitespace-nowrap relative z-40 shadow-md font-bold">
        <motion.div 
          animate={{ x: [0, -1000] }} 
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          className="flex gap-16 items-center font-medium text-sm tracking-wide"
        >
          <span>• Explore over 50+ active student clubs</span>
          <span>• Register for upcoming hackathons and cultural fests</span>
          <span>• Participate in hands-on workshops</span>
          <span>• Build your university legacy</span>
          <span>• Explore over 50+ active student clubs</span>
          <span>• Register for upcoming hackathons and cultural fests</span>
          <span>• Participate in hands-on workshops</span>
          <span>• Build your university legacy</span>
        </motion.div>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col justify-center bg-gray-900">
        {/* Main Photo Background - Full cover, no crop */}
        <div className="absolute inset-0 z-0">
          <img src="/images/dkte-campus-night.jpg" alt="DKTE Campus" className="w-full h-full object-cover object-center" />
          {/* Overlay to ensure text readability since it's centered now */}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        
        {/* Content centered */}
        <div className="relative z-10 w-full px-6 py-12">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            
            {/* Left side: Text */}
            <div>
              <span className="inline-block py-1.5 px-4 rounded-full bg-white/15 text-white font-bold text-xs tracking-wide mb-4 backdrop-blur-md border border-white/20 shadow-lg">
                ✨ Welcome to the Official Campus Portal
              </span>
              <h1 className="text-3xl md:text-5xl font-editorial font-extrabold text-white tracking-tight leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                Discover Your Passion.<br />
                <span className="text-[#facc15] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  Shape Campus Culture.
                </span>
              </h1>
            </div>

            {/* Right side: Glassmorphism Auth Box */}
            <div className="w-full md:w-auto min-w-[300px] md:min-w-[370px]">
              <div className="bg-white/10 backdrop-blur-xl shadow-2xl rounded-2xl p-6 border border-white/20 min-h-[380px] flex flex-col transition-all duration-500 hover:bg-white/15 hover:shadow-[0_8px_40px_rgba(108,99,255,0.25)] hover:border-white/30 group">
                <div className="flex gap-6 border-b border-white/20 mb-5 pb-3">
                  <button onClick={() => {setAuthMode('login'); setAuthError('');}} className={`text-sm font-bold transition-all duration-300 pb-1 ${authMode === 'login' ? 'text-[#facc15] border-b-2 border-[#facc15] scale-105' : 'text-white/60 hover:text-white/90'}`}>
                    Student Login
                  </button>
                  <button onClick={() => {setAuthMode('register'); setAuthError('');}} className={`text-sm font-bold transition-all duration-300 pb-1 ${authMode === 'register' ? 'text-[#facc15] border-b-2 border-[#facc15] scale-105' : 'text-white/60 hover:text-white/90'}`}>
                    Register
                  </button>
                </div>
                
                {authError && <div className="bg-red-500/20 backdrop-blur-sm text-red-200 text-xs p-2.5 rounded-lg mb-3 font-medium border border-red-400/30">{authError}</div>}
                
                <form onSubmit={handleAuthSubmit} className="flex flex-col gap-3 flex-1">
                  {authMode === 'register' && (
                    <input type="text" placeholder="Full Name" required value={authForm.name} onChange={e => setAuthForm({...authForm, name: e.target.value})} className="w-full py-2.5 px-4 text-sm bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl outline-none focus:border-[#facc15] focus:bg-white/15 focus:shadow-[0_0_15px_rgba(250,204,21,0.15)] text-white placeholder-white/50 transition-all duration-300" />
                  )}
                  <input type="email" placeholder="Email Address" required value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} className="w-full py-2.5 px-4 text-sm bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl outline-none focus:border-[#facc15] focus:bg-white/15 focus:shadow-[0_0_15px_rgba(250,204,21,0.15)] text-white placeholder-white/50 transition-all duration-300" />
                  <input type="password" placeholder="Password" required value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} className="w-full py-2.5 px-4 text-sm bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl outline-none focus:border-[#facc15] focus:bg-white/15 focus:shadow-[0_0_15px_rgba(250,204,21,0.15)] text-white placeholder-white/50 transition-all duration-300" />
                  
                  {authMode === 'register' && (
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" placeholder="PRN" required value={authForm.prn} onChange={e => setAuthForm({...authForm, prn: e.target.value})} className="w-full py-2.5 px-4 text-sm bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl outline-none focus:border-[#facc15] focus:bg-white/15 text-white placeholder-white/50 transition-all duration-300" />
                      <input type="text" placeholder="Dept" required value={authForm.department} onChange={e => setAuthForm({...authForm, department: e.target.value})} className="w-full py-2.5 px-4 text-sm bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl outline-none focus:border-[#facc15] focus:bg-white/15 text-white placeholder-white/50 transition-all duration-300" />
                    </div>
                  )}
                  
                  <button type="submit" className="w-full py-3 bg-gradient-to-r from-[#facc15] to-[#f59e0b] text-[#2e1065] font-extrabold text-sm rounded-xl hover:shadow-[0_4px_25px_rgba(250,204,21,0.4)] hover:scale-[1.02] active:scale-95 transition-all duration-300 mt-auto">
                    {authMode === 'login' ? '🚀 Sign In' : '✨ Create Account'}
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Live Campus Feed - Upcoming Events */}
      <section className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-editorial font-bold text-gray-900 mb-4">Live Campus Feed</h2>
              <p className="text-gray-500 text-lg">Upcoming events you don't want to miss.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {events.length === 0 ? (
              <div className="col-span-3 text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium text-lg">No public events scheduled right now.</p>
              </div>
            ) : (
              events.map((event, index) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                    key={event._id} 
                    className="bg-blue-50 rounded-[2.5rem] border border-blue-100 shadow-xl shadow-blue-900/5 overflow-hidden hover:-translate-y-4 hover:shadow-[0_30px_60px_rgba(29,78,216,0.3)] hover:border-blue-300 transition-all duration-500 flex flex-col group"
                  >
                  <div className="h-48 bg-gray-100 flex items-center justify-center p-0 relative flex-shrink-0 overflow-hidden">
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-bold text-[#2e1065] shadow-md z-10">
                      {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    {event.imageUrl ? (
                      <img src={formatImageUrl(event.imageUrl)} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <BookOpen size={64} className="text-gray-300" />
                    )}
                  </div>
                  <div className="p-8 flex flex-col flex-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-brand-secondary uppercase tracking-wider mb-3">
                      <MapPin size={14} /> Main Campus
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 line-clamp-1">{event.title}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2 flex-1">{event.description}</p>
                    <div className="flex gap-3 mt-auto">
                      <button 
                        onClick={() => setSelectedEvent(event)}
                        className="flex-1 py-3 bg-white text-[#2e1065] font-bold rounded-xl border-2 border-[#2e1065] hover:bg-[#2e1065] hover:text-white transition-all flex items-center justify-center gap-2"
                      >
                        See Details
                      </button>
                      <button 
                        onClick={handleActionClick}
                        className="flex-1 py-3 bg-gray-50 text-brand-dark font-bold rounded-xl border border-gray-200 hover:border-brand-primary hover:bg-brand-primary hover:text-white transition-all flex items-center justify-center gap-2"
                      >
                        Participate <ArrowRight size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Active Clubs Showcase */}
      <section id="clubs-section" className="py-24 bg-gray-900 text-white relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-editorial font-bold mb-4">Active Student Clubs</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">Find your tribe. From robotics and coding to drama and environmental activism.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredClubs.length === 0 ? (
              <div className="col-span-4 text-center py-12">
                <Users size={48} className="mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400 text-lg">No clubs found.</p>
              </div>
            ) : (
              filteredClubs.map((club) => (
                <div 
                  key={club._id} 
                  className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-2xl p-6 hover:bg-gray-700/60 transition-all duration-300 group cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-primary/20 hover:border-brand-primary/50"
                  onClick={handleActionClick}
                >
                  <div className="w-16 h-16 rounded-2xl bg-gray-700 flex items-center justify-center text-2xl font-bold mb-4 group-hover:bg-brand-primary transition-colors text-white">
                    {club.logoUrl && club.logoUrl.trim() !== '' ? (
                      <img src={formatImageUrl(club.logoUrl)} alt={club.clubName} className="w-full h-full object-cover rounded-2xl" />
                    ) : (
                      club.clubName.substring(0, 2).toUpperCase()
                    )}
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white">{club.clubName}</h3>
                  <p className="text-gray-400 text-sm line-clamp-2 mb-3">{club.description || 'No description available'}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedClub(club); }}
                      className="text-xs font-medium text-[#facc15] hover:text-white transition-colors inline-flex items-center gap-1 border border-[#facc15]/30 bg-[#facc15]/10 px-3 py-1.5 rounded-lg hover:bg-[#facc15]/30"
                    >
                      See Details <ArrowRight size={12} />
                    </button>
                    <div className="flex items-center text-xs font-bold text-brand-primary group-hover:text-white transition-colors">
                      Join Club <ArrowRight size={14} className="ml-1" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* All clubs are now shown above */}
        </div>
      </section>

      {/* Campus Statistics & Gallery */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Masonry-style Grid (Mock images using colored blocks for now) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="h-48 bg-brand-primary/10 rounded-3xl flex items-center justify-center">
                   <Users size={48} className="text-brand-primary opacity-50" />
                </div>
                <div className="h-64 bg-brand-secondary/10 rounded-3xl flex items-center justify-center">
                   <Award size={48} className="text-brand-secondary opacity-50" />
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="h-64 bg-amber-500/10 rounded-3xl flex items-center justify-center">
                   <Clock size={48} className="text-amber-500 opacity-50" />
                </div>
                <div className="h-48 bg-green-500/10 rounded-3xl flex items-center justify-center">
                   <Heart size={48} className="text-green-500 opacity-50" />
                </div>
              </div>
            </div>

            {/* Stats */}
            <div>
              <h2 className="text-4xl font-editorial font-bold text-gray-900 mb-6">A Thriving Community</h2>
              <p className="text-gray-600 text-lg mb-10 leading-relaxed">
                Our platform is designed to streamline campus activities, making it easier than ever for students to discover their passions and for organizations to manage their operations seamlessly.
              </p>
              
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <div className="text-5xl font-extrabold text-brand-primary mb-2">50+</div>
                  <div className="text-gray-500 font-medium">Active Clubs & Societies</div>
                </div>
                <div>
                  <div className="text-5xl font-extrabold text-brand-secondary mb-2">200+</div>
                  <div className="text-gray-500 font-medium">Events Hosted Annually</div>
                </div>
                <div>
                  <div className="text-5xl font-extrabold text-amber-500 mb-2">5k+</div>
                  <div className="text-gray-500 font-medium">Engaged Students</div>
                </div>
                <div>
                  <div className="text-5xl font-extrabold text-green-500 mb-2">100%</div>
                  <div className="text-gray-500 font-medium">Paperless Management</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Event Details Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEvent(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl z-10 flex flex-col"
            >
              <button 
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 p-2 bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 rounded-full transition-colors z-20"
              >
                <X size={20} />
              </button>
              
              {/* Event Image */}
              <div className="h-56 bg-gray-100 flex-shrink-0 relative overflow-hidden">
                {selectedEvent.imageUrl ? (
                  <img src={formatImageUrl(selectedEvent.imageUrl)} alt={selectedEvent.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#2e1065] to-[#4c1d95]">
                    <BookOpen size={64} className="text-white/30" />
                  </div>
                )}
                <div className="absolute bottom-4 left-6 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-bold text-[#2e1065] shadow-lg">
                  <Calendar size={14} className="inline mr-2" />
                  {new Date(selectedEvent.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>
              
              {/* Event Content */}
              <div className="p-8 flex flex-col flex-1 overflow-y-auto">
                <div className="flex items-center gap-2 text-xs font-bold text-brand-secondary uppercase tracking-wider mb-3">
                  <MapPin size={14} /> Main Campus
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">{selectedEvent.title}</h2>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <BookOpen size={18} className="text-brand-primary" /> Event Description
                  </h3>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {selectedEvent.description || 'No description available for this event.'}
                  </p>
                </div>

                {selectedEvent.clubId && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
                    <Users size={18} className="text-brand-primary" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Organized by</p>
                      <p className="text-sm font-bold text-gray-900">{selectedEvent.clubId.clubName || 'Student Club'}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="px-8 py-6 border-t border-gray-100 flex justify-end shrink-0">
                <button 
                  onClick={() => { setSelectedEvent(null); handleActionClick(); }}
                  className="px-6 py-3 bg-gradient-to-r from-[#2e1065] to-[#4c1d95] text-white font-bold rounded-xl hover:shadow-lg hover:shadow-[#2e1065]/30 transition-all flex items-center gap-2"
                >
                  Log in to Participate <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Club Details Modal */}
      <AnimatePresence>
        {selectedClub && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setSelectedClub(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-gray-900 border border-gray-700 rounded-3xl p-8 max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl z-10 flex flex-col"
            >
              <button 
                onClick={() => setSelectedClub(null)}
                className="absolute top-6 right-6 p-2 bg-gray-800 text-gray-400 hover:text-white rounded-full transition-colors z-20"
              >
                <X size={20} />
              </button>
              
              <div className="flex items-center gap-6 mb-8 border-b border-gray-800 pb-6 shrink-0 mt-2">
                <div className="w-24 h-24 rounded-2xl bg-gray-800 flex items-center justify-center text-3xl font-bold flex-shrink-0 overflow-hidden text-white border border-gray-700 shadow-inner">
                  {selectedClub.logoUrl && selectedClub.logoUrl.trim() !== '' ? (
                    <img src={selectedClub.logoUrl} alt={selectedClub.clubName} className="w-full h-full object-cover" />
                  ) : (
                    selectedClub.clubName.substring(0, 2).toUpperCase()
                  )}
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">{selectedClub.clubName}</h2>
                  <div className="flex items-center gap-2 text-brand-primary text-sm font-medium">
                    <Users size={16} /> Student Club
                  </div>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-4 space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <BookOpen size={18} className="text-brand-primary" /> About Us
                </h3>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {selectedClub.description || 'No description available for this club.'}
                </p>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-800 flex justify-end shrink-0">
                <button 
                  onClick={() => { setSelectedClub(null); handleActionClick(); }}
                  className="px-6 py-3 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-secondary transition-colors shadow-lg shadow-brand-primary/20 flex items-center gap-2"
                >
                  Log in to Join <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-[#2e1065] py-12 text-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src="/images/dkte-logo.png" alt="DKTE Logo" className="h-10 w-auto object-contain bg-white rounded-lg p-1" />
            <span className="text-xl font-editorial font-bold text-white tracking-wide">DKTE's Textile and Engineering Institute</span>
          </div>
          <p className="text-white/60 text-sm">© {new Date().getFullYear()} DKTE Student Portal. Designed for modern campus ecosystems.</p>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
