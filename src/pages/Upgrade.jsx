import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ShieldCheck, Zap, ArrowLeft } from 'lucide-react';
import api from '../services/api';

export default function Upgrade() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handlePaystackPayment = async () => {
    setLoading(true);
    setError('');

    try {
      // 1. Initialize transaction on backend
      const response = await api.post('/subscriptions/initialize');
      const { authorization_url, reference } = response.data;

      // 2. Use Paystack PopUp (Inline JS) with a standard callback function
      const handler = window.PaystackPop.setup({
        key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_your_public_key_here',
        email: response.data.email || 'tailor@tailorpro.com', 
        amount: 350000, // ₦3,500 in kobo
        currency: 'NGN',
        reference: reference, 
        
        // Standard function to satisfy Paystack's strict type validation
        callback: function (paystackResponse) {
          api.post('/subscriptions/verify', { reference: paystackResponse.reference })
            .then((verifyRes) => {
              alert(verifyRes.data.message || 'Upgrade successful!');
              navigate('/dashboard');
              window.location.reload(); // Refresh to update user auth context state
            })
            .catch((err) => {
              console.error('Verification failed', err);
              setError('Payment successful, but verification failed. Please contact support.');
            });
        },
        onClose: function () {
          setLoading(false);
        }
      });

      handler.openIframe();
    } catch (err) {
      console.error('Payment initialization error', err);
      setError(err.response?.data?.error || 'Failed to start payment process.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans flex flex-col justify-center items-center">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl shadow-xl border border-gray-100 relative">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate('/dashboard')}
          className="absolute top-6 left-6 text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1 text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </button>

        <div className="text-center pt-4">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
            <Zap className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-black text-brand-dark">Upgrade to PRO</h2>
          <p className="text-sm text-gray-500 mt-1">Unlock unlimited measurements, customer records, and order tracking.</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-100">
            {error}
          </div>
        )}

        {/* Pricing Box */}
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 text-center space-y-2">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Monthly Subscription</p>
          <div className="text-4xl font-black text-brand-dark">₦3,500 <span className="text-sm font-medium text-gray-500">/ month</span></div>
          <p className="text-xs text-emerald-600 font-bold bg-emerald-50 py-1 px-3 rounded-full inline-block mt-1">Billed monthly. Cancel anytime.</p>
        </div>

        {/* Features List */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" /> Unlimited Customer Records
          </div>
          <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" /> Advanced Measurement Profiles
          </div>
          <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" /> Automated Order & Fitting Tracking
          </div>
          <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" /> Priority Support & Data Backup
          </div>
        </div>

        {/* Action Button */}
        <div>
          <button
            onClick={handlePaystackPayment}
            disabled={loading}
            className="w-full py-4 px-6 bg-brand-dark hover:bg-black text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <ShieldCheck className="w-5 h-5 text-primary" />
            {loading ? 'Processing Payment...' : 'Pay ₦3,500 Securely'}
          </button>
        </div>

        <p className="text-center text-[10px] text-gray-400 uppercase tracking-widest">
          Secured by Paystack • Instant Activation
        </p>
      </div>
    </div>
  );
}