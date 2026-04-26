import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, Calendar, Users, Award, Shield, ArrowRight, BookOpen, Clock, Heart } from 'lucide-react';
import axios from 'axios';

const LandingPage = () => {
  const navigate = useNavigate();
  const [clubs, setClubs] = useState([]);
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

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
      
      {/* Official College Header */}
      <div className="bg-brand-dark text-white py-4 px-4 md:px-6 shadow-md z-50 relative">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
            <img src="/images/dkte-logo.png" alt="DKTE Logo" className="h-12 md:h-16 w-auto object-contain bg-white rounded-lg p-1.5 shadow-md flex-shrink-0" />
            <div>
              <h1 className="text-base md:text-xl font-editorial font-bold tracking-wide leading-snug">
                Dattajirao Kadam Education Society's Textile and Engineering Institute
              </h1>
              <p className="text-[10px] md:text-xs text-gray-300 font-bold tracking-wider uppercase mt-1">NBA and NAAC with A+ Grade</p>
            </div>
          </div>
          <div className="flex gap-3 w-full lg:w-auto justify-center">
            <button onClick={() => navigate('/login')} className="px-5 py-2 text-sm font-bold bg-white/10 hover:bg-white/20 transition-colors rounded-lg backdrop-blur-md">
              Student Login
            </button>
            <button onClick={() => navigate('/register')} className="px-5 py-2 text-sm font-bold bg-white text-brand-dark hover:bg-gray-100 transition-colors rounded-lg shadow-sm">
              Register
            </button>
          </div>
        </div>
      </div>

      {/* Running Marquee Text */}
      <div className="bg-[#facc15] text-gray-900 py-2 overflow-hidden flex whitespace-nowrap relative z-40 shadow-md font-bold">
        <motion.div 
          animate={{ x: [0, -1000] }} 
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          className="flex gap-16 font-medium text-sm tracking-wide"
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
      <section className="relative h-[70vh] flex flex-col justify-end bg-gray-900">
        {/* Main Photo Background - 100% Original, No Editing/Overlays */}
        <div className="absolute inset-0 z-0">
          <img src="/images/dkte-photo-rotated.jpg" alt="DKTE Campus" className="w-full h-full object-cover object-center" />
        </div>
        
        {/* Content at the bottom */}
        <div className="relative z-10 w-full bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-32 pb-8 px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-end justify-between gap-6">
            
            {/* Left side: Smaller text */}
            <div>
              <span className="inline-block py-1 px-3 rounded-md bg-white/20 text-white font-bold text-xs tracking-wide mb-3 backdrop-blur-sm shadow-sm">
                Welcome to the Official Campus Portal
              </span>
              <h1 className="text-3xl md:text-4xl font-editorial font-extrabold text-white tracking-tight leading-tight drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                Discover Your Passion.<br />
                <span className="text-[#facc15] drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                  Shape Campus Culture.
                </span>
              </h1>
            </div>

            {/* Right side: Smaller Search Bar */}
            <div className="w-full md:w-auto min-w-[300px] md:min-w-[400px]">
              <div className="bg-white/95 backdrop-blur-sm shadow-lg rounded-xl p-1.5 flex items-center border border-white/50">
                <Search className="text-gray-400 ml-3 mr-2 flex-shrink-0" size={18} />
                <input 
                  type="text" 
                  placeholder="Search clubs..." 
                  className="w-full py-2 px-2 text-sm outline-none text-gray-800 bg-transparent placeholder-gray-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button 
                  onClick={() => document.getElementById('clubs-section').scrollIntoView({ behavior: 'smooth' })}
                  className="px-5 py-2 bg-[#2e1065] text-white font-bold text-sm rounded-lg hover:bg-opacity-90 transition-colors whitespace-nowrap shadow-sm"
                >
                  Explore
                </button>
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
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  key={event._id} 
                  className="bg-white rounded-3xl border border-gray-100 shadow-lg shadow-gray-100/50 overflow-hidden hover:-translate-y-2 transition-transform duration-300 flex flex-col"
                >
                  <div className="h-48 bg-gray-100 flex items-center justify-center p-0 relative flex-shrink-0 overflow-hidden">
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-bold text-[#2e1065] shadow-md z-10">
                      {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    {event.imageUrl ? (
                      <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <BookOpen size={64} className="text-gray-300" />
                    )}
                  </div>
                  <div className="p-8 flex flex-col flex-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-brand-secondary uppercase tracking-wider mb-3">
                      <MapPin size={14} /> Main Campus
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 line-clamp-1">{event.title}</h3>
                    <p className="text-gray-600 text-sm mb-6 line-clamp-2 flex-1">{event.description}</p>
                    <button 
                      onClick={handleActionClick}
                      className="w-full py-3 bg-gray-50 text-brand-dark font-bold rounded-xl border border-gray-200 hover:border-brand-primary hover:bg-brand-primary hover:text-white transition-all flex items-center justify-center gap-2 mt-auto"
                    >
                      Participate <ArrowRight size={18} />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Active Clubs Showcase */}
      <section id="clubs-section" className="py-24 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-editorial font-bold mb-4">Active Student Clubs</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">Find your tribe. From robotics and coding to drama and environmental activism.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredClubs.slice(0, 8).map((club, index) => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                key={club._id} 
                className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-2xl p-6 hover:bg-gray-800 transition-colors group cursor-pointer"
                onClick={handleActionClick}
              >
                <div className="w-16 h-16 rounded-2xl bg-gray-700 flex items-center justify-center text-2xl font-bold mb-4 group-hover:bg-brand-primary transition-colors">
                  {club.logoUrl ? (
                    <img src={club.logoUrl} alt={club.clubName} className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    club.clubName.substring(0, 2).toUpperCase()
                  )}
                </div>
                <h3 className="text-xl font-bold mb-2">{club.clubName}</h3>
                <p className="text-gray-400 text-sm line-clamp-2 mb-4">{club.description}</p>
                <div className="flex items-center text-xs font-bold text-brand-primary group-hover:text-white transition-colors mt-auto">
                  Join Club <ArrowRight size={14} className="ml-1" />
                </div>
              </motion.div>
            ))}
          </div>
          
          {filteredClubs.length > 8 && (
            <div className="text-center mt-12">
              <button onClick={handleActionClick} className="px-8 py-4 bg-transparent border border-gray-600 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors">
                View All {clubs.length} Clubs
              </button>
            </div>
          )}
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
