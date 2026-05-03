import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Shield, Plus, Building, UserCheck, Check, X, Image as ImageIcon, Settings, Users, Search, Trash2, Calendar, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const { getAuthHeaders } = useContext(AuthContext);
  const [clubs, setClubs] = useState([]);
  const [clubHeads, setClubHeads] = useState([]);
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [assignClubId, setAssignClubId] = useState('');

  const [newClub, setNewClub] = useState({ clubName: '', description: '' });
  const [imageFile, setImageFile] = useState(null);

  // Settings Modal State
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [selectedClub, setSelectedClub] = useState(null);
  const [selectedHeadId, setSelectedHeadId] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [editClubName, setEditClubName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Events Modal State
  const [eventsModalOpen, setEventsModalOpen] = useState(false);
  const [eventsClub, setEventsClub] = useState(null);
  const [clubEvents, setClubEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [editLogoUrl, setEditLogoUrl] = useState('');

  useEffect(() => {
    fetchClubs();
    fetchClubHeads();
    fetchStudents();
  }, []);

  const fetchClubs = async () => {
    try {
      const res = await axios.get((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/clubs', { headers: getAuthHeaders() });
      setClubs(res.data);
    } catch (error) {
      console.error("Error fetching clubs", error);
    }
  };

  const fetchClubHeads = async () => {
    try {
      const res = await axios.get((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/users?role=club_head', { headers: getAuthHeaders() });
      setClubHeads(res.data);
    } catch (error) {
      console.error("Error fetching users", error);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await axios.get((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/users?role=student', { headers: getAuthHeaders() });
      setStudents(res.data);
    } catch (error) {
      console.error("Error fetching students", error);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleCreateClub = async (e) => {
    e.preventDefault();
    try {
      let logoUrl = '';
      
      // Upload image first if selected
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        
        const uploadRes = await axios.post((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/upload', formData, {
          headers: {
            ...getAuthHeaders()
          }
        });
        logoUrl = uploadRes.data.imageUrl;
      }

      await axios.post((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/clubs', { ...newClub, logoUrl }, { headers: getAuthHeaders() });
      toast.success("Club created successfully!");
      fetchClubs();
      setNewClub({ clubName: '', description: '' });
      setImageFile(null);
      document.getElementById('logoInput').value = "";
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create club");
    }
  };

  const handleApprove = async (clubId, userId) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/clubs/${clubId}/approve-request`, { userId }, { headers: getAuthHeaders() });
      toast.success("Request approved!");
      fetchClubs();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve request");
    }
  };

  const handleReject = async (clubId, userId) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/clubs/${clubId}/reject-request`, { userId }, { headers: getAuthHeaders() });
      toast.success("Request rejected!");
      fetchClubs();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject request");
    }
  };

  const openSettingsModal = async (club) => {
    setSelectedClub(club);
    setSelectedHeadId(club.clubHeadId?._id || '');
    setEditClubName(club.clubName);
    setEditDescription(club.description);
    setEditLogoUrl(club.logoUrl || '');
    // Fetch current budget to show
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/budgets/${club._id}`, { headers: getAuthHeaders() });
      setBudgetAmount(res.data?.amount || 0);
    } catch (error) {
      setBudgetAmount(0);
    }
    setSettingsModalOpen(true);
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      // 1. Update Club Details & Head Assignment
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/clubs/${selectedClub._id}`, {
        clubName: editClubName,
        description: editDescription,
        logoUrl: editLogoUrl,
        clubHeadId: selectedHeadId || null
      }, { headers: getAuthHeaders() });

      // 2. Update Budget
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/budgets/${selectedClub._id}`, { amount: Number(budgetAmount) }, { headers: getAuthHeaders() });
      
      toast.success("Club settings updated successfully!");
      setSettingsModalOpen(false);
      fetchClubs();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update settings");
    }
  };

  const handleDeleteClub = async () => {
    if (!window.confirm(`Are you absolutely sure you want to delete ${selectedClub.clubName}? This action cannot be undone.`)) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/clubs/${selectedClub._id}`, { headers: getAuthHeaders() });
      toast.success("Club deleted successfully!");
      setSettingsModalOpen(false);
      fetchClubs();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete club");
    }
  };

  const handleAssignPresident = async (e) => {
    e.preventDefault();
    if (!assignClubId) {
      toast.error('Please select a club');
      return;
    }
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/clubs/${assignClubId}/assign-head`, { clubHeadId: selectedStudent._id }, { headers: getAuthHeaders() });
      toast.success(`${selectedStudent.name} is now President of the selected club!`);
      setStudentModalOpen(false);
      fetchClubs();
      fetchClubHeads();
      fetchStudents(); // Refresh to remove the student from the list since role is now club_head
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign president');
    }
  };

  // Fetch events for a specific club
  const openClubEvents = async (club) => {
    setEventsClub(club);
    setEventsModalOpen(true);
    setLoadingEvents(true);
    try {
      const res = await axios.get((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/events', { headers: getAuthHeaders() });
      const filtered = res.data.filter(e => e.clubId?._id === club._id || e.clubId === club._id);
      setClubEvents(filtered);
    } catch (error) {
      toast.error('Failed to fetch events');
    }
    setLoadingEvents(false);
  };

  // Delete an event
  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/events/${eventId}`, { headers: getAuthHeaders() });
      setClubEvents(prev => prev.filter(e => e._id !== eventId));
      toast.success('Event deleted successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete event');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { type: 'spring', duration: 0.3 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
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
          <h1 className="text-4xl font-editorial font-extrabold text-gray-900 tracking-tight mb-4 flex items-center gap-3">
            <Shield className="text-brand-primary" size={36} /> System <span className="text-brand-primary">Admin</span>
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            Manage clubs, approve club heads, and allocate budgets.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="mockup-card h-fit">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Plus size={20} className="text-indigo-600" /> Create New Club
            </h3>
          </div>
          <div className="p-6">
            <form onSubmit={handleCreateClub} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Club Name</label>
                <input 
                  type="text" required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  value={newClub.clubName}
                  onChange={e => setNewClub({...newClub, clubName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Club Logo</label>
                <div className="mt-1 flex items-center">
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <ImageIcon className="w-6 h-6 text-gray-400 mb-1" />
                      <p className="text-sm text-gray-500 font-medium">Click to upload image</p>
                    </div>
                    <input id="logoInput" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                </div>
                {imageFile && <p className="text-xs text-green-600 mt-2 font-medium">Selected: {imageFile.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  required rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  value={newClub.description}
                  onChange={e => setNewClub({...newClub, description: e.target.value})}
                ></textarea>
              </div>
              <button type="submit" className="w-full mockup-btn py-2">
                Add Club
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">

          {/* System Clubs Section */}
          <div className="mockup-card">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Building size={20} className="text-gray-500" /> System Clubs
              </h3>
              <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                {clubs.length} Total
              </span>
            </div>
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="divide-y divide-gray-100"
            >
              {clubs.length === 0 ? (
                <p className="p-6 text-gray-500 text-center">No clubs registered in the system.</p>
              ) : (
                clubs.map(club => (
                  <motion.div variants={itemVariants} key={club._id} className="p-6 hover:bg-indigo-50/50 flex justify-between items-center transition-colors cursor-pointer group" onClick={() => openClubEvents(club)}>
                    <div className="flex gap-4">
                      {club.logoUrl ? (
                        <img src={club.logoUrl} alt={`${club.clubName} Logo`} className="w-16 h-16 rounded-xl object-cover border border-gray-200" />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-indigo-100 text-indigo-500 flex items-center justify-center font-bold text-xl border border-indigo-200">
                          {club.clubName.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold text-gray-900 text-lg group-hover:text-indigo-700 transition-colors">{club.clubName}</h4>
                        <p className="text-sm text-gray-600 mt-1 max-w-xl">{club.description}</p>
                        <div className="mt-2 flex items-center gap-2 text-sm">
                          <UserCheck size={16} className="text-gray-400" />
                          <span className="text-gray-600">
                            Club Head: {club.clubHeadId ? <span className="font-medium text-gray-900">{club.clubHeadId.name}</span> : <span className="text-amber-600 font-medium italic">Pending Assignment</span>}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); openClubEvents(club); }}
                        className="px-3 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-medium rounded-lg text-sm transition-colors flex items-center gap-2 border border-indigo-200"
                      >
                        <Calendar size={16} /> Events
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); openSettingsModal(club); }}
                        className="px-3 py-2 bg-white border border-gray-200 shadow-sm text-gray-700 hover:bg-gray-50 font-medium rounded-lg text-sm transition-colors flex items-center gap-2"
                      >
                        <Settings size={16} /> Settings
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Registered Students Section */}
      <div className="mockup-card mt-8">
        <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white/30 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users size={20} className="text-brand-primary" /> Registered Students
          </h3>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search name, email, PRN..." 
              className="w-full pl-9 pr-4 py-2 bg-white/50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary/50 outline-none transition-all"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/20 border-b border-gray-100 text-sm font-medium text-gray-500">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">PRN</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/50">
              {students.filter(s => 
                s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                s.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
                (s.prn && s.prn.toLowerCase().includes(searchQuery.toLowerCase()))
              ).length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">No students found</td>
                </tr>
              ) : (
                students.filter(s => 
                  s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  s.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  (s.prn && s.prn.toLowerCase().includes(searchQuery.toLowerCase()))
                ).map(student => (
                  <tr key={student._id} className="hover:bg-white/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{student.name}</div>
                      <div className="text-xs text-gray-500">{student.email}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{student.prn || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-600">{student.department || 'N/A'}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => {
                          setSelectedStudent(student);
                          setAssignClubId('');
                          setStudentModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 rounded-lg text-sm font-bold inline-flex items-center gap-1.5 transition-colors"
                      >
                        <Shield size={14} /> Assign President
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
      {settingsModalOpen && selectedClub && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div 
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Settings: {selectedClub.clubName}</h3>
              <button onClick={() => setSettingsModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handleSaveSettings} className="p-6 space-y-5">
              <div className="grid grid-cols-1 gap-5 overflow-y-auto max-h-[60vh] pr-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Club Name</label>
                  <input 
                    type="text" required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    value={editClubName}
                    onChange={e => setEditClubName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea 
                    required rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    value={editDescription}
                    onChange={e => setEditDescription(e.target.value)}
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL (Optional)</label>
                  <input 
                    type="url"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    value={editLogoUrl}
                    onChange={e => setEditLogoUrl(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Allocate Budget ($)</label>
                  <input 
                    type="number" required min="0" step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    value={budgetAmount}
                    onChange={e => setBudgetAmount(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign Club Head</label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    value={selectedHeadId}
                    onChange={e => setSelectedHeadId(e.target.value)}
                  >
                    <option value="">-- No Club Head --</option>
                    {clubHeads.map(head => (
                      <option key={head._id} value={head._id}>{head.name} ({head.email})</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-gray-100">
                <button type="button" onClick={handleDeleteClub} className="text-red-600 hover:text-red-800 font-medium text-sm flex items-center gap-1 w-full sm:w-auto justify-center">
                  Delete Club
                </button>
                <div className="flex gap-3 w-full sm:w-auto">
                  <button type="button" onClick={() => setSettingsModalOpen(false)} className="px-4 py-2 flex-1 sm:flex-none border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                    Cancel
                  </button>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit" 
                    className="px-4 py-2 flex-1 sm:flex-none mockup-btn"
                  >
                    Save Changes
                  </motion.button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* Student Assignment Modal */}
      <AnimatePresence>
      {studentModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div 
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 w-full max-w-md overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white/50">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Shield className="text-brand-primary" size={20} /> Assign President
              </h3>
              <button onClick={() => setStudentModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            
            <div className="p-6">
              <div className="mb-6 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                <h4 className="font-bold text-gray-900 text-lg">{selectedStudent.name}</h4>
                <div className="text-sm text-gray-600 mt-1 grid grid-cols-2 gap-2">
                  <p><strong>Email:</strong> {selectedStudent.email}</p>
                  <p><strong>PRN:</strong> {selectedStudent.prn || 'N/A'}</p>
                  <p><strong>Dept:</strong> {selectedStudent.department || 'N/A'}</p>
                </div>
              </div>

              <form onSubmit={handleAssignPresident} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Select Club to Lead</label>
                  <select 
                    required
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/50 outline-none transition-all"
                    value={assignClubId}
                    onChange={e => setAssignClubId(e.target.value)}
                  >
                    <option value="">-- Choose a Club --</option>
                    {clubs.map(club => (
                      <option key={club._id} value={club._id}>{club.clubName}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-2">
                    Assigning this student will automatically change their account role to <strong className="text-brand-primary">Club Head</strong>.
                  </p>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button type="button" onClick={() => setStudentModalOpen(false)} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 px-4 py-2.5 mockup-btn">
                    Confirm Assignment
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* Club Events Modal */}
      <AnimatePresence>
      {eventsModalOpen && eventsClub && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div 
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
          >
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Calendar size={20} /> Events: {eventsClub.clubName}
                </h3>
                <p className="text-white/70 text-sm mt-0.5">{clubEvents.length} events found</p>
              </div>
              <button onClick={() => setEventsModalOpen(false)} className="text-white/80 hover:text-white text-2xl">&times;</button>
            </div>
            
            <div className="max-h-[60vh] overflow-y-auto">
              {loadingEvents ? (
                <div className="p-12 text-center">
                  <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-gray-400">Loading events...</p>
                </div>
              ) : clubEvents.length === 0 ? (
                <div className="p-12 text-center">
                  <Calendar size={40} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-400 font-medium">No events for this club</p>
                  <p className="text-gray-300 text-sm mt-1">Events created by the club head will appear here</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {clubEvents.map(event => (
                    <div key={event._id} className="p-5 hover:bg-gray-50 transition-colors group">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 flex gap-4">
                          {event.imageUrl ? (
                            <img src={event.imageUrl} alt={event.title} className="w-16 h-16 rounded-lg object-cover border border-gray-200 flex-shrink-0" />
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-indigo-100 text-indigo-500 flex items-center justify-center font-bold text-xl border border-indigo-200 flex-shrink-0">
                              <Calendar size={24} />
                            </div>
                          )}
                          <div>
                            <h4 className="font-bold text-gray-900 text-base">{event.title}</h4>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{event.description}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                                <Clock size={12} /> {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <span className="text-xs text-gray-400">
                                {event.participants?.length || 0} participants
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteEvent(event._id)}
                          className="p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 flex-shrink-0 ml-4"
                          title="Delete event"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button 
                onClick={() => setEventsModalOpen(false)}
                className="px-5 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-lg font-medium text-sm transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminDashboard;
