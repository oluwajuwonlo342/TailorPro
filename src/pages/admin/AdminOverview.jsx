import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, TrendingUp, CheckCircle, CreditCard, ShieldAlert, ArrowRight, Clock } from 'lucide-react';
import api from '../../services/api';

const BADGE_STYLES = {
  PRO: 'bg-emerald-100 text-emerald-700',
  TRIAL: 'bg-blue-100 text-blue-700',
  FREE: 'bg-gray-100 text-gray-600'
};

export default function AdminOverview() {
  const [data, setData] = useState({
    metrics: { totalTailors: 0, proTailors: 0, mrr: 0, collectedThisMonth: 0 },
    recentTailors: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const response = await api.get('/admin/overview');
        setData(response.data);
      } catch (err) {
        console.error("Failed to fetch overview", err);
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  if (loading) {
    return <div className="text-center py-20 font-bold text-gray-500 animate-pulse">Loading Platform Overview...</div>;
  }

  const { metrics, recentTailors } = data;

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans px-3 sm:px-4 lg:px-0 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-dark">Platform Overview</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back. Here is what is happening on TailorPro today.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-status-danger rounded-xl flex items-center text-sm font-bold border border-red-100">
          <ShieldAlert className="w-5 h-5 mr-2 shrink-0" />
          {error}
        </div>
      )}

      {/* Top Metrics Cards (same four numbers as the dashboard) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Registered Tailors</p>
            <h3 className="text-3xl font-black text-brand-dark">{metrics.totalTailors}</h3>
            <p className="text-[11px] font-medium text-gray-400 mt-1">All tailor accounts</p>
          </div>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-blue-50 shrink-0 ml-3">
            <Users className="w-7 h-7 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Active Pro</p>
            <h3 className="text-3xl font-black text-emerald-700">{metrics.proTailors}</h3>
            <p className="text-[11px] font-medium text-gray-400 mt-1">Currently on a paid or granted Pro plan</p>
          </div>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-emerald-50 shrink-0 ml-3">
            <CheckCircle className="w-7 h-7 text-emerald-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Estimated MRR</p>
            <h3 className="text-3xl font-black text-brand-dark truncate">₦{(metrics.mrr || 0).toLocaleString()}</h3>
            <p className="text-[11px] font-medium text-gray-400 mt-1">Active Pro × plan price</p>
          </div>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-primary/10 shrink-0 ml-3">
            <TrendingUp className="w-7 h-7 text-primary" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Collected This Month</p>
            <h3 className="text-3xl font-black text-brand-dark truncate">₦{(metrics.collectedThisMonth || 0).toLocaleString()}</h3>
            <p className="text-[11px] font-medium text-gray-400 mt-1">Actual Paystack payments</p>
          </div>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-amber-50 shrink-0 ml-3">
            <CreditCard className="w-7 h-7 text-amber-600" />
          </div>
        </div>
      </div>

      {/* Recent Registrations Section */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2 text-brand-dark font-extrabold">
            <Clock className="w-5 h-5 text-gray-400" /> Recent Registrations
          </div>
          <button
            onClick={() => navigate('/admin/tailors')}
            className="text-sm font-bold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
          >
            View all <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="p-5 font-bold">Tailor</th>
                <th className="p-5 font-bold">Plan</th>
                <th className="p-5 font-bold">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentTailors.length > 0 ? (
                recentTailors.map((tailor) => {
                  const label = tailor.planLabel || 'FREE';
                  return (
                    <tr key={tailor._id} className="hover:bg-gray-50/80 transition-colors cursor-pointer" onClick={() => navigate(`/admin/tailors/${tailor._id}`)}>
                      <td className="p-5">
                        <p className="font-bold text-brand-dark text-sm">{tailor.fullName}</p>
                        <p className="text-xs text-gray-500">{tailor.businessName || tailor.email}</p>
                      </td>
                      <td className="p-5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${BADGE_STYLES[label]}`}>
                          {label}
                        </span>
                      </td>
                      <td className="p-5 text-sm font-medium text-gray-600">
                        {new Date(tailor.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="3" className="p-12 text-center text-gray-500 text-sm font-medium">
                    No recent registrations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
