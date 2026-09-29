import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Scissors, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    businessName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match.');
    }

    setLoading(true);

    try {
      // Call backend registration endpoint
      const response = await api.post('/auth/register', {
        fullName: formData.fullName,
        businessName: formData.businessName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });

      // Save token and route to dashboard
      localStorage.setItem('token', response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="sm:mx-auto sm:w-full sm:max-w-md text-center"
      >
        <Link to="/" className="inline-flex items-center justify-center w-12 h-12 bg-primary text-white rounded-2xl mb-4 shadow-lg shadow-primary/30">
          <Scissors className="w-6 h-6" />
        </Link>
        <h2 className="text-3xl font-extrabold text-brand-dark">Create your TailorPro account</h2>
        <p className="mt-2 text-sm text-gray-600">
          Start your 14-day free Pro trial. No credit card required.
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.1 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="bg-white py-8 px-6 shadow-xl sm:rounded-3xl border border-gray-100 sm:px-10">
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-status-danger text-sm rounded-xl border border-red-100 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input 
                type="text" 
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                placeholder="Amina Bello"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fashion Brand / Business Name</label>
              <input 
                type="text" 
                name="businessName"
                required
                value={formData.businessName}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                placeholder="Amina Stitches"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input 
                type="email" 
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                placeholder="amina@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input 
                type="tel" 
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                placeholder="+234 800 000 0000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input 
                type="password" 
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input 
                type="password" 
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 px-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark focus:ring-4 focus:ring-primary-light transition-all shadow-lg shadow-primary/30 flex items-center justify-center mt-4 disabled:opacity-70"
            >
              {loading ? 'Creating workspace...' : 'Get Started Free'} <ArrowRight className="ml-2 w-5 h-5" />
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}