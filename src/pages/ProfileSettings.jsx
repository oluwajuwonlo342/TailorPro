import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Store, User, Phone, MapPin, Lock, Save, ArrowLeft, CheckCircle2, Upload, AlertCircle } from 'lucide-react';

export default function ProfileSettings() {
  const { user, setUser } = useAuth() || {};

  const [formData, setFormData] = useState({
    brandName: '',
    fullName: '',
    phone: '',
    address: '',
    newPassword: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [photoError, setPhotoError] = useState('');
  const fileInputRef = useRef(null);

  // Load existing user data into the form
  useEffect(() => {
    if (user) {
      setFormData({
        brandName: user.businessName || user.brandName || '',
        fullName: user.fullName || user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        newPassword: ''
      });
      // Show the saved Cloudinary photo (only when no new local file is pending)
      if (user.profilePhoto && !selectedFile) {
        setPreviewUrl(user.profilePhoto);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Clean up blob URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPhotoError('');

    if (file.size > 2 * 1024 * 1024) {
      setPhotoError('Image size must not exceed 2MB.');
      e.target.value = '';
      return;
    }

    if (!file.type.startsWith('image/')) {
      setPhotoError('Please select a valid image file (JPEG, PNG, WEBP).');
      e.target.value = '';
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage('');
    setPhotoError('');

    try {
      let response;

      if (selectedFile) {
        const payloadData = new FormData();
        payloadData.append('brandName', formData.brandName);
        payloadData.append('fullName', formData.fullName);
        payloadData.append('phone', formData.phone);
        payloadData.append('address', formData.address);
        if (formData.newPassword) {
          payloadData.append('newPassword', formData.newPassword);
        }
        payloadData.append('profilePhoto', selectedFile);

        response = await api.put('/users/profile', payloadData);
      } else {
        const payload = {
          brandName: formData.brandName,
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
        };
        if (formData.newPassword) {
          payload.newPassword = formData.newPassword;
        }

        response = await api.put('/users/profile', payload);
      }

      if (setUser && response.data?.data) {
        setUser((prev) => ({ ...prev, ...response.data.data }));
      }

      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (response.data?.data?.profilePhoto) {
        setPreviewUrl(response.data.data.profilePhoto);
      }

      setSuccessMessage('Profile and brand settings updated successfully!');
      setFormData((prev) => ({ ...prev, newPassword: '' }));
      setTimeout(() => setSuccessMessage(''), 4000);

    } catch (err) {
      console.error('Profile update error details:', err.response || err);
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Failed to update profile settings.';
      alert(`Update Error: ${errorMsg}`);
    } finally {
      setSaving(false);
    }
  };

  const displayName = formData.brandName || formData.fullName || 'T';
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className="space-y-6 sm:space-y-8 font-sans max-w-4xl mx-auto pb-20">

      {/* Back to Dashboard */}
      <Link to="/dashboard" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-primary transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2 shrink-0" /> Back to Dashboard
      </Link>

      {/* Page Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm mt-2 sm:mt-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark">Profile & Brand Settings</h1>
        <p className="text-gray-500 text-sm mt-1 font-medium">Manage your tailoring brand name, contact details, profile photo, and account security.</p>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-4 rounded-2xl text-sm font-bold flex items-center shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 mr-2 shrink-0" /> {successMessage}
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-10 space-y-8">

        {/* Profile Photo Upload Section */}
        <div className="border-b border-gray-100 pb-8">
          <h2 className="text-lg font-black text-brand-dark mb-1">Brand Logo / Profile Photo</h2>
          <p className="text-xs text-gray-500 font-medium mb-5">Upload a clear brand logo. This will appear on your dashboard and customer invoices.</p>

          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden bg-primary/10 border-2 border-primary/20 flex items-center justify-center shrink-0 shadow-sm">
              {previewUrl ? (
                <img src={previewUrl} alt="Profile Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl sm:text-4xl font-black text-primary">{userInitial}</span>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left w-full sm:pt-2">
              <label className="inline-flex items-center justify-center px-6 py-3 bg-gray-50 hover:bg-gray-100 text-brand-dark font-bold text-xs sm:text-sm rounded-xl border border-gray-200 cursor-pointer transition-all shadow-sm w-full sm:w-auto">
                <Upload className="w-4 h-4 mr-2 text-gray-500 shrink-0" /> Choose New Photo
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg, image/png, image/webp"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-3">Supports JPG, PNG or WEBP (Max 2MB)</p>
              {photoError && (
                <p className="text-xs font-bold text-red-600 mt-2 flex items-center justify-center sm:justify-start bg-red-50 p-2 rounded-lg inline-flex">
                  <AlertCircle className="w-4 h-4 mr-1.5 shrink-0" /> {photoError}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Business Information Section */}
        <div className="space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-lg font-black text-brand-dark">Business Information</h2>
            <p className="text-xs text-gray-500 font-medium">This brand name appears on customer WhatsApp messages and invoices.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Brand / Business Name *</label>
              <div className="relative">
                <Store className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text" required name="brandName"
                  value={formData.brandName} onChange={handleChange}
                  placeholder="e.g. Danny Stitches"
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary transition-all font-bold text-brand-dark"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Your Full Name *</label>
              <div className="relative">
                <User className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text" required name="fullName"
                  value={formData.fullName} onChange={handleChange}
                  placeholder="e.g. Awoloro Daniel"
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary transition-all font-bold text-brand-dark"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Business Phone Number</label>
              <div className="relative">
                <Phone className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text" name="phone"
                  value={formData.phone} onChange={handleChange}
                  placeholder="e.g. 08028655278"
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary transition-all font-bold text-brand-dark"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Studio / Shop Address</label>
              <div className="relative">
                <MapPin className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text" name="address"
                  value={formData.address} onChange={handleChange}
                  placeholder="e.g. Ibadan, Nigeria"
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary transition-all font-bold text-brand-dark"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="space-y-6 pt-4 border-t border-gray-100">
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-lg font-black text-brand-dark">Security Settings</h2>
            <p className="text-xs text-gray-500 font-medium">Leave the password field blank if you do not wish to change your current password.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">New Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="password" name="newPassword"
                  value={formData.newPassword} onChange={handleChange}
                  placeholder="••••••••" autoComplete="new-password" minLength={6}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary transition-all font-bold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6 flex items-center justify-end border-t border-gray-100">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-8 py-3.5 bg-primary text-white font-bold rounded-2xl hover:bg-primary-dark disabled:opacity-70 transition-all shadow-md shadow-primary/20 flex items-center justify-center text-sm"
          >
            <Save className="w-5 h-5 mr-2 shrink-0" /> {saving ? 'Saving Changes...' : 'Save Settings'}
          </button>
        </div>

      </form>
    </div>
  );
}
