import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User as UserIcon, Home, Bell, MessageSquare } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };


  return (
    <nav className="bg-[#2e1065] shadow-md sticky top-0 z-50 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex-shrink-0 flex items-center gap-4 hover-lift">
              <img src="/images/dkte-logo.png" alt="DKTE Logo" className="h-10 w-auto bg-white rounded-lg p-1 shadow-md object-contain" />
              <span className="font-extrabold text-xl text-white tracking-tight hidden sm:block">DKTE Campus Portal</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 text-white/90 hover:text-white font-semibold transition-colors bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm border border-white/10">
              <Home size={16} />
              Home
            </Link>
            
            {user ? (
              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-4 ml-2">
                  <button className="relative p-2 text-white/80 hover:text-white transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-pink-500 rounded-full border border-[#2e1065]"></span>
                  </button>
                  <button className="p-2 text-white/80 hover:text-white transition-colors">
                    <MessageSquare size={20} />
                  </button>
                </div>
                
                <div className="flex items-center gap-3 text-sm text-[#2e1065] bg-white px-4 py-2 rounded-full shadow-sm ml-2">
                  <span className="font-bold">{user?.name || 'User'}</span>
                  <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-[#2e1065] px-2 py-0.5 rounded-full shadow-sm">
                    {user?.role.replace('_', ' ')}
                  </span>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 transition-all duration-300 rounded-full ml-1"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
