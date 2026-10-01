import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, Zap, ArrowLeft, Lock } from 'lucide-react';
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
      setError(err.response?.data?.error || 'Failed to start payment process. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg py-12 px-4 sm:px-6 lg:px-8 font-sans flex flex-col justify-center items-center relative overflow-hidden">
      
      {/* Decorative Background Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-[2rem] shadow-2xl border border-gray-100 relative z-10">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate('/dashboard')}
          className="absolute top-6 left-6 text-gray-400 hover:text-brand-dark transition-colors flex items-center gap-1.5 text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </button>

        <div className="text-center pt-6">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary/30">
            <Zap className="w-8 h-8 text-white fill-white" />
          </div>
          <h2 className="text-3xl font-black text-brand-dark tracking-tight">Upgrade to PRO</h2>
          <p className="text-sm text-gray-500 mt-2 font-medium leading-relaxed">
            Unlock unlimited measurements, customer CRM, and advanced order tracking.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold border border-red-100 text-center animate-fade-in">
            {error}
          </div>
        )}

        {/* Pricing Box */}
        <div className="bg-gray-50/80 p-6 rounded-3xl border border-gray-100 text-center space-y-2 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-primary"></div>
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mt-2">Monthly Subscription</p>
          <div className="text-4xl font-black text-brand-dark">₦3,500 <span className="text-sm font-bold text-gray-400">/ mo</span></div>
          <p className="text-[11px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-100 py-1.5 px-4 rounded-full inline-block mt-2 tracking-wide">
            Billed monthly. Cancel anytime.
          </p>
        </div>

        {/* Features List */}
        <div className="space-y-4 py-4 px-2">
          {[
            'Unlimited Customer Records',
            'Advanced Measurement Profiles',
            'Automated Order & Fitting Tracking',
            'Priority Support & Data Backup'
          ].map((feature, idx) => (
            <div key={idx} className="flex items-center gap-3.5 text-sm font-bold text-gray-700">
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0" /> {feature}
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={handlePaystackPayment}
            disabled={loading}
            className="w-full py-4 sm:py-5 px-6 bg-brand-dark hover:bg-black text-white font-black rounded-2xl shadow-xl shadow-brand-dark/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0"></div>
                Initializing Gateway...
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5 text-primary group-hover:scale-110 transition-transform shrink-0" />
                Pay ₦3,500 Securely
              </>
            )}
          </button>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest pt-2">
          <Lock className="w-3 h-3" /> Secured by Paystack
        </div>
      </div>
    </div>
  );
}
