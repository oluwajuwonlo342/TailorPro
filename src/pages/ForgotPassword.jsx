import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Scissors, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../services/api';

const RESEND_SECONDS = 60;

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(0);

  // Countdown before the "resend" button works again
  useEffect(() => {
    if (secondsLeft <= 0) return undefined;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const requestLink = async () => {
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email: email.trim().toLowerCase() });
      setSent(true);
      setSecondsLeft(RESEND_SECONDS);
    } catch (err) {
      if (!err.response) {
        setError('Cannot reach the server. Check your internet connection and try again.');
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!loading) requestLink();
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center px-4 py-10 font-sans">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-brand-dark text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Scissors className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-brand-dark">Forgot your password?</h1>
          <p className="text-sm text-gray-500 mt-2">
            Enter the email you signed up with and we'll send you a link to choose a new one.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-6 sm:p-8">
          {sent ? (
            <div className="text-center space-y-5">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-brand-dark">Check your email</h2>
                <p className="text-sm text-gray-600 mt-2">
                  If an account exists for <span className="font-bold text-brand-dark break-all">{email.trim()}</span>,
                  we've sent a password reset link. It expires in 30 minutes, and it may take a minute to arrive.
                  Check your spam folder too.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-xs font-bold rounded-xl border border-red-100 text-left flex items-start" role="alert">
                  <AlertCircle className="w-4 h-4 mr-2 shrink-0 mt-0.5" /> {error}
                </div>
              )}

              <button
                onClick={requestLink}
                disabled={loading || secondsLeft > 0}
                className="w-full py-3 bg-gray-100 text-brand-dark font-bold text-sm rounded-2xl hover:bg-gray-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : secondsLeft > 0 ? `Resend email in ${secondsLeft}s` : 'Resend email'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-xs font-bold rounded-xl border border-red-100 flex items-start" role="alert">
                  <AlertCircle className="w-4 h-4 mr-2 shrink-0 mt-0.5" /> {error}
                </div>
              )}

              <div>
                <label htmlFor="forgot-email" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Email address</label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    autoFocus
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-brand-dark text-white font-bold text-sm rounded-2xl hover:bg-black transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
            </form>
          )}
        </div>

        <div className="text-center mt-6">
          <Link to="/login" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
