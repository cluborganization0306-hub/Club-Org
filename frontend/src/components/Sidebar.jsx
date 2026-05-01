import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PieChart, BarChart2, MapPin, Settings, Grid } from 'lucide-react';

const Sidebar = () => {
  return (
    <aside className="w-20 bg-white/40 backdrop-blur-md h-full flex flex-col items-center py-8 justify-between rounded-r-3xl shadow-[4px_0_24px_rgba(0,0,0,0.02)] border-r border-white/60 z-20">
      <div className="flex flex-col items-center gap-10 w-full">
        {/* Logo Icon */}
        <div className="w-10 h-10 rounded-full border-4 border-[#8676f8] flex items-center justify-center">
          <div className="w-4 h-4 bg-gradient-to-tr from-[#ec4899] to-[#8676f8] rounded-full"></div>
        </div>

        {/* Navigation Icons */}
        <nav className="flex flex-col gap-6 w-full items-center">
          <NavLink to="/" className={({ isActive }) => `p-3 rounded-xl transition-all duration-300 ${isActive ? 'text-[#6c63ff] bg-white/60 shadow-sm border border-white/50' : 'text-gray-500 hover:text-[#6c63ff] hover:bg-white/40'}`}>
            <LayoutDashboard size={24} strokeWidth={1.5} />
          </NavLink>
          <NavLink to="/charts" className={({ isActive }) => `p-3 rounded-xl transition-all duration-300 ${isActive ? 'text-[#6c63ff] bg-white/60 shadow-sm border border-white/50' : 'text-gray-500 hover:text-[#6c63ff] hover:bg-white/40'}`}>
            <PieChart size={24} strokeWidth={1.5} />
          </NavLink>
          <NavLink to="/stats" className={({ isActive }) => `p-3 rounded-xl transition-all duration-300 ${isActive ? 'text-[#6c63ff] bg-white/60 shadow-sm border border-white/50' : 'text-gray-500 hover:text-[#6c63ff] hover:bg-white/40'}`}>
            <BarChart2 size={24} strokeWidth={1.5} />
          </NavLink>
          <NavLink to="/map" className={({ isActive }) => `p-3 rounded-xl transition-all duration-300 ${isActive ? 'text-[#6c63ff] bg-white/60 shadow-sm border border-white/50' : 'text-gray-500 hover:text-[#6c63ff] hover:bg-white/40'}`}>
            <MapPin size={24} strokeWidth={1.5} />
          </NavLink>
          <NavLink to="/grid" className={({ isActive }) => `p-3 rounded-xl transition-all duration-300 ${isActive ? 'text-[#6c63ff] bg-white/60 shadow-sm border border-white/50' : 'text-gray-500 hover:text-[#6c63ff] hover:bg-white/40'}`}>
            <Grid size={24} strokeWidth={1.5} />
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => `p-3 rounded-xl transition-all duration-300 ${isActive ? 'text-[#6c63ff] bg-white/60 shadow-sm border border-white/50' : 'text-gray-500 hover:text-[#6c63ff] hover:bg-white/40'}`}>
            <Settings size={24} strokeWidth={1.5} />
          </NavLink>
        </nav>
      </div>

      {/* User Profile */}
      <div className="mt-auto">
        <img src="https://i.pravatar.cc/150?img=11" alt="User" className="w-10 h-10 rounded-full border-2 border-white shadow-md object-cover" />
      </div>
    </aside>
  );
};

export default Sidebar;
