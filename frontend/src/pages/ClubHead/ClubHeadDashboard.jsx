import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { CalendarPlus, Users, DollarSign, BarChart3, PlusCircle, Building, CheckCircle, Check, X, Eye, QrCode, Megaphone, MessageSquare, Trash2, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import ChatBox from '../../components/ChatBox';

const ClubHeadDashboard = () => {
  const { user, getAuthHeaders } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [budget, setBudget] = useState({ amount: 0, expenses: [] });
  const [members, setMembers] = useState([]);
  
  const [newEvent, setNewEvent] = useState({ title: '', description: '', date: '', clubId: '' });
  const [eventImageFile, setEventImageFile] = useState(null);
  const [newExpense, setNewExpense] = useState({ description: '', cost: '' });
  
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState('');

  const [activeTab, setActiveTab] = useState('events'); // events, budget, performance, members, request, announcements, chat

  // Event Participants & QR Modals
  const [participantsModalOpen, setParticipantsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedQrEvent, setSelectedQrEvent] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const headers = getAuthHeaders();
      const [clubsRes, eventsRes] = await Promise.all([
        axios.get((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/clubs', { headers }),
        axios.get((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/events', { headers })
      ]);
      setClubs(clubsRes.data);
      setEvents(eventsRes.data);
      
      const myClubs = clubsRes.data.filter(c => c.clubHeadId && c.clubHeadId._id === user._id);
      if (myClubs.length > 0) {
        fetchBudget(myClubs[0]._id);
        fetchMembers(myClubs[0]._id);
        fetchAnnouncements(myClubs[0]._id);
      }
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  const fetchBudget = async (clubId) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/budgets/${clubId}`, { headers: getAuthHeaders() });
      if (res.data) setBudget(res.data);
    } catch (error) {
      console.error("Error fetching budget", error);
    }
  };

  const fetchMembers = async (clubId) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/members/${clubId}`, { headers: getAuthHeaders() });
      setMembers(res.data);
    } catch (error) {
      console.error("Error fetching members", error);
    }
  };

  const fetchAnnouncements = async (clubId) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/announcements/${clubId}`, { headers: getAuthHeaders() });
      setAnnouncements(res.data);
    } catch (error) {
      console.error("Error fetching announcements", error);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = '';
      if (eventImageFile) {
        const formData = new FormData();
        formData.append('image', eventImageFile);
        
        const uploadRes = await axios.post((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/upload', formData, {
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'multipart/form-data'
          }
        });
        imageUrl = uploadRes.data.imageUrl;
      }

      await axios.post((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/events', { ...newEvent, imageUrl }, { headers: getAuthHeaders() });
      toast.success("Event created successfully!");
      fetchData();
      setNewEvent({ title: '', description: '', date: '', clubId: newEvent.clubId });
      setEventImageFile(null);
      if (document.getElementById('eventImageInput')) {
        document.getElementById('eventImageInput').value = "";
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create event");
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    const myClubs = clubs.filter(c => c.clubHeadId && c.clubHeadId._id === user._id);
    if (myClubs.length === 0) return toast.error("You don't manage any clubs yet.");
    
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/budgets/${myClubs[0]._id}`, {
        expenseDescription: newExpense.description,
        expenseCost: Number(newExpense.cost)
      }, { headers: getAuthHeaders() });
      
      toast.success("Expense added!");
      setNewExpense({ description: '', cost: '' });
      fetchBudget(myClubs[0]._id);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add expense");
    }
  };

  const handleRequestLead = async (clubId) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/clubs/${clubId}/request`, {}, { headers: getAuthHeaders() });
      toast.success("Request sent successfully!");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send request");
    }
  };

  const handleApproveMember = async (memberId) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/members/${memberId}/approve`, {}, { headers: getAuthHeaders() });
      toast.success("Member approved!");
      const myClubs = clubs.filter(c => c.clubHeadId && c.clubHeadId._id === user._id);
      if (myClubs.length > 0) fetchMembers(myClubs[0]._id);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve member");
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/members/${memberId}/remove`, { headers: getAuthHeaders() });
      toast.success("Member removed!");
      const myClubs = clubs.filter(c => c.clubHeadId && c.clubHeadId._id === user._id);
      if (myClubs.length > 0) fetchMembers(myClubs[0]._id);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove member");
    }
  };

  const handleUpdatePosition = async (memberId, position) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/members/${memberId}/position`, { position }, { headers: getAuthHeaders() });
      toast.success("Position updated!");
      const myClubs = clubs.filter(c => c.clubHeadId && c.clubHeadId._id === user._id);
      if (myClubs.length > 0) fetchMembers(myClubs[0]._id);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update position");
    }
  };

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!newAnnouncement.trim()) return;
    const myClubs = clubs.filter(c => c.clubHeadId && c.clubHeadId._id === user._id);
    if (myClubs.length === 0) return;

    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/announcements`, {
        clubId: myClubs[0]._id,
        content: newAnnouncement
      }, { headers: getAuthHeaders() });
      toast.success("Announcement posted!");
      setNewAnnouncement('');
      fetchAnnouncements(myClubs[0]._id);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to post announcement");
    }
  };

  const handleDeleteAnnouncement = async (annId) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/announcements/delete/${annId}`, { headers: getAuthHeaders() });
      toast.success("Announcement deleted!");
      const myClubs = clubs.filter(c => c.clubHeadId && c.clubHeadId._id === user._id);
      if (myClubs.length > 0) fetchAnnouncements(myClubs[0]._id);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete announcement");
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/events/${eventId}`, { headers: getAuthHeaders() });
      toast.success('Event deleted!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete event');
    }
  };

  const myClubs = clubs.filter(c => c.clubHeadId && c.clubHeadId._id === user._id);
  const availableClubs = clubs.filter(c => !c.clubHeadId);

  // Filter events for my clubs
  const myClubIds = myClubs.map(c => c._id);
  const myEvents = events.filter(e => e.clubId && myClubIds.includes(typeof e.clubId === 'object' ? e.clubId._id : e.clubId));

  // Derived Performance Metrics
  const totalEvents = myEvents.length;
  const totalParticipants = myEvents.reduce((acc, curr) => acc + curr.participants.length, 0);
  const avgParticipants = totalEvents > 0 ? (totalParticipants / totalEvents).toFixed(1) : 0;
  const totalExpenses = budget.expenses.reduce((acc, curr) => acc + curr.cost, 0);
  const remainingBudget = budget.amount - totalExpenses;

  // Split members
  const pendingMembers = members.filter(m => m.status === 'pending');
  const approvedMembers = members.filter(m => m.status === 'approved');

  return (
    <div className="space-y-6">
      <header className="mb-8 p-10 bg-gradient-to-r from-pink-50 via-white to-indigo-50 rounded-3xl relative overflow-hidden shadow-sm border border-white">
        {/* Decorators */}
        <div className="absolute top-8 left-12 text-indigo-400 opacity-60">✦</div>
        <div className="absolute bottom-10 left-1/3 text-pink-400 opacity-60">✦</div>
        <div className="absolute top-12 right-1/4 w-3 h-3 rounded-full border-2 border-cyan-400"></div>
        <div className="absolute bottom-1/4 right-12 w-2 h-2 rounded-full bg-pink-300"></div>
        <div className="absolute top-10 right-10 grid grid-cols-4 gap-2 opacity-20">
          {[...Array(12)].map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-600"></div>)}
        </div>
        
        {/* Abstract Illustration Elements */}
        <div className="absolute right-0 bottom-0 w-1/2 h-full opacity-30 pointer-events-none overflow-hidden">
           <div className="absolute right-10 -bottom-10 w-64 h-64 bg-brand-primary rounded-full mix-blend-multiply filter blur-3xl"></div>
           <div className="absolute right-40 top-0 w-48 h-48 bg-brand-secondary rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-2xl pt-4">
          <h1 className="text-4xl font-editorial font-extrabold text-gray-900 tracking-tight mb-4">
            <span className="text-brand-accent">Club Head</span> Dashboard
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            Manage your club, events, members, and budget efficiently.
          </p>
        </div>
        {myClubs.length === 0 && (
          <div className="mt-4 bg-amber-50 text-amber-800 p-4 rounded-lg border border-amber-200">
            <strong>Notice:</strong> You have not been assigned to a club yet. Please go to the "Request Club" tab.
          </div>
        )}
      </header>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-6 overflow-x-auto whitespace-nowrap mb-6">
        {[
          { id: 'events', label: 'Event Management', icon: CalendarPlus, color: 'text-indigo-600', border: 'border-indigo-600' },
          { id: 'members', label: 'Members & Applications', icon: Users, color: 'text-pink-600', border: 'border-pink-600' },
          { id: 'budget', label: 'Budget Tracker', icon: DollarSign, color: 'text-green-600', border: 'border-green-600' },
          { id: 'announcements', label: 'Announcements', icon: Megaphone, color: 'text-blue-600', border: 'border-blue-600' },
          { id: 'performance', label: 'Performance Analysis', icon: BarChart3, color: 'text-purple-600', border: 'border-purple-600' },
          { id: 'request', label: 'Request Club', icon: Building, color: 'text-amber-600', border: 'border-amber-500' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)} 
            className={`pb-3 font-medium flex items-center gap-2 relative transition-colors ${activeTab === tab.id ? tab.color : 'text-gray-500 hover:text-gray-700'}`}
          >
            <tab.icon size={18} /> {tab.label}
            {activeTab === tab.id && (
              <motion.div layoutId="activeTab" className={`absolute bottom-0 left-0 right-0 h-0.5 bg-current`} />
            )}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === 'events' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 mockup-card overflow-hidden h-fit">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <CalendarPlus size={20} className="text-indigo-600" /> Create Event
              </h3>
            </div>
            <div className="p-6">
              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Club</label>
                  <select 
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    value={newEvent.clubId}
                    onChange={e => setNewEvent({...newEvent, clubId: e.target.value})}
                  >
                    <option value="">Select your club</option>
                    {myClubs.map(c => <option key={c._id} value={c._id}>{c.clubName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                  <input 
                    type="text" required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    value={newEvent.title}
                    onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Photo (Optional)</label>
                  <div className="mt-1 flex items-center">
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <ImageIcon className="w-6 h-6 text-gray-400 mb-1" />
                        <p className="text-sm text-gray-500 font-medium">Click to upload photo</p>
                      </div>
                      <input id="eventImageInput" type="file" accept="image/*" className="hidden" onChange={e => setEventImageFile(e.target.files[0])} />
                    </label>
                  </div>
                  {eventImageFile && <p className="text-xs text-green-600 mt-2 font-medium">Selected: {eventImageFile.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input 
                    type="datetime-local" required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    value={newEvent.date}
                    onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea 
                    required rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    value={newEvent.description}
                    onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                  ></textarea>
                </div>
                <button type="submit" disabled={myClubs.length === 0} className="w-full bg-indigo-600 text-white font-medium py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                  Publish Event
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2 mockup-card overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Manage Events</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {myEvents.length === 0 ? (
                <p className="p-6 text-gray-500 text-center">No events found for your club.</p>
              ) : (
                myEvents.map(event => (
                  <div key={event._id} className="p-6 hover:bg-gray-50 flex justify-between items-center group">
                    <div className="flex gap-4">
                      {event.imageUrl ? (
                        <img src={event.imageUrl} alt={event.title} className="w-16 h-16 rounded-lg object-cover border border-gray-200" />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-indigo-100 text-indigo-500 flex items-center justify-center font-bold text-xl border border-indigo-200">
                          {event.title.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold text-gray-900">{event.title}</h4>
                        <p className="text-sm text-gray-500 mt-1">{new Date(event.date).toLocaleString()}</p>
                        <p className="text-sm text-gray-600 mt-2">{event.description}</p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium border border-indigo-100">
                        <Users size={14} /> {event.participants.length} Joined
                      </span>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => { setSelectedEvent(event); setParticipantsModalOpen(true); }}
                          className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          <Eye size={14} /> View Participants
                        </button>
                        <button 
                          onClick={() => handleDeleteEvent(event._id)}
                          className="text-xs flex items-center gap-1 text-red-400 hover:text-red-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'members' && (
        <div className="space-y-8">
          {/* Pending Applications */}
          <div className="mockup-card overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-amber-50">
              <h3 className="text-lg font-semibold text-amber-900 flex items-center gap-2">
                <Users size={20} className="text-amber-600" /> Pending Applications
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {pendingMembers.length === 0 ? (
                <p className="p-6 text-gray-500 text-center">No pending membership requests.</p>
              ) : (
                pendingMembers.map(member => (
                  <div key={member._id} className="p-4 px-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white hover:bg-gray-50">
                    <div>
                      <p className="font-semibold text-gray-900">{member.userId?.name || member.name}</p>
                      <p className="text-sm text-gray-500">{member.userId?.email || member.email}</p>
                      <div className="flex gap-3 mt-1 text-xs text-gray-400 font-medium">
                        <span>PRN: {member.userId?.prn || 'N/A'}</span>
                        <span>Dept: {member.userId?.department || 'N/A'}</span>
                        <span>Year: {member.userId?.year || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleApproveMember(member._id)}
                        className="px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-md text-sm font-medium flex items-center gap-1 transition-colors"
                      >
                        <Check size={16} /> Approve
                      </button>
                      <button 
                        onClick={() => handleRemoveMember(member._id)}
                        className="px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-md text-sm font-medium flex items-center gap-1 transition-colors"
                      >
                        <X size={16} /> Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Current Members */}
          <div className="mockup-card overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <CheckCircle size={20} className="text-green-600" /> Current Members ({approvedMembers.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-sm font-medium text-gray-500">
                    <th className="p-4 px-6">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">PRN</th>
                    <th className="p-4">Department</th>
                    <th className="p-4">Year</th>
                    <th className="p-4">Position</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {approvedMembers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-6 text-center text-gray-500">No active members in the club.</td>
                    </tr>
                  ) : (
                    approvedMembers.map(member => (
                      <tr key={member._id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 px-6 font-medium text-gray-900">{member.userId?.name || member.name}</td>
                        <td className="p-4 text-gray-500">{member.userId?.email || member.email}</td>
                        <td className="p-4 text-gray-600">{member.userId?.prn || 'N/A'}</td>
                        <td className="p-4 text-gray-600">{member.userId?.department || 'N/A'}</td>
                        <td className="p-4 text-gray-600">{member.userId?.year ? `${member.userId.year} Yr` : 'N/A'}</td>
                        <td className="p-4">
                          <select
                            value={member.position || 'Member'}
                            onChange={(e) => handleUpdatePosition(member._id, e.target.value)}
                            className="text-sm border border-gray-300 rounded-md p-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                          >
                            {['Member', 'Vice President', 'Secretary', 'Treasurer', 'Event Lead', 'Technical Lead', 'Data Manager', 'Social Media & Marketing Lead'].map(pos => (
                              <option key={pos} value={pos}>{pos}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => handleRemoveMember(member._id)}
                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'budget' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 mockup-card overflow-hidden h-fit">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <PlusCircle size={20} className="text-green-600" /> Log Expense
              </h3>
            </div>
            <div className="p-6">
              <form onSubmit={handleAddExpense} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item Description</label>
                  <input 
                    type="text" required placeholder="e.g. Pizza for meeting"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    value={newExpense.description}
                    onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost ($)</label>
                  <input 
                    type="number" required min="0" step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    value={newExpense.cost}
                    onChange={e => setNewExpense({...newExpense, cost: e.target.value})}
                  />
                </div>
                <button type="submit" disabled={myClubs.length === 0} className="w-full bg-green-600 text-white font-medium py-2 rounded-lg hover:bg-green-700 disabled:opacity-50">
                  Add Expense
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center">
                <p className="text-sm text-gray-500 font-medium">Total Allocated</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">${budget.amount}</h3>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center">
                <p className="text-sm text-gray-500 font-medium">Total Expenses</p>
                <h3 className="text-3xl font-bold text-red-600 mt-2">${totalExpenses}</h3>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center">
                <p className="text-sm text-gray-500 font-medium">Remaining Balance</p>
                <h3 className={`text-3xl font-bold mt-2 ${remainingBudget < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  ${remainingBudget}
                </h3>
              </div>
            </div>

            <div className="mockup-card overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900">Expense History</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {budget.expenses.length === 0 ? (
                  <p className="p-6 text-gray-500 text-center">No expenses logged yet.</p>
                ) : (
                  budget.expenses.map((exp, idx) => (
                    <div key={idx} className="p-4 px-6 flex justify-between items-center hover:bg-gray-50">
                      <div>
                        <p className="font-medium text-gray-900">{exp.description}</p>
                        <p className="text-xs text-gray-500">{new Date(exp.date).toLocaleDateString()}</p>
                      </div>
                      <span className="font-bold text-red-600">-${exp.cost}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center h-48">
            <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4">
              <CalendarPlus size={28} />
            </div>
            <h4 className="text-gray-500 font-medium">Total Events Hosted</h4>
            <p className="text-4xl font-bold text-gray-900 mt-2">{totalEvents}</p>
          </div>
          
          <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center h-48">
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <Users size={28} />
            </div>
            <h4 className="text-gray-500 font-medium">Total Participants</h4>
            <p className="text-4xl font-bold text-gray-900 mt-2">{totalParticipants}</p>
          </div>
          
          <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center h-48">
            <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4">
              <BarChart3 size={28} />
            </div>
            <h4 className="text-gray-500 font-medium">Avg. Participants / Event</h4>
            <p className="text-4xl font-bold text-gray-900 mt-2">{avgParticipants}</p>
          </div>
        </div>
      )}

      {activeTab === 'request' && (
        <div className="mockup-card overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Building size={20} className="text-gray-500" /> Request to Lead a Club
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {availableClubs.length === 0 ? (
              <p className="p-6 text-gray-500 text-center">No available clubs found without a head.</p>
            ) : (
              availableClubs.map(club => {
                const isPending = club.pendingRequests?.some(reqUser => reqUser._id === user._id);
                
                return (
                  <div key={club._id} className="p-6 flex justify-between items-center hover:bg-gray-50 transition-colors">
                    <div className="flex gap-4">
                      {club.logoUrl ? (
                        <img src={club.logoUrl} alt={`${club.clubName} Logo`} className="w-16 h-16 rounded-xl object-cover border border-gray-200" />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-indigo-100 text-indigo-500 flex items-center justify-center font-bold text-xl border border-indigo-200">
                          {club.clubName.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold text-gray-900 text-lg">{club.clubName}</h4>
                        <p className="text-sm text-gray-600 mt-1 max-w-xl">{club.description}</p>
                      </div>
                    </div>
                    <div>
                      {isPending ? (
                        <span className="px-4 py-2 bg-amber-50 text-amber-700 font-medium rounded-lg text-sm flex items-center gap-2 border border-amber-200">
                          <CheckCircle size={16} /> Request Pending
                        </span>
                      ) : (
                        <button 
                          onClick={() => handleRequestLead(club._id)}
                          className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 font-medium rounded-lg text-sm transition-colors shadow-sm"
                        >
                          Request to Lead
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {activeTab === 'announcements' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 mockup-card overflow-hidden h-fit">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Megaphone size={20} className="text-blue-600" /> New Announcement
              </h3>
            </div>
            <div className="p-6">
              <form onSubmit={handlePostAnnouncement} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea 
                    required rows="4"
                    placeholder="Type your announcement here..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={newAnnouncement}
                    onChange={e => setNewAnnouncement(e.target.value)}
                  ></textarea>
                </div>
                <button type="submit" disabled={myClubs.length === 0} className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  Post Announcement
                </button>
              </form>
            </div>
          </div>
          <div className="lg:col-span-2 mockup-card overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">Recent Announcements</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {announcements.length === 0 ? (
                <p className="p-6 text-gray-500 text-center">No announcements posted yet.</p>
              ) : (
                announcements.map(ann => (
                  <div key={ann._id} className="p-6 hover:bg-gray-50 flex justify-between items-start group">
                    <div>
                      <p className="text-gray-800 whitespace-pre-wrap">{ann.content}</p>
                      <p className="text-xs text-gray-400 mt-2 font-medium">Posted by {ann.createdBy?.name} • {new Date(ann.createdAt).toLocaleString()}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteAnnouncement(ann._id)}
                      className="p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 flex-shrink-0"
                      title="Delete announcement"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Participants Modal */}
      {participantsModalOpen && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">
                Participants: {selectedEvent.title}
              </h3>
              <button onClick={() => setParticipantsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-0 overflow-y-auto flex-1">
              {selectedEvent.participants.length === 0 ? (
                <p className="p-8 text-center text-gray-500">No participants have joined this event yet.</p>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-gray-100 text-sm font-medium text-gray-500 sticky top-0 shadow-sm">
                      <th className="p-4 px-6">Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">PRN</th>
                      <th className="p-4">Department</th>
                      <th className="p-4">Year</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedEvent.participants.map(p => (
                      <tr key={p._id} className="hover:bg-gray-50">
                        <td className="p-4 px-6 font-medium text-gray-900">{p.name}</td>
                        <td className="p-4 text-gray-500">{p.email}</td>
                        <td className="p-4 text-gray-600">{p.prn || 'N/A'}</td>
                        <td className="p-4 text-gray-600">{p.department || 'N/A'}</td>
                        <td className="p-4 text-gray-600">{p.year ? `${p.year} Yr` : 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button onClick={() => setParticipantsModalOpen(false)} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ClubHeadDashboard;
