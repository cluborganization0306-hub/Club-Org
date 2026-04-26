import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User as UserIcon } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-[#2e1065] shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-4 hover-lift">
              <img src="/images/dkte-logo.png" alt="DKTE Logo" className="h-10 w-auto bg-white rounded-lg p-1 shadow-md object-contain" />
              <span className="font-extrabold text-2xl text-white tracking-tight">DKTE Campus Portal</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 text-sm text-white bg-white/10 border border-white/20 shadow-sm px-5 py-2.5 rounded-full backdrop-blur-sm">
              <UserIcon size={18} className="text-white" />
              <span className="font-bold text-base">{user?.name || 'User'}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white text-[#2e1065] px-3 py-1 rounded-full ml-2 shadow-sm">
                {user?.role.replace('_', ' ')}
              </span>
            </div>
            
            <button
              onClick={handleLogout}
              className="p-3 text-white/80 hover:text-white bg-white/5 hover:bg-white/20 border border-transparent hover:border-white/30 transition-all duration-300 rounded-xl"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
