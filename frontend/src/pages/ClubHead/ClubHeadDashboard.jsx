import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { CalendarPlus, Users, DollarSign, BarChart3, PlusCircle, Building, CheckCircle, Check, X, Eye } from 'lucide-react';

const ClubHeadDashboard = () => {
  const { user, getAuthHeaders } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [budget, setBudget] = useState({ amount: 0, expenses: [] });
  const [members, setMembers] = useState([]);
  
  const [newEvent, setNewEvent] = useState({ title: '', description: '', date: '', clubId: '' });
  const [newExpense, setNewExpense] = useState({ description: '', cost: '' });
  
  const [activeTab, setActiveTab] = useState('events'); // events, budget, performance, members, request

  // Event Participants Modal
  const [participantsModalOpen, setParticipantsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const headers = getAuthHeaders();
      const [clubsRes, eventsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/clubs', { headers }),
        axios.get('http://localhost:5000/api/events', { headers })
      ]);
      setClubs(clubsRes.data);
      setEvents(eventsRes.data);
      
      const myClubs = clubsRes.data.filter(c => c.clubHeadId && c.clubHeadId._id === user._id);
      if (myClubs.length > 0) {
        fetchBudget(myClubs[0]._id);
        fetchMembers(myClubs[0]._id);
      }
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  const fetchBudget = async (clubId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/budgets/${clubId}`, { headers: getAuthHeaders() });
      if (res.data) setBudget(res.data);
    } catch (error) {
      console.error("Error fetching budget", error);
    }
  };

  const fetchMembers = async (clubId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/members/${clubId}`, { headers: getAuthHeaders() });
      setMembers(res.data);
    } catch (error) {
      console.error("Error fetching members", error);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/events', newEvent, { headers: getAuthHeaders() });
      alert("Event created successfully!");
      fetchData();
      setNewEvent({ ...newEvent, title: '', description: '', date: '' });
    } catch (error) {
      alert(error.response?.data?.message || "Failed to create event");
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    const myClubs = clubs.filter(c => c.clubHeadId && c.clubHeadId._id === user._id);
    if (myClubs.length === 0) return alert("You don't manage any clubs yet.");
    
    try {
      await axios.put(`http://localhost:5000/api/budgets/${myClubs[0]._id}`, {
        expenseDescription: newExpense.description,
        expenseCost: Number(newExpense.cost)
      }, { headers: getAuthHeaders() });
      
      alert("Expense added!");
      setNewExpense({ description: '', cost: '' });
      fetchBudget(myClubs[0]._id);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add expense");
    }
  };

  const handleRequestLead = async (clubId) => {
    try {
      await axios.post(`http://localhost:5000/api/clubs/${clubId}/request`, {}, { headers: getAuthHeaders() });
      alert("Request sent successfully!");
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to send request");
    }
  };

  const handleApproveMember = async (memberId) => {
    try {
      await axios.put(`http://localhost:5000/api/members/${memberId}/approve`, {}, { headers: getAuthHeaders() });
      const myClubs = clubs.filter(c => c.clubHeadId && c.clubHeadId._id === user._id);
      if (myClubs.length > 0) fetchMembers(myClubs[0]._id);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to approve member");
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/members/${memberId}/remove`, { headers: getAuthHeaders() });
      const myClubs = clubs.filter(c => c.clubHeadId && c.clubHeadId._id === user._id);
      if (myClubs.length > 0) fetchMembers(myClubs[0]._id);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to remove member");
    }
  };

  const myClubs = clubs.filter(c => c.clubHeadId && c.clubHeadId._id === user._id);
  const availableClubs = clubs.filter(c => !c.clubHeadId);

  // Derived Performance Metrics
  const totalEvents = events.length;
  const totalParticipants = events.reduce((acc, curr) => acc + curr.participants.length, 0);
  const avgParticipants = totalEvents > 0 ? (totalParticipants / totalEvents).toFixed(1) : 0;
  const totalExpenses = budget.expenses.reduce((acc, curr) => acc + curr.cost, 0);
  const remainingBudget = budget.amount - totalExpenses;

  // Split members
  const pendingMembers = members.filter(m => m.status === 'pending');
  const approvedMembers = members.filter(m => m.status === 'approved');

  return (
    <div className="space-y-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Club Head Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your club, events, members, and budget.</p>
        {myClubs.length === 0 && (
          <div className="mt-4 bg-amber-50 text-amber-800 p-4 rounded-lg border border-amber-200">
            <strong>Notice:</strong> You have not been assigned to a club yet. Please go to the "Request Club" tab.
          </div>
        )}
      </header>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-6 overflow-x-auto whitespace-nowrap">
        <button 
          onClick={() => setActiveTab('events')} 
          className={`pb-3 font-medium flex items-center gap-2 ${activeTab === 'events' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <CalendarPlus size={18} /> Event Management
        </button>
        <button 
          onClick={() => setActiveTab('members')} 
          className={`pb-3 font-medium flex items-center gap-2 ${activeTab === 'members' ? 'border-b-2 border-pink-600 text-pink-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Users size={18} /> Members & Applications
        </button>
        <button 
          onClick={() => setActiveTab('budget')} 
          className={`pb-3 font-medium flex items-center gap-2 ${activeTab === 'budget' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <DollarSign size={18} /> Budget Tracker
        </button>
        <button 
          onClick={() => setActiveTab('performance')} 
          className={`pb-3 font-medium flex items-center gap-2 ${activeTab === 'performance' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <BarChart3 size={18} /> Performance Analysis
        </button>
        <button 
          onClick={() => setActiveTab('request')} 
          className={`pb-3 font-medium flex items-center gap-2 ${activeTab === 'request' ? 'border-b-2 border-amber-500 text-amber-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Building size={18} /> Request Club
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'events' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-fit">
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

          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Manage Events</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {events.length === 0 ? (
                <p className="p-6 text-gray-500 text-center">No events found.</p>
              ) : (
                events.map(event => (
                  <div key={event._id} className="p-6 hover:bg-gray-50 flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-gray-900">{event.title}</h4>
                      <p className="text-sm text-gray-500 mt-1">{new Date(event.date).toLocaleString()}</p>
                      <p className="text-sm text-gray-600 mt-2">{event.description}</p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium border border-indigo-100">
                        <Users size={14} /> {event.participants.length} Joined
                      </span>
                      <button 
                        onClick={() => { setSelectedEvent(event); setParticipantsModalOpen(true); }}
                        className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        <Eye size={14} /> View Participants
                      </button>
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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
                  <div key={member._id} className="p-4 px-6 flex justify-between items-center bg-white hover:bg-gray-50">
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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
          <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-fit">
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

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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
