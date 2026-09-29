import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Briefcase, Mail, Phone, Calendar, CheckCircle, Activity, Ban, Key, AlertCircle, Copy } from 'lucide-react';
import api from '../../services/api';

export default function AdminTailorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isSuspending, setIsSuspending] = useState(false);
  
  // New states for the Password Reset feature
  const [isResetting, setIsResetting] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get(`/admin/tailors/${id}`);
        setProfileData(response.data);
      } catch (err) {
        console.error("Failed to fetch profile", err);
        setError('Failed to load tailor profile. They may have been deleted.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  const handleSuspendToggle = async () => {
    const action = profileData.tailor.isSuspended ? 'reactivate' : 'suspend';
    if (!window.confirm(`Are you sure you want to ${action} this account?`)) return;

    setIsSuspending(true);
    try {
      const response = await api.put(`/admin/tailors/${profileData.tailor._id}/suspend`);
      setProfileData(prev => ({
        ...prev,
        tailor: { ...prev.tailor, isSuspended: response.data.isSuspended }
      }));
    } catch (err) {
      console.error("Failed to toggle suspension", err);
      alert(err.response?.data?.error || 'Failed to update account status.');
    } finally {
      setIsSuspending(false);
    }
  };

  const handleResetPassword = async () => {
    if (!window.confirm(`Are you sure you want to reset the password for ${profileData.tailor.fullName}? They will be logged out immediately.`)) return;

    setIsResetting(true);
    try {
      const response = await api.put(`/admin/tailors/${profileData.tailor._id}/reset-password`);
      setGeneratedPassword(response.data.newPassword);
    } catch (err) {
      console.error("Failed to reset password", err);
      alert(err.response?.data?.error || 'Failed to reset password.');
    } finally {
      setIsResetting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 font-bold text-gray-500 animate-pulse">Loading Profile Data...</div>;
  }

  if (error || !profileData) {
    return (
      <div className="max-w-3xl mx-auto mt-10 p-6 bg-red-50 text-red-600 rounded-2xl flex flex-col sm:flex-row items-center gap-3 font-bold mx-4">
        <AlertCircle className="w-6 h-6 shrink-0" />
        <span className="text-center sm:text-left">{error || 'Profile not found.'}</span>
        <button onClick={() => navigate('/admin/tailors')} className="sm:ml-auto underline text-sm">Go Back</button>
      </div>
    );
  }

  const { tailor, stats } = profileData;

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans pb-10 relative px-4 sm:px-0">
      <button 
        onClick={() => navigate('/admin/tailors')}
        className="flex items-center text-sm font-bold text-gray-500 hover:text-primary transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Tailors
      </button>

      {/* Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-3xl shrink-0">
          {tailor.fullName?.charAt(0).toUpperCase()}
        </div>
        
        <div className="flex-1 text-center md:text-left w-full">
          <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-3 mb-3">
            <h1 className="text-2xl sm:text-3xl font-black text-brand-dark">{tailor.fullName}</h1>
            
            <div className="flex flex-wrap justify-center gap-2">
              {tailor.plan === 'pro' ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 whitespace-nowrap">
                  <CheckCircle className="w-4 h-4 mr-1" /> PRO ACTIVE
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 whitespace-nowrap">
                  FREE PLAN
                </span>
              )}

              {tailor.isSuspended && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 whitespace-nowrap">
                  <Ban className="w-4 h-4 mr-1" /> SUSPENDED
                </span>
              )}
            </div>
          </div>
          <p className="text-gray-500 font-medium flex items-center justify-center md:justify-start gap-2">
            <Briefcase className="w-4 h-4 shrink-0" /> <span className="truncate">{tailor.businessName || 'Business name not set'}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto mt-4 md:mt-0 shrink-0">
          <button 
            onClick={handleSuspendToggle}
            disabled={isSuspending}
            className={`py-3 md:py-2.5 px-4 font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 flex-1 md:flex-none ${
              tailor.isSuspended 
                ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' 
                : 'bg-red-50 text-red-600 hover:bg-red-100'
            }`}
          >
            {isSuspending ? (
              <span className="animate-pulse">Updating...</span>
            ) : (
              <>
                {tailor.isSuspended ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                {tailor.isSuspended ? 'Reactivate' : 'Suspend'}
              </>
            )}
          </button>
          
          <button 
            onClick={handleResetPassword}
            disabled={isResetting}
            className="py-3 md:py-2.5 px-4 bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 flex-1 md:flex-none"
          >
            <Key className="w-4 h-4" /> {isResetting ? 'Resetting...' : 'Reset Password'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Info Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-brand-dark border-b border-gray-100 pb-4">Contact Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email Address</p>
              <p className="font-semibold text-gray-800 flex items-center gap-2 break-all">
                <Mail className="w-4 h-4 text-gray-400 shrink-0" /> {tailor.email}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Phone Number</p>
              <p className="font-semibold text-gray-800 flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400 shrink-0" /> {tailor.phoneNumber || tailor.phone || 'Not provided'}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Registration Date</p>
              <p className="font-semibold text-gray-800 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400 shrink-0" /> {new Date(tailor.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">System ID</p>
              <p className="font-mono text-[10px] sm:text-sm text-gray-500 bg-gray-50 px-2 py-1 rounded inline-block break-all">
                {tailor._id}
              </p>
            </div>
          </div>
        </div>

        {/* Metrics Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-brand-dark border-b border-gray-100 pb-4">Usage Metrics</h2>
          
          <div className="bg-primary/5 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase">Customers Added</p>
              <p className="text-2xl font-black text-brand-dark">{stats.totalCustomers}</p>
            </div>
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-primary" />
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase">Orders Processed</p>
              <p className="text-2xl font-black text-brand-dark">{stats.totalOrders}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* --- Password Reset Success Modal --- */}
      {generatedPassword && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl text-center mx-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4 mx-auto">
              <Key className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-black text-brand-dark mb-2">Password Reset Successful</h3>
            <p className="text-gray-500 text-sm mb-6">
              Please copy this temporary password and send it to <strong>{tailor.fullName}</strong> securely. You will only see this once.
            </p>
            
            <div className="bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-200 mb-6 flex justify-center items-center gap-4 relative group overflow-hidden">
              <span className="font-mono text-2xl sm:text-3xl font-black tracking-widest text-brand-dark select-all truncate">
                {generatedPassword}
              </span>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(generatedPassword);
                  alert('Password copied to clipboard!');
                }}
                className="absolute right-2 sm:right-4 p-2 bg-white rounded-lg border border-gray-200 text-gray-500 hover:text-primary transition-colors shadow-sm"
                title="Copy to clipboard"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>

            <button 
              onClick={() => setGeneratedPassword('')}
              className="w-full py-3.5 px-4 bg-brand-dark hover:bg-black text-white font-bold rounded-xl transition-colors"
            >
              Done, I've copied it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
