import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';

// Auth Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

import LandingPage from './pages/Public/LandingPage';

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard';

// Club Head Pages
import ClubHeadDashboard from './pages/ClubHead/ClubHeadDashboard';

// Student Pages
import StudentDashboard from './pages/Student/StudentDashboard';
import AttendEvent from './pages/Student/AttendEvent';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  const { user } = useContext(AuthContext);

  const getHomeRoute = () => {
    if (!user) return '/'; // Default fallback though shouldn't hit
    if (user.role === 'admin') return '/admin';
    if (user.role === 'club_head') return '/club-head';
    return '/student';
  };

  return (
    <Router>
      <Toaster position="bottom-right" richColors toastOptions={{ style: { fontFamily: 'Inter' } }} />
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {user && <Navbar />}
        <main className={`flex-1 w-full ${user ? 'max-w-7xl mx-auto p-4 sm:p-6 lg:p-8' : ''}`}>
          <Routes>
            {/* Landing Page Route */}
            <Route path="/" element={!user ? <LandingPage /> : <Navigate to={getHomeRoute()} />} />
            
            {/* Public Routes */}
            <Route path="/login" element={!user ? <Login /> : <Navigate to={getHomeRoute()} />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to={getHomeRoute()} />} />

            {/* Admin Routes */}
            <Route path="/admin/*" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            {/* Club Head Routes */}
            <Route path="/club-head/*" element={
              <ProtectedRoute allowedRoles={['club_head']}>
                <ClubHeadDashboard />
              </ProtectedRoute>
            } />

            {/* Student Routes */}
            <Route path="/student/*" element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            } />
            <Route path="/attend/:eventId" element={
              <ProtectedRoute allowedRoles={['student']}>
                <AttendEvent />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
