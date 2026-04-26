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
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                CO
              </div>
              <span className="font-bold text-xl text-gray-900 hidden sm:block">Club Organizer</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
              <UserIcon size={16} />
              <span className="font-medium">{user?.name}</span>
              <span className="text-xs uppercase bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full ml-2">
                {user?.role.replace('_', ' ')}
              </span>
            </div>
            
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
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
