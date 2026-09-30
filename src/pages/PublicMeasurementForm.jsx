import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api'; 
import { Scissors, CheckCircle2, AlertCircle, Ruler, Info } from 'lucide-react';

export default function PublicMeasurementForm() {
  const [searchParams] = useSearchParams();
  
  // Accept both 'token' and 'cid' so existing dashboard links don't break
  const customerToken = searchParams.get('token') || searchParams.get('cid'); 
  const subProfileId = searchParams.get('sid'); 

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  
  const [targetInfo, setTargetInfo] = useState({ name: '', gender: 'Male', relationship: 'Self' });
  const [unit, setUnit] = useState('inches');
  const [measurements, setMeasurements] = useState({});

  useEffect(() => {
    if (!customerToken) {
      setError('Invalid or missing measurement link.');
      setLoading(false);
      return;
    }

    const fetchTargetDetails = async () => {
      try {
        const res = await api.get(`/measurements/public/${customerToken}`);
        const customerData = res.data.customer;
        
        if (subProfileId && customerData.subProfiles) {
          const subProfile = customerData.subProfiles.find(sp => sp._id === subProfileId);
          if (subProfile) {
            setTargetInfo({
              name: subProfile.name,
              gender: subProfile.gender || customerData.gender,
              relationship: subProfile.relationship
            });
          } else {
            setError('Related profile not found.');
          }
        } else {
          setTargetInfo({
            name: customerData.fullName,
            gender: customerData.gender,
            relationship: 'Self'
          });
        }
      } catch (err) {
        setError('This measurement link is invalid or has expired.');
      } finally {
        setLoading(false);
      }
    };

    fetchTargetDetails();
  }, [customerToken, subProfileId]);

  const handleChange = (e) => {
    setMeasurements({ ...measurements, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await api.post(`/measurements/public/${customerToken}`, {
        subProfileId,
        targetType: subProfileId ? 'subProfile' : 'main',
        measurementsData: measurements,
        unit,
        gender: targetInfo.gender
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit measurements. Please check your network and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to format camelCase to Title Case for labels
  const formatLabel = (text) => text.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-bg px-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-brand-dark font-bold animate-pulse">Loading secure form...</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-xl max-w-md w-full text-center border border-gray-100 animate-fade-in">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-100">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-brand-dark mb-3">Measurements Received!</h2>
          <p className="text-gray-600 text-sm font-medium leading-relaxed">
            Thank you, <span className="font-bold text-brand-dark">{targetInfo.name}</span>. Your sizing details have been securely transmitted to your tailor's dashboard.
          </p>
          <p className="text-xs text-gray-400 mt-8 font-semibold uppercase tracking-wider">You may now close this window</p>
        </div>
      </div>
    );
  }

  if (error && !targetInfo.name) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl max-w-md w-full text-center border border-gray-100">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-5 border border-red-100">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-brand-dark mb-2">Link Unavailable</h2>
          <p className="text-gray-600 text-sm font-medium">{error}</p>
        </div>
      </div>
    );
  }

  // Group fields for better UX
  const femaleTopFields = ['shoulder', 'bust', 'underBust', 'waist', 'shoulderToNipple', 'halfLength', 'gownLength', 'armHole', 'sleeveLength'];
  const femaleBottomFields = ['skirtLength', 'trouserLength'];
  
  const maleTopFields = ['neck', 'shoulder', 'chest', 'waist', 'armHole', 'sleeveLength', 'bicep', 'wrist', 'topLength'];
  const maleBottomFields = ['trouserWaist', 'hips', 'thigh', 'knee', 'trouserLength', 'inseam'];

  return (
    <div className="min-h-screen bg-brand-bg py-8 sm:py-12 px-4 font-sans flex flex-col items-center">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        
        {/* Header */}
        <div className="bg-brand-dark px-6 py-8 sm:p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-primary"></div>
          <div className="w-14 h-14 bg-white/10 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/20">
            <Ruler className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight">Secure Sizing Form</h1>
          <p className="text-gray-300 text-sm font-medium flex flex-col sm:flex-row items-center justify-center gap-1">
            <span>Providing details for:</span> 
            <span className="font-bold text-white bg-white/10 px-3 py-1 rounded-full text-xs uppercase tracking-wider ml-1">
              {targetInfo.name} ({targetInfo.relationship})
            </span>
          </p>
        </div>

        <div className="p-6 sm:p-10">
          {error && (
            <div className="mb-8 p-4 bg-red-50 text-red-600 text-sm rounded-2xl border border-red-100 font-bold flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 shrink-0" /> {error}
            </div>
          )}

          <div className="mb-8 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-blue-800 font-medium leading-relaxed">
              Please enter your measurements as accurately as possible. Leave any fields blank if you are unsure or if they do not apply to your desired outfit.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-10">
            
            {/* Unit Selection */}
            <div className="flex justify-between items-center bg-gray-50 p-5 rounded-2xl border border-gray-100">
              <div>
                <span className="block text-sm font-bold text-brand-dark mb-0.5">Measurement Unit</span>
                <span className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Select your preference</span>
              </div>
              <select 
                value={unit} 
                onChange={(e) => setUnit(e.target.value)} 
                className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 font-bold text-brand-dark text-sm cursor-pointer shadow-sm"
              >
                <option value="inches">Inches (in)</option>
                <option value="cm">Centimeters (cm)</option>
              </select>
            </div>

            {targetInfo.gender === 'Female' ? (
              <>
                {/* Female Top */}
                <div className="space-y-5">
                  <div className="border-b-2 border-gray-100 pb-2">
                    <h3 className="text-sm font-black text-primary uppercase tracking-widest">Top / Gown Measurements</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
                    {femaleTopFields.map((field) => (
                      <div key={field}>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{formatLabel(field)}</label>
                        <input type="number" step="0.5" name={field} onChange={handleChange} className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm font-bold text-brand-dark placeholder:text-gray-300 shadow-sm" placeholder="0.0" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Female Bottom */}
                <div className="space-y-5 pt-2">
                  <div className="border-b-2 border-gray-100 pb-2">
                    <h3 className="text-sm font-black text-primary uppercase tracking-widest">Bottom / Skirt Measurements</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
                    {femaleBottomFields.map((field) => (
                      <div key={field}>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{formatLabel(field)}</label>
                        <input type="number" step="0.5" name={field} onChange={handleChange} className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm font-bold text-brand-dark placeholder:text-gray-300 shadow-sm" placeholder="0.0" />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Male Top */}
                <div className="space-y-5">
                  <div className="border-b-2 border-gray-100 pb-2">
                    <h3 className="text-sm font-black text-primary uppercase tracking-widest">Top / Shirt Measurements</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
                    {maleTopFields.map((field) => (
                      <div key={field}>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{formatLabel(field)}</label>
                        <input type="number" step="0.5" name={field} onChange={handleChange} className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm font-bold text-brand-dark placeholder:text-gray-300 shadow-sm" placeholder="0.0" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Male Bottom */}
                <div className="space-y-5 pt-2">
                  <div className="border-b-2 border-gray-100 pb-2">
                    <h3 className="text-sm font-black text-primary uppercase tracking-widest">Bottom / Trouser Measurements</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
                    {maleBottomFields.map((field) => (
                      <div key={field}>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{formatLabel(field)}</label>
                        <input type="number" step="0.5" name={field} onChange={handleChange} className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm font-bold text-brand-dark placeholder:text-gray-300 shadow-sm" placeholder="0.0" />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="pt-6 border-t border-gray-100">
              <button 
                type="submit" 
                disabled={submitting} 
                className="w-full py-4 sm:py-5 bg-brand-dark text-white font-black text-sm sm:text-base uppercase tracking-wider rounded-2xl hover:bg-black transition-all shadow-xl shadow-brand-dark/20 disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Transmitting...
                  </>
                ) : (
                  'Submit Measurements Securely'
                )}
              </button>
            </div>
            
          </form>
        </div>
      </div>
      
      <div className="mt-8 text-center flex items-center justify-center gap-2 text-gray-400">
        <Scissors className="w-4 h-4" />
        <span className="text-xs font-bold uppercase tracking-widest">Powered by TailorPro</span>
      </div>
    </div>
  );
}
