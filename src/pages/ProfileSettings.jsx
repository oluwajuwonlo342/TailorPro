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

    try {
      let response;

      if (selectedFile) {
        // New photo selected: send multipart FormData.
        // Do NOT set Content-Type manually; Axios adds the boundary itself.
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
        // No new photo: plain JSON
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

      // Merge fresh data into global context so nothing (plan, role...) gets lost
      if (setUser && response.data?.data) {
        setUser((prev) => ({ ...prev, ...response.data.data }));
      }

      // Photo is saved now; clear the pending file so later saves don't re-upload it
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
      alert(`Server Error: ${errorMsg}`);
    } finally {
      setSaving(false);
    }
  };

  const displayName = formData.brandName || formData.fullName || 'T';
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className="space-y-6 font-sans max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

      {/* Back to Dashboard */}
      <div className="pt-4">
        <Link to="/dashboard" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2 shrink-0" /> Back to Dashboard
        </Link>
      </div>

      {/* Page Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm">
        <h1 className="text-xl sm:text-3xl font-extrabold text-brand-dark">Profile & Brand Settings</h1>
        <p className="text-gray-500 text-xs sm:text-sm mt-1">Manage your tailoring brand name, contact details, profile photo, and account security.</p>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-5 py-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center shadow-sm">
          <CheckCircle2 className="w-5 h-5 mr-2 shrink-0" /> {successMessage}
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">

        {/* Profile Photo Upload Section */}
        <div className="border-b border-gray-100 pb-6">
          <h2 className="text-base sm:text-lg font-bold text-brand-dark mb-1">Profile Photo</h2>
          <p className="text-xs text-gray-400 mb-4">Upload a clear brand logo or personal photo. Maximum file size is 2MB.</p>

          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="relative w-20 h-20 rounded-full overflow-hidden bg-primary/10 border-2 border-primary/20 flex items-center justify-center shrink-0 shadow-inner">
              {previewUrl ? (
                <img src={previewUrl} alt="Profile Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-extrabold text-primary">{userInitial}</span>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left w-full">
              <label className="inline-flex items-center justify-center px-5 py-2.5 bg-gray-50 hover:bg-gray-100 text-brand-dark font-bold text-xs rounded-xl border border-gray-200 cursor-pointer transition-all shadow-sm">
                <Upload className="w-4 h-4 mr-2 text-gray-500" /> Choose New Photo
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
              <p className="text-[11px] text-gray-400 mt-2">Supports JPG, PNG or WEBP (Max 2MB)</p>
              {photoError && (
                <p className="text-xs font-bold text-status-danger mt-1 flex items-center justify-center sm:justify-start">
                  <AlertCircle className="w-3.5 h-3.5 mr-1 shrink-0" /> {photoError}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="border-b border-gray-100 pb-4">
          <h2 className="text-base sm:text-lg font-bold text-brand-dark">Business Information</h2>
          <p className="text-xs text-gray-400">This brand name appears on customer WhatsApp messages and invoices.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Brand Name */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">Brand / Business Name</label>
            <div className="relative">
              <Store className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="brandName"
                value={formData.brandName}
                onChange={handleChange}
                placeholder="e.g. Danny Stitches"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary transition-all font-semibold"
                required
              />
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">Your Full Name</label>
            <div className="relative">
              <User className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g. Awoloro Daniel"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary transition-all font-semibold"
                required
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">Business Phone Number</label>
            <div className="relative">
              <Phone className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. 08028655278"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary transition-all font-semibold"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">Studio / Shop Address</label>
            <div className="relative">
              <MapPin className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="e.g. Ibadan, Nigeria"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary transition-all font-semibold"
              />
            </div>
          </div>
        </div>

        <div className="border-b border-gray-100 pt-4 pb-4">
          <h2 className="text-base sm:text-lg font-bold text-brand-dark">Security Settings</h2>
          <p className="text-xs text-gray-400">Leave the password field blank if you do not wish to change your password.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* New Password */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">New Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="new-password"
                minLength={6}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-8 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary-dark disabled:opacity-70 transition-all shadow-md shadow-primary/20 flex items-center justify-center text-sm"
          >
            <Save className="w-5 h-5 mr-2 shrink-0" /> {saving ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>

      </form>

    </div>
  );
}