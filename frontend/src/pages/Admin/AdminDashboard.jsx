import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Shield, Plus, Building, UserCheck, Check, X, Image as ImageIcon, Settings } from 'lucide-react';

const AdminDashboard = () => {
  const { getAuthHeaders } = useContext(AuthContext);
  const [clubs, setClubs] = useState([]);
  const [clubHeads, setClubHeads] = useState([]);
  
  const [newClub, setNewClub] = useState({ clubName: '', description: '' });
  const [imageFile, setImageFile] = useState(null);

  // Settings Modal State
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [selectedClub, setSelectedClub] = useState(null);
  const [selectedHeadId, setSelectedHeadId] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');

  useEffect(() => {
    fetchClubs();
    fetchClubHeads();
  }, []);

  const fetchClubs = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/clubs', { headers: getAuthHeaders() });
      setClubs(res.data);
    } catch (error) {
      console.error("Error fetching clubs", error);
    }
  };

  const fetchClubHeads = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/users?role=club_head', { headers: getAuthHeaders() });
      setClubHeads(res.data);
    } catch (error) {
      console.error("Error fetching users", error);
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
        
        const uploadRes = await axios.post('http://localhost:5000/api/upload', formData, {
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'multipart/form-data'
          }
        });
        logoUrl = uploadRes.data.imageUrl;
      }

      await axios.post('http://localhost:5000/api/clubs', { ...newClub, logoUrl }, { headers: getAuthHeaders() });
      alert("Club created successfully!");
      fetchClubs();
      setNewClub({ clubName: '', description: '' });
      setImageFile(null);
      document.getElementById('logoInput').value = "";
    } catch (error) {
      alert(error.response?.data?.message || "Failed to create club");
    }
  };

  const handleApprove = async (clubId, userId) => {
    try {
      await axios.post(`http://localhost:5000/api/clubs/${clubId}/approve-request`, { userId }, { headers: getAuthHeaders() });
      fetchClubs();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to approve request");
    }
  };

  const handleReject = async (clubId, userId) => {
    try {
      await axios.post(`http://localhost:5000/api/clubs/${clubId}/reject-request`, { userId }, { headers: getAuthHeaders() });
      fetchClubs();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to reject request");
    }
  };

  const openSettingsModal = async (club) => {
    setSelectedClub(club);
    setSelectedHeadId(club.clubHeadId?._id || '');
    // Fetch current budget to show
    try {
      const res = await axios.get(`http://localhost:5000/api/budgets/${club._id}`, { headers: getAuthHeaders() });
      setBudgetAmount(res.data?.amount || 0);
    } catch (error) {
      setBudgetAmount(0);
    }
    setSettingsModalOpen(true);
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      // 1. Update Budget
      await axios.put(`http://localhost:5000/api/budgets/${selectedClub._id}`, { amount: Number(budgetAmount) }, { headers: getAuthHeaders() });
      
      // 2. Reassign Club Head if changed
      if (selectedHeadId !== (selectedClub.clubHeadId?._id || '')) {
        await axios.put(`http://localhost:5000/api/clubs/${selectedClub._id}/assign-head`, { clubHeadId: selectedHeadId }, { headers: getAuthHeaders() });
      }
      
      alert("Club settings updated successfully!");
      setSettingsModalOpen(false);
      fetchClubs();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update settings");
    }
  };

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Shield className="text-red-600" size={32} /> Admin Dashboard
        </h1>
        <p className="text-gray-600 mt-2">Manage clubs, upload logos, approve club heads, and allocate budgets.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-fit">
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
              <button type="submit" className="w-full bg-indigo-600 text-white font-medium py-2 rounded-lg hover:bg-indigo-700">
                Add Club
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          {/* Pending Requests Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-amber-50">
              <h3 className="text-lg font-semibold text-amber-900 flex items-center gap-2">
                <UserCheck size={20} className="text-amber-600" /> Pending Club Head Requests
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {clubs.filter(c => c.pendingRequests && c.pendingRequests.length > 0).length === 0 ? (
                <p className="p-6 text-gray-500 text-center">No pending requests at the moment.</p>
              ) : (
                clubs.filter(c => c.pendingRequests && c.pendingRequests.length > 0).map(club => (
                  <div key={`req-${club._id}`} className="p-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Requests for {club.clubName}</h4>
                    <div className="space-y-3">
                      {club.pendingRequests.map(reqUser => (
                        <div key={reqUser._id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                          <div>
                            <p className="font-medium text-gray-900">{reqUser.name}</p>
                            <p className="text-sm text-gray-500">{reqUser.email}</p>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleApprove(club._id, reqUser._id)}
                              className="px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-md text-sm font-medium flex items-center gap-1 transition-colors"
                            >
                              <Check size={16} /> Approve
                            </button>
                            <button 
                              onClick={() => handleReject(club._id, reqUser._id)}
                              className="px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-md text-sm font-medium flex items-center gap-1 transition-colors"
                            >
                              <X size={16} /> Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* System Clubs Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Building size={20} className="text-gray-500" /> System Clubs
              </h3>
              <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                {clubs.length} Total
              </span>
            </div>
            <div className="divide-y divide-gray-100">
              {clubs.length === 0 ? (
                <p className="p-6 text-gray-500 text-center">No clubs registered in the system.</p>
              ) : (
                clubs.map(club => (
                  <div key={club._id} className="p-6 hover:bg-gray-50 flex justify-between items-center transition-colors">
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
                        <div className="mt-2 flex items-center gap-2 text-sm">
                          <UserCheck size={16} className="text-gray-400" />
                          <span className="text-gray-600">
                            Club Head: {club.clubHeadId ? <span className="font-medium text-gray-900">{club.clubHeadId.name}</span> : <span className="text-amber-600 font-medium italic">Pending Assignment</span>}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <button 
                        onClick={() => openSettingsModal(club)}
                        className="px-4 py-2 bg-white border border-gray-200 shadow-sm text-gray-700 hover:bg-gray-50 font-medium rounded-lg text-sm transition-colors flex items-center gap-2"
                      >
                        <Settings size={16} /> Settings
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {settingsModalOpen && selectedClub && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Settings: {selectedClub.clubName}</h3>
              <button onClick={() => setSettingsModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handleSaveSettings} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Allocate Budget ($)</label>
                <input 
                  type="number" required min="0" step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  value={budgetAmount}
                  onChange={e => setBudgetAmount(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">This sets the total available budget for the club.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Re-assign Club Head</label>
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
                {clubHeads.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">No Club Heads found in the system.</p>
                )}
              </div>
              
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setSettingsModalOpen(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
