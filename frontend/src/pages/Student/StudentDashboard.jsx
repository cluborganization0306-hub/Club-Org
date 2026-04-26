import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Compass, Calendar as CalendarIcon, UserCheck, ChevronRight, Trophy, Star, List, CalendarDays, Ghost } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS,
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const StudentDashboard = () => {
  const { user, getAuthHeaders } = useContext(AuthContext);
  const [clubs, setClubs] = useState([]);
  const [events, setEvents] = useState([]);
  const [myMemberships, setMyMemberships] = useState([]);
  const [recommendedClubs, setRecommendedClubs] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const headers = getAuthHeaders();
      const [clubsRes, eventsRes, membershipsRes, recRes] = await Promise.all([
        axios.get((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/clubs', { headers }),
        axios.get((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/events', { headers }),
        axios.get((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/members/my-memberships', { headers }),
        axios.get((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/recommendations', { headers }).catch(() => ({ data: [] }))
      ]);
      setClubs(clubsRes.data);
      setEvents(eventsRes.data);
      setMyMemberships(membershipsRes.data);
      setRecommendedClubs(recRes.data);
    } catch (error) {
      console.error("Error fetching data", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinEvent = async (eventId) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/events/${eventId}/participate`, {}, { headers: getAuthHeaders() });
      toast.success("Successfully joined the event!", { icon: '🎉' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to join event");
    }
  };

  const handleJoinClub = async (clubId) => {
    try {
      await axios.post((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/members', { clubId }, { headers: getAuthHeaders() });
      toast.success("Successfully requested to join the club! Pending approval.", { icon: '🙌' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to join club");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 pb-12"
    >
      {/* Welcome Banner */}
      <header className="mb-8 p-10 bg-gradient-to-r from-pink-50 via-white to-indigo-50 rounded-3xl relative overflow-hidden shadow-sm border border-white">
        {/* Decorators */}
        <div className="absolute top-8 left-12 text-indigo-400 opacity-60">✦</div>
        <div className="absolute bottom-10 left-1/3 text-pink-400 opacity-60">✦</div>
        <div className="absolute top-12 right-1/4 w-3 h-3 rounded-full border-2 border-cyan-400"></div>
        <div className="absolute bottom-1/4 right-12 w-2 h-2 rounded-full bg-pink-300"></div>
        <div className="absolute top-10 right-10 grid grid-cols-4 gap-2 opacity-20">
          {[...Array(12)].map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-600"></div>)}
        </div>
        
        {/* Abstract Illustration Elements replacing people */}
        <div className="absolute right-0 bottom-0 w-1/2 h-full opacity-30 pointer-events-none overflow-hidden">
           <div className="absolute right-10 -bottom-10 w-64 h-64 bg-brand-primary rounded-full mix-blend-multiply filter blur-3xl"></div>
           <div className="absolute right-40 top-0 w-48 h-48 bg-brand-secondary rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-2xl pt-4">
          <h1 className="text-4xl font-editorial font-extrabold text-gray-900 tracking-tight mb-4">
            Welcome, <span className="text-brand-secondary">{user?.name || 'student'}</span>!
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            Discover clubs and participate in exciting <br/> upcoming events.
          </p>
          <div className="mt-6 flex gap-2">
             <svg width="60" height="20" viewBox="0 0 60 20" className="text-brand-primary opacity-50">
                <path d="M0,10 Q5,0 10,10 T20,10 T30,10 T40,10 T50,10 T60,10" fill="none" stroke="currentColor" strokeWidth="2" />
             </svg>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Events Section */}
        <div className="mockup-card">
          <div className="px-6 py-6 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-brand-primary text-white rounded-xl shadow-sm">
                <CalendarIcon size={24} />
              </div>
              <h3 className="text-xl font-extrabold text-gray-900">
                Upcoming Events
              </h3>
            </div>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button 
                onClick={() => setViewMode('list')} 
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-brand-primary' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <List size={18} />
              </button>
              <button 
                onClick={() => setViewMode('calendar')} 
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'calendar' ? 'bg-white shadow-sm text-brand-primary' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <CalendarDays size={18} />
              </button>
            </div>
          </div>
          
          <AnimatePresence mode="wait">
            {viewMode === 'list' ? (
              <motion.div 
                key="list"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0 }}
                className="py-4"
              >
                {isLoading ? (
                  <div className="p-6 space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="animate-pulse flex gap-4 items-center bg-gray-50 p-4 rounded-xl">
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : events.length === 0 ? (
                  <div className="p-12 flex flex-col items-center justify-center text-center">
                    <Ghost size={48} className="text-brand-primary opacity-20 mb-4" />
                    <p className="text-gray-500 font-medium">It's awfully quiet in here...</p>
                    <p className="text-sm text-gray-400 mt-1">No upcoming events found. Check back later!</p>
                  </div>
                ) : (
                  events.map(event => {
                    const isParticipating = event.participants.includes(user?._id);
                    return (
                      <motion.div variants={itemVariants} key={event._id} className="mx-6 mb-4 p-5 bg-brand-primary/5 rounded-2xl transition-all duration-200 hover:bg-brand-primary/10 border border-transparent hover:border-brand-primary/20">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 flex-shrink-0 bg-brand-primary text-white rounded-full flex items-center justify-center shadow-md">
                              <Trophy size={24} />
                            </div>
                            <div>
                              <h4 className="text-lg font-bold text-gray-900">{event.title}</h4>
                              <p className="text-sm font-semibold text-brand-primary mt-0.5 flex items-center gap-1.5">
                                <CalendarIcon size={14} /> {new Date(event.date).toLocaleString()}
                              </p>
                              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                <UserCheck size={12} /> {event.participants.length}
                              </p>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            {isParticipating ? (
                              <span className="px-5 py-2.5 bg-white text-brand-secondary rounded-xl text-sm font-bold border border-brand-secondary/20 shadow-sm flex items-center gap-2">
                                <UserCheck size={16} /> Joined
                              </span>
                            ) : (
                              <button 
                                onClick={() => handleJoinEvent(event._id)}
                                className="mockup-btn px-6 py-2.5 text-sm"
                              >
                                Participate
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="calendar"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-6 h-[500px]"
              >
                <Calendar
                  localizer={localizer}
                  events={events.map(e => ({
                    id: e._id,
                    title: e.title,
                    start: new Date(e.date),
                    end: e.endDate ? new Date(e.endDate) : new Date(new Date(e.date).getTime() + 2 * 60 * 60 * 1000),
                    resource: e
                  }))}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: '100%', fontFamily: 'Inter' }}
                  views={['month', 'week', 'day']}
                  onSelectEvent={(event) => {
                    if (!event.resource.participants.includes(user?._id)) {
                      if(window.confirm(`Join ${event.title}?`)) handleJoinEvent(event.id);
                    } else {
                      toast.info(`You've already joined ${event.title}`);
                    }
                  }}
                  eventPropGetter={(event) => {
                    const isJoined = event.resource.participants.includes(user?._id);
                    return {
                      style: {
                        backgroundColor: isJoined ? '#ec4899' : '#8b5cf6',
                        borderRadius: '8px',
                        border: 'none',
                        color: 'white',
                        fontWeight: '600',
                        fontSize: '12px',
                        padding: '2px 6px'
                      }
                    };
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
          <div className="px-6 py-4 border-t border-gray-50 flex items-center justify-between text-brand-primary hover:text-brand-dark transition-colors cursor-pointer bg-gray-50/50">
             <span className="text-sm font-semibold flex items-center gap-2"><CalendarIcon size={16}/> View full schedule</span>
             <ChevronRight size={18}/>
          </div>
        </div>

        {/* Clubs Section */}
        <div className="mockup-card">
          {/* Recommendations Header */}
          {recommendedClubs.length > 0 && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-orange-100 px-6 py-4">
              <h4 className="text-sm font-bold text-orange-600 flex items-center gap-2 mb-3">
                <Star size={16} className="fill-orange-500" /> Recommended For You
              </h4>
              <div className="space-y-3">
                {recommendedClubs.map(club => (
                  <div key={club._id} className="bg-white p-3 rounded-xl shadow-sm border border-orange-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">
                        {club.clubName.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{club.clubName}</p>
                        <p className="text-xs text-gray-500">{club.pendingRequests?.length || 0} pending requests</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleJoinClub(club._id)}
                      className="px-4 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-bold hover:bg-orange-600 transition-colors shadow-sm"
                    >
                      Join
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="px-6 py-6 flex items-center gap-3">
            <div className="p-2.5 bg-brand-secondary text-white rounded-xl shadow-sm">
              <Compass size={24} />
            </div>
            <h3 className="text-xl font-extrabold text-gray-900">
              Discover Clubs
            </h3>
          </div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="pb-4"
          >
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="animate-pulse flex gap-4 items-center bg-gray-50 p-4 rounded-xl">
                    <div className="w-14 h-14 bg-gray-200 rounded-xl"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : clubs.length === 0 ? (
              <div className="p-12 flex flex-col items-center justify-center text-center">
                <Compass size={48} className="text-brand-secondary opacity-20 mb-4" />
                <p className="text-gray-500 font-medium">We're charting new territories...</p>
                <p className="text-sm text-gray-400 mt-1">No clubs are available right now. Check back later!</p>
              </div>
            ) : (
              clubs.map(club => {
                const membership = myMemberships.find(m => m.clubId?._id === club._id);
                const isMember = !!membership;
                const isPending = membership?.status === 'pending';
                
                return (
                  <motion.div variants={itemVariants} key={club._id} className="mx-6 mb-4 p-5 bg-brand-secondary/5 rounded-2xl transition-all duration-200 hover:bg-brand-secondary/10 border border-transparent hover:border-brand-secondary/20 flex justify-between items-center gap-4">
                    <div className="flex gap-4 items-center">
                      <div className="flex-shrink-0">
                        {club.logoUrl ? (
                          <img src={club.logoUrl} alt={`${club.clubName} Logo`} className="w-14 h-14 rounded-2xl object-cover shadow-sm" />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-brand-secondary/20 text-brand-secondary flex items-center justify-center font-black text-xl shadow-sm">
                            {club.clubName.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">{club.clubName}</h4>
                        <p className="text-sm text-gray-600 mt-0.5 line-clamp-1">{club.description}</p>
                        {club.clubHeadId && (
                          <p className="text-xs font-semibold text-gray-500 mt-2 bg-gray-200/50 inline-block px-2 py-0.5 rounded-md">Head: {club.clubHeadId.name}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {isMember ? (
                        isPending ? (
                          <span className="px-4 py-2 bg-white text-orange-500 font-bold rounded-xl text-sm flex items-center gap-1.5 border border-orange-100 shadow-sm">
                            <UserCheck size={16} /> Pending
                          </span>
                        ) : (
                          <span className="px-4 py-2 bg-brand-secondary/10 text-brand-secondary font-bold rounded-xl text-sm flex items-center gap-1.5 border border-brand-secondary/20 shadow-sm">
                            <UserCheck size={16} /> Member
                          </span>
                        )
                      ) : (
                        <motion.button 
                          onClick={() => handleJoinClub(club._id)}
                          className="px-6 py-2.5 bg-white border border-gray-200 text-gray-800 hover:text-brand-secondary hover:border-brand-secondary font-bold rounded-xl text-sm shadow-sm transition-all active:scale-95"
                        >
                          Join Club
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>
          <div className="px-6 py-4 border-t border-gray-50 flex items-center justify-between text-brand-secondary hover:text-brand-dark transition-colors cursor-pointer bg-gray-50/50">
             <span className="text-sm font-semibold flex items-center gap-2"><Compass size={16}/> Explore more clubs</span>
             <ChevronRight size={18}/>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StudentDashboard;
