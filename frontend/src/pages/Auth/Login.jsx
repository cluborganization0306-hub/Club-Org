import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { LogIn, User } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(email.trim().toLowerCase(), password);
    if (!res.success) {
      setError(res.message);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center animate-fade-in relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-10 w-64 h-64 bg-brand-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 right-10 w-64 h-64 bg-brand-secondary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-64 h-64 bg-brand-accent/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-md p-8 rounded-2xl glass-card relative z-10">
        <div className="text-center mb-8">
          <div className="mx-auto w-14 h-14 bg-gradient-to-br from-brand-primary to-brand-accent rounded-2xl flex items-center justify-center text-white mb-5 shadow-lg shadow-brand-primary/30 transform transition-transform hover:scale-105">
            <LogIn size={28} />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome Back</h2>
          <p className="text-gray-500 mt-2">Sign in to your account to continue</p>
        </div>

        {error && (
          <div className="bg-red-50/80 backdrop-blur-sm text-red-600 p-3 rounded-lg mb-6 text-sm font-medium border border-red-100 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
            <div className="relative">
              <input
                type="email"
                required
                className="w-full pl-4 pr-4 py-2.5 bg-white/50 border border-gray-200 rounded-xl input-ring"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-2.5 bg-white/50 border border-gray-200 rounded-xl input-ring"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-brand-primary to-brand-accent text-white font-bold py-3 rounded-xl hover-lift shadow-md hover:shadow-brand-primary/30 mt-2"
          >
            Sign In
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600 font-medium">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-primary hover:text-brand-accent transition-colors">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
