import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const AttendEvent = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { getAuthHeaders, user } = useContext(AuthContext);
  
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('Verifying your attendance...');

  useEffect(() => {
    if (!user) {
      setStatus('error');
      setMessage('You must be logged in to mark attendance.');
      return;
    }
    if (user.role !== 'student') {
      setStatus('error');
      setMessage('Only students can mark attendance via QR code.');
      return;
    }
    
    markAttendance();
  }, [user, eventId]);

  const markAttendance = async () => {
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/events/${eventId}/attend`, {}, {
        headers: getAuthHeaders()
      });
      setStatus('success');
      setMessage(res.data.message || 'Successfully marked attendance!');
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Failed to mark attendance.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fe] p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center"
      >
        <div className="flex justify-center mb-6">
          {status === 'loading' && <Loader2 className="animate-spin text-indigo-500" size={64} />}
          {status === 'success' && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
              <CheckCircle className="text-green-500" size={80} />
            </motion.div>
          )}
          {status === 'error' && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
              <XCircle className="text-red-500" size={80} />
            </motion.div>
          )}
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {status === 'loading' ? 'Processing...' : status === 'success' ? 'Attendance Confirmed!' : 'Attendance Failed'}
        </h2>
        <p className="text-gray-600 mb-8">{message}</p>
        
        <button 
          onClick={() => navigate('/student')}
          className="w-full mockup-btn py-3 text-lg"
        >
          Return to Dashboard
        </button>
      </motion.div>
    </div>
  );
};

export default AttendEvent;
