import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api'; // Use your dynamic API instance instead of hardcoded localhost
import { Scissors, CheckCircle2 } from 'lucide-react';

export default function PublicMeasurementForm() {
  const [searchParams] = useSearchParams();
  
  // FIX: Accept both 'token' and 'cid' so existing dashboard links don't break
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
        // Use your configured 'api' instance so it works on both localhost and Render
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
            setError('Sub-profile not found.');
          }
        } else {
          setTargetInfo({
            name: customerData.fullName,
            gender: customerData.gender,
            relationship: 'Self'
          });
        }
      } catch (err) {
        setError('Invalid or expired measurement link.');
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
      setError(err.response?.data?.error || 'Failed to submit measurements. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-brand-bg"><p className="text-primary font-semibold animate-pulse">Loading measurement form...</p></div>;

  if (submitted) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4 font-sans">
        <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-status-success/10 text-status-success rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-brand-dark mb-2">Measurements Submitted!</h2>
          <p className="text-gray-600 text-sm">Thank you, {targetInfo.name}. Your measurements have been securely sent to your tailor.</p>
        </div>
      </div>
    );
  }

  if (error && !targetInfo.name) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4 font-sans">
        <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full text-center text-red-600 font-bold">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg py-12 px-4 font-sans">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-primary/30">
            <Scissors className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-brand-dark">TailorPro Measurement Form</h1>
          <p className="text-gray-500 text-sm mt-1">Providing measurements for: <span className="font-bold text-primary">{targetInfo.name}</span> ({targetInfo.relationship || 'Client'})</p>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 text-status-danger text-sm rounded-xl font-bold">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl">
            <span className="text-sm font-semibold text-gray-700">Measurement Unit</span>
            <select value={unit} onChange={(e) => setUnit(e.target.value)} className="px-4 py-2 bg-white border border-gray-200 rounded-xl outline-none font-medium text-sm">
              <option value="inches">Inches (in)</option>
              <option value="cm">Centimeters (cm)</option>
            </select>
          </div>

          {targetInfo.gender === 'Female' ? (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Female Measurements</h3>
              <div className="grid grid-cols-2 gap-4">
                {['shoulder', 'bust', 'underBust', 'waist', 'shoulderToNipple', 'halfLength', 'gownLength', 'armHole', 'sleeveLength', 'skirtLength', 'trouserLength'].map((field) => (
                  <div key={field}>
                    <label className="block text-xs font-semibold text-gray-500 mb-1 capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
                    <input type="number" step="0.5" name={field} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-primary transition-all text-sm" placeholder="0.0" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Male / Standard Measurements</h3>
              <div className="grid grid-cols-2 gap-4">
                {['neck', 'shoulder', 'chest', 'waist', 'armHole', 'sleeveLength', 'bicep', 'wrist', 'topLength', 'trouserWaist', 'hips', 'thigh', 'knee', 'trouserLength', 'inseam'].map((field) => (
                  <div key={field}>
                    <label className="block text-xs font-semibold text-gray-500 mb-1 capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
                    <input type="number" step="0.5" name={field} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-primary transition-all text-sm" placeholder="0.0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          <button type="submit" disabled={submitting} className="w-full py-4 bg-brand-dark text-white font-bold rounded-2xl hover:bg-black transition-all shadow-lg shadow-black/10 disabled:opacity-50 mt-6">
            {submitting ? 'Submitting...' : 'Submit Measurements Securely'}
          </button>
        </form>
      </div>
    </div>
  );
}
