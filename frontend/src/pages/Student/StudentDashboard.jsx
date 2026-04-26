import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Compass, Calendar as CalendarIcon, UserCheck } from 'lucide-react';

const StudentDashboard = () => {
  const { user, getAuthHeaders } = useContext(AuthContext);
  const [clubs, setClubs] = useState([]);
  const [events, setEvents] = useState([]);
  const [myMemberships, setMyMemberships] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const headers = getAuthHeaders();
      const [clubsRes, eventsRes, membershipsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/clubs', { headers }),
        axios.get('http://localhost:5000/api/events', { headers }),
        axios.get('http://localhost:5000/api/members/my-memberships', { headers })
      ]);
      setClubs(clubsRes.data);
      setEvents(eventsRes.data);
      setMyMemberships(membershipsRes.data);
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  const handleJoinEvent = async (eventId) => {
    try {
      await axios.put(`http://localhost:5000/api/events/${eventId}/join`, {}, { headers: getAuthHeaders() });
      alert("Successfully joined the event!");
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to join event");
    }
  };

  const handleJoinClub = async (clubId) => {
    try {
      await axios.post('http://localhost:5000/api/members', { clubId }, { headers: getAuthHeaders() });
      alert("Successfully requested to join the club! Pending approval.");
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to join club");
    }
  };

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name}!</h1>
        <p className="text-gray-600 mt-2">Discover clubs and participate in upcoming events.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Events Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <CalendarIcon size={20} className="text-indigo-600" /> Upcoming Events
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {events.length === 0 ? (
              <p className="p-6 text-gray-500 text-center">No upcoming events.</p>
            ) : (
              events.map(event => {
                const isParticipating = event.participants.includes(user?._id);
                return (
                  <div key={event._id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900">{event.title}</h4>
                        <p className="text-sm text-gray-500 mt-1">{new Date(event.date).toLocaleString()}</p>
                        <p className="text-sm text-gray-600 mt-2">{event.description}</p>
                      </div>
                      <div>
                        {isParticipating ? (
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium border border-green-200">
                            Joined
                          </span>
                        ) : (
                          <button 
                            onClick={() => handleJoinEvent(event._id)}
                            className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg text-sm hover:bg-indigo-700 transition-colors shadow-sm"
                          >
                            Participate
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Clubs Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Compass size={20} className="text-indigo-600" /> Discover Clubs
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {clubs.length === 0 ? (
              <p className="p-6 text-gray-500 text-center">No clubs available.</p>
            ) : (
              clubs.map(club => {
                const membership = myMemberships.find(m => m.clubId?._id === club._id);
                const isMember = !!membership;
                const isPending = membership?.status === 'pending';
                
                return (
                  <div key={club._id} className="p-6 hover:bg-gray-50 transition-colors flex justify-between items-center gap-4">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        {club.logoUrl ? (
                          <img src={club.logoUrl} alt={`${club.clubName} Logo`} className="w-14 h-14 rounded-lg object-cover border border-gray-200" />
                        ) : (
                          <div className="w-14 h-14 rounded-lg bg-indigo-100 text-indigo-500 flex items-center justify-center font-bold text-lg border border-indigo-200">
                            {club.clubName.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{club.clubName}</h4>
                        <p className="text-sm text-gray-600 mt-1">{club.description}</p>
                        {club.clubHeadId && (
                          <p className="text-xs text-gray-400 mt-2">Head: {club.clubHeadId.name}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      {isMember ? (
                        isPending ? (
                          <span className="px-3 py-1.5 bg-amber-50 text-amber-700 font-medium rounded-lg text-sm flex items-center gap-1 border border-amber-100">
                            <UserCheck size={16} /> Pending Approval
                          </span>
                        ) : (
                          <span className="px-3 py-1.5 bg-green-50 text-green-700 font-medium rounded-lg text-sm flex items-center gap-1 border border-green-100">
                            <UserCheck size={16} /> Member
                          </span>
                        )
                      ) : (
                        <button 
                          onClick={() => handleJoinClub(club._id)}
                          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg text-sm transition-colors shadow-sm whitespace-nowrap"
                        >
                          Join Club
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
