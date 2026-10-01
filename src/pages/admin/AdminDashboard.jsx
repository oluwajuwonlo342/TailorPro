import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, CreditCard, Activity, ArrowUpRight, AlertCircle, Zap } from 'lucide-react';
import api from '../../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ 
    totalTailors: 0, 
    activeSubscriptions: 0, 
    revenue: 0,
    recentTailors: [] 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/admin/dashboard-stats');
        setStats(response.data);
      } catch (err) {
        console.error("Failed to fetch admin stats", err);
        setError('Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    { label: 'Registered Tailors', value: stats.totalTailors, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { label: 'Pro Subscriptions', value: stats.activeSubscriptions, icon: Zap, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { label: 'Platform Revenue (MTD)', value: `₦${stats.revenue.toLocaleString()}`, icon: Activity, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
  ];

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <div className="text-gray-500 font-bold text-sm tracking-wide">Loading Platform Data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 font-sans px-4 sm:px-6 lg:px-8 pb-20 pt-4 sm:pt-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark tracking-tight">Platform Overview</h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">Real-time metrics and growth for the TailorPro ecosystem.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-2xl flex items-center text-sm font-bold border border-red-100 shadow-sm animate-fade-in">
          <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
          {error}
        </div>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow group">
            <div>
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{stat.label}</p>
              <h3 className="text-3xl sm:text-4xl font-black text-brand-dark">{stat.value}</h3>
            </div>
            <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center border ${stat.bg} ${stat.border} group-hover:scale-110 transition-transform duration-300 shadow-inner shrink-0`}>
              <stat.icon className={`w-7 h-7 sm:w-8 sm:h-8 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Dynamic Recent Tailor Registrations Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 sm:p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 className="text-lg sm:text-xl font-extrabold text-brand-dark">Recent Tailor Registrations</h2>
          <Link to="/admin/tailors" className="text-xs sm:text-sm font-bold text-primary flex items-center hover:text-primary-dark hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-colors">
            View All <ArrowUpRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-white border-b border-gray-100 text-gray-400 text-[11px] uppercase tracking-widest">
                <th className="p-5 font-black">Tailor Name</th>
                <th className="p-5 font-black">Business</th>
                <th className="p-5 font-black">Status</th>
                <th className="p-5 font-black">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats.recentTailors && stats.recentTailors.length > 0 ? (
                stats.recentTailors.map((tailor) => {
                  const initial = tailor.fullName ? tailor.fullName.charAt(0).toUpperCase() : 'T';
                  const isPro = tailor.subscriptionStatus === 'pro';

                  return (
                    <tr key={tailor._id} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="p-5 flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-brand-dark text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                          {initial}
                        </div>
                        <div>
                          <p className="font-extrabold text-brand-dark text-sm">{tailor.fullName}</p>
                          <p className="text-xs font-medium text-gray-500 mt-0.5">{tailor.email}</p>
                        </div>
                      </td>
                      <td className="p-5 text-sm font-bold text-gray-700">
                        {tailor.businessName || <span className="text-gray-400 italic">Not specified</span>}
                      </td>
                      <td className="p-5">
                        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                          isPro 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-gray-100 text-gray-600 border-gray-200'
                        }`}>
                          {isPro ? 'PRO PLAN' : 'FREE PLAN'}
                        </span>
                      </td>
                      <td className="p-5 text-sm text-gray-500 font-bold">
                        {new Date(tailor.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <Users className="w-12 h-12 mb-3 text-gray-200" />
                      <p className="text-sm font-bold text-brand-dark mb-1">No recent registrations</p>
                      <p className="text-xs font-medium">New tailor signups will appear here.</p>
                    </div>
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
