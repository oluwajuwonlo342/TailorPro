import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Scissors, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import api from '../services/api';

const MIN_PASSWORD = 8;
const MAX_PASSWORD = 72;

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [linkInvalid, setLinkInvalid] = useState(false);
  const [error, setError] = useState('');

  // After a successful reset, send the user to the login page
  useEffect(() => {
    if (!done) return undefined;
   const timer = setTimeout(() => navigate('/login', { replace: true, state: { passwordReset: true } }), 4000);
    return () => clearTimeout(timer);
  }, [done, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');

    if (password.length < MIN_PASSWORD || password.length > MAX_PASSWORD) {
      setError(`Password must be between ${MIN_PASSWORD} and ${MAX_PASSWORD} characters.`);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password, confirmPassword });
      setDone(true);
    } catch (err) {
      if (!err.response) {
        setError('Cannot reach the server. Check your internet connection and try again.');
      } else if (err.response.data?.code === 'INVALID_TOKEN') {
        setLinkInvalid(true);
      } else {
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

  const inputClass =
    'w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary';

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center px-4 py-10 font-sans">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-brand-dark text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Scissors className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-brand-dark">Choose a new password</h1>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-6 sm:p-8">
          {done ? (
            <div className="text-center space-y-5">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-brand-dark">Password updated</h2>
                <p className="text-sm text-gray-600 mt-2">
                  You can now log in with your new password. Taking you to the login page...
                </p>
              </div>
              <Link to="/login" className="inline-block w-full py-3.5 bg-brand-dark text-white font-bold text-sm rounded-2xl hover:bg-black transition-all">
                Go to login
              </Link>
            </div>
          ) : linkInvalid ? (
            <div className="text-center space-y-5">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-100">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-brand-dark">Link expired or invalid</h2>
                <p className="text-sm text-gray-600 mt-2">
                  Reset links work once and expire after 30 minutes. Request a new one to continue.
                </p>
              </div>
              <Link to="/forgot-password" className="inline-block w-full py-3.5 bg-brand-dark text-white font-bold text-sm rounded-2xl hover:bg-black transition-all">
                Request a new link
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-xs font-bold rounded-xl border border-red-100 flex items-start" role="alert">
                  <AlertCircle className="w-4 h-4 mr-2 shrink-0 mt-0.5" /> {error}
                </div>
              )}

              <div>
                <label htmlFor="new-password" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">New password</label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoFocus
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className={inputClass}
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

              <div>
                <label htmlFor="confirm-password" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Confirm new password</label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    id="confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Type it again"
                    className={inputClass}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-brand-dark text-white font-bold text-sm rounded-2xl hover:bg-black transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating...' : 'Update password'}
              </button>
            </form>
          )}
        </div>

        {!done && (
          <div className="text-center mt-6">
      <Link to="/login" state={{ passwordReset: true }} className="inline-block w-full py-3.5 bg-brand-dark text-white font-bold text-sm rounded-2xl hover:bg-black transition-all">
  Go to login
</Link>
          </div>
        )}
      </div>
    </div>
  );
}
