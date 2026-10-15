import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Scissors, ArrowRight, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Set by the reset-password page after a successful password change
  const justReset = Boolean(location.state?.passwordReset);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError('');
    setLoading(true);

    try {
      await login(email.trim().toLowerCase(), password);
      navigate('/dashboard');
    } catch (err) {
      if (!err.response) {
        setError('Cannot reach the server. Check your internet connection and try again.');
      } else {
        // Wrong credentials, suspended account, too many attempts, etc.
        setError(
          err.response.data?.error ||
          err.response.data?.message ||
          'Failed to login. Please check your credentials.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-brand-bg px-4 font-sans relative overflow-hidden">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md p-6 sm:p-10 bg-white rounded-3xl shadow-2xl border border-gray-100 relative z-10">

        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center w-12 h-12 bg-primary text-white rounded-2xl mb-4 shadow-lg shadow-primary/30">
            <Scissors className="w-6 h-6" />
          </Link>
          <h1 className="text-3xl font-extrabold text-brand-dark">Welcome back</h1>
          <p className="text-gray-500 mt-1 text-sm">Sign in to your TailorPro workspace</p>
        </div>

        {justReset && !error && (
          <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 text-sm rounded-2xl border border-emerald-100 font-medium flex items-start" role="status">
            <CheckCircle2 className="w-5 h-5 mr-2 shrink-0" />
            Your password has been updated. Sign in with your new password.
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-status-danger text-sm rounded-2xl border border-red-100 font-medium" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
            <input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="login-password" className="block text-sm font-medium text-gray-700">Password</label>
              <Link
                to="/forgot-password"
                state={{ email }}
                className="text-sm font-semibold text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                className="w-full px-4 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary-dark focus:ring-4 focus:ring-primary-light transition-all shadow-lg shadow-primary/30 flex items-center justify-center mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
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
