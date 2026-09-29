import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import api from '../../services/api';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/admin/login', { email, password });
      
      // Save data securely
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
      
      // Navigate to dashboard
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid administrator credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="mx-auto w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4 border border-white/20 backdrop-blur-sm">
          <ShieldCheck className="w-8 h-8 text-white" />
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-white">System Administration</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-4 shadow-2xl sm:rounded-3xl sm:px-10 border border-gray-100">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3 shrink-0" />
              <p className="text-sm font-bold text-red-900">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleAdminLogin}>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Admin Email</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} 
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border rounded-2xl text-sm focus:ring-2 focus:ring-primary" 
                  placeholder="admin@tailorpro.com" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Master Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} 
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border rounded-2xl text-sm focus:ring-2 focus:ring-primary" 
                  placeholder="••••••••••••" />
              </div>
            </div>

            <button type="submit" disabled={loading} 
              className="w-full flex justify-center items-center py-4 px-4 rounded-2xl text-sm font-bold text-white bg-brand-dark hover:bg-black transition-all">
              {loading ? 'Authenticating...' : 'Secure Login'}
              {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}