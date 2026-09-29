import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Scissors, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-brand-bg px-4 font-sans relative overflow-hidden">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md p-10 bg-white rounded-3xl shadow-2xl border border-gray-100 relative z-10">
        
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center w-12 h-12 bg-primary text-white rounded-2xl mb-4 shadow-lg shadow-primary/30">
            <Scissors className="w-6 h-6" />
          </Link>
          <h1 className="text-3xl font-extrabold text-brand-dark">Welcome back</h1>
          <p className="text-gray-500 mt-1 text-sm">Sign in to your TailorPro workspace</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-status-danger text-sm rounded-2xl border border-red-100 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
            <input 
              type="email" required
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <input 
              type="password" required
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full py-4 px-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary-dark focus:ring-4 focus:ring-primary-light transition-all shadow-lg shadow-primary/30 flex items-center justify-center mt-2 disabled:opacity-70"
          >
            {loading ? 'Signing in...' : 'Sign In'} <ArrowRight className="ml-2 w-5 h-5" />
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600">
          Don't have an account? <Link to="/register" className="text-primary font-semibold hover:underline">Start your Free Trial</Link>
        </p>
      </motion.div>
    </div>
  );
}