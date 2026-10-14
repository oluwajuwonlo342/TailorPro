import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setUser } = useAuth() || {};

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/admin/login', {
        email: email.trim().toLowerCase(),
        password
      });

      // Works with both response shapes: { token, data: {...} } and { token, ...fields }
      const { token, data } = response.data;
      const admin = data || response.data;

      // Never keep a session for an account that isn't an administrator
      if (!token || admin.role !== 'admin') {
        setError('Invalid administrator credentials.');
        return;
      }

      const adminUser = {
        _id: admin._id || admin.id,
        fullName: admin.fullName || 'Super Admin',
        email: admin.email,
        role: admin.role
      };

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(adminUser)); // no token copy stored here
      if (setUser) setUser(adminUser); // so route guards see the admin straight away

      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      if (!err.response) {
        setError('Cannot reach the server. Check your internet connection and try again.');
      } else if (err.response.status === 401) {
        setError('Invalid administrator credentials.');
      } else {
        // Rate limit, suspended account, server problem, etc.: show what the server said
        setError(
          err.response.data?.error ||
          err.response.data?.message ||
          'Something went wrong. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="mx-auto w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4 border border-white/20 backdrop-blur-sm">
          <ShieldCheck className="w-8 h-8 text-white" />
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-white">System Administration</h2>
        <p className="mt-2 text-center text-sm text-gray-400">TailorPro Super Admin Gateway</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-5 sm:px-10 shadow-2xl rounded-3xl border border-gray-100">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl flex items-start" role="alert">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3 shrink-0" />
              <p className="text-sm font-bold text-red-900">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleAdminLogin}>
            <div>
              <label htmlFor="admin-email" className="block text-xs font-bold text-gray-700 uppercase mb-2">Admin Email</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  required
                  autoFocus
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary"
                  placeholder="admin@tailorpro.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="admin-password" className="block text-xs font-bold text-gray-700 uppercase mb-2">Master Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary"
                  placeholder="••••••••••••"
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
              className="w-full flex justify-center items-center py-4 px-4 rounded-2xl text-sm font-bold text-white bg-brand-dark hover:bg-black transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Authenticating...' : 'Secure Login'}
              {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
