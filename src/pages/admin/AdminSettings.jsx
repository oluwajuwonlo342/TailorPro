import { useState, useEffect } from 'react';
import { User, Lock, Mail, ShieldCheck, Save, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../../services/api';

export default function AdminSettings() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch current admin details to pre-fill the form
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await api.get('/auth/me'); // Using your existing getMe route
        setFormData(prev => ({
          ...prev,
          fullName: response.data.data.fullName || '',
          email: response.data.data.email || ''
        }));
      } catch (err) {
        console.error("Failed to load admin data", err);
        setMessage({ type: 'error', text: 'Failed to load profile data.' });
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage({ type: '', text: '' }); // Clear messages on type
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password && formData.password !== formData.confirmPassword) {
      return setMessage({ type: 'error', text: 'Passwords do not match.' });
    }

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
      };
      
      if (formData.password) {
        payload.password = formData.password;
      }

      await api.put('/admin/settings/profile', payload);
      
      setMessage({ type: 'success', text: 'Admin profile updated successfully.' });
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' })); // Clear password fields
    } catch (err) {
      console.error("Failed to update profile", err);
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 font-bold text-gray-500 animate-pulse">Loading Settings...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans pb-10">
      <div>
        <h1 className="text-2xl font-extrabold text-brand-dark">System Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your Super Admin credentials and platform configurations.</p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl flex items-center text-sm font-bold border ${message.type === 'error' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
          {message.type === 'error' ? <AlertCircle className="w-5 h-5 mr-2 shrink-0" /> : <CheckCircle className="w-5 h-5 mr-2 shrink-0" />}
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-primary" />
          <h2 className="text-lg font-bold text-brand-dark">Super Admin Profile</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary transition-all font-medium"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary transition-all font-medium"
                />
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-brand-dark">Change Password (Optional)</h3>
            <p className="text-xs text-gray-500">Leave these fields blank if you do not want to change your password.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* New Password */}
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    name="password"
                    placeholder="New Password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary transition-all font-medium"
                  />
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm New Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary transition-all font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="py-3 px-6 bg-brand-dark hover:bg-black text-white font-bold rounded-xl transition-colors flex items-center gap-2 disabled:opacity-70"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving Changes...' : 'Save Profile Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}