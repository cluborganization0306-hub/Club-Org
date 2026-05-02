import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'sonner';
import { User, Mail, Lock, Hash, Building, GraduationCap, Save, Shield, Crown, Users, Eye, EyeOff } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SettingsPage = () => {
  const { user, getAuthHeaders } = useContext(AuthContext);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    prn: '',
    department: '',
    year: ''
  });
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [clubInfo, setClubInfo] = useState([]);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        password: '',
        prn: user.prn || '',
        department: user.department || '',
        year: user.year || ''
      });
      fetchClubInfo();
    }
  }, [user]);

  const fetchClubInfo = async () => {
    try {
      const { data } = await axios.get(`${API}/api/chat/user/summary`, { headers: getAuthHeaders() });
      setClubInfo(data);
    } catch (err) {
      console.error('Failed to fetch club info');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password; // Don't send empty password
      
      const { data } = await axios.put(`${API}/api/auth/profile`, payload, { headers: getAuthHeaders() });
      
      // Update localStorage with new user data
      const stored = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const updated = { ...stored, ...data };
      localStorage.setItem('userInfo', JSON.stringify(updated));
      
      toast.success('Profile updated successfully!');
      setForm(prev => ({ ...prev, password: '' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
    setSaving(false);
  };

  const getRoleBadge = () => {
    switch(user?.role) {
      case 'admin': return { label: 'Admin', icon: Shield, color: 'from-purple-500 to-violet-600', bg: 'bg-purple-100 text-purple-700' };
      case 'club_head': return { label: 'Club Head', icon: Crown, color: 'from-amber-500 to-orange-600', bg: 'bg-amber-100 text-amber-700' };
      default: return { label: 'Student', icon: Users, color: 'from-blue-500 to-cyan-600', bg: 'bg-blue-100 text-blue-700' };
    }
  };

  const role = getRoleBadge();
  const RoleIcon = role.icon;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          <span className="font-editorial bg-clip-text text-transparent bg-gradient-to-r from-[#6c63ff] to-[#ec4899]">Settings</span>
        </h1>
        <p className="text-gray-500">Manage your profile and account preferences</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className={`bg-gradient-to-r ${role.color} px-8 py-6`}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-2xl font-bold border-2 border-white/30">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-white text-xl font-bold">{user?.name || 'User'}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 bg-white/20 text-white/90 text-xs font-bold px-3 py-1 rounded-full">
                  <RoleIcon size={12} />
                  {role.label}
                </span>
                <span className="text-white/70 text-xs">{user?.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Club Memberships */}
        {clubInfo.length > 0 && (
          <div className="px-8 py-4 bg-gray-50 border-b border-gray-100">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Your Clubs</h3>
            <div className="flex flex-wrap gap-2">
              {clubInfo.map((club) => (
                <span 
                  key={club.clubId}
                  className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${
                    club.userRole === 'Club Head'
                      ? 'bg-amber-100 text-amber-700 border border-amber-200'
                      : club.userRole === 'Admin'
                      ? 'bg-purple-100 text-purple-700 border border-purple-200'
                      : 'bg-blue-100 text-blue-700 border border-blue-200'
                  }`}
                >
                  {club.userRole === 'Club Head' && <Crown size={12} />}
                  {club.userRole === 'Member' && <Users size={12} />}
                  {club.userRole === 'Admin' && <Shield size={12} />}
                  {club.clubName}
                  <span className="text-[10px] opacity-70">• {club.userRole}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Name */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <User size={14} className="text-gray-400" /> Full Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#6c63ff] focus:ring-2 focus:ring-[#6c63ff]/20 bg-gray-50 text-sm transition-all"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Mail size={14} className="text-gray-400" /> Email Address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#6c63ff] focus:ring-2 focus:ring-[#6c63ff]/20 bg-gray-50 text-sm transition-all"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Lock size={14} className="text-gray-400" /> New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Leave blank to keep current"
                  className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-xl focus:outline-none focus:border-[#6c63ff] focus:ring-2 focus:ring-[#6c63ff]/20 bg-gray-50 text-sm transition-all"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Min 6 characters. Leave blank to keep current password.</p>
            </div>

            {/* PRN */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Hash size={14} className="text-gray-400" /> PRN Number
              </label>
              <input
                type="text"
                value={form.prn}
                onChange={(e) => setForm({ ...form, prn: e.target.value })}
                placeholder="Enter your PRN"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#6c63ff] focus:ring-2 focus:ring-[#6c63ff]/20 bg-gray-50 text-sm transition-all"
              />
            </div>

            {/* Department */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Building size={14} className="text-gray-400" /> Department
              </label>
              <select
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#6c63ff] focus:ring-2 focus:ring-[#6c63ff]/20 bg-gray-50 text-sm transition-all"
              >
                <option value="">Select Department</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics">Electronics</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Civil">Civil</option>
                <option value="Electrical">Electrical</option>
                <option value="Textile">Textile</option>
              </select>
            </div>

            {/* Year */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <GraduationCap size={14} className="text-gray-400" /> Year
              </label>
              <select
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#6c63ff] focus:ring-2 focus:ring-[#6c63ff]/20 bg-gray-50 text-sm transition-all"
              >
                <option value="">Select Year</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-[#6c63ff] to-[#8b5cf6] text-white font-bold rounded-xl hover:shadow-lg hover:shadow-[#6c63ff]/30 disabled:opacity-50 transition-all duration-300 flex items-center justify-center gap-2"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Save size={18} />
              )}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
