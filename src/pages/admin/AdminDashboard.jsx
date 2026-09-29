import { useState, useEffect } from 'react';
import { Users, CreditCard, Activity, ArrowUpRight, AlertCircle } from 'lucide-react';
import api from '../../services/api'; // Import your unified Axios instance

export default function AdminDashboard() {
  // Added recentTailors array to the initial state
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
        // Interceptor handles the token automatically
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
    { label: 'Total Registered Tailors', value: stats.totalTailors, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Pro Subscriptions', value: stats.activeSubscriptions, icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Platform Revenue (MTD)', value: `₦${stats.revenue.toLocaleString()}`, icon: Activity, color: 'text-primary', bg: 'bg-primary/10' },
  ];

  if (loading) {
    return <div className="text-center py-10 font-bold text-gray-500 animate-pulse">Loading Platform Data...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-dark">Platform Overview</h1>
          <p className="text-gray-500 text-sm mt-1">Real-time metrics for the TailorPro ecosystem.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-status-danger rounded-xl flex items-center text-sm font-bold border border-red-100">
          <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black text-brand-dark">{stat.value}</h3>
            </div>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bg}`}>
              <stat.icon className={`w-7 h-7 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Dynamic Recent Tailor Registrations Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-brand-dark">Recent Tailor Registrations</h2>
          <button className="text-sm font-bold text-primary flex items-center hover:text-primary-dark transition-colors">
            View All <ArrowUpRight className="w-4 h-4 ml-1" />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold">Tailor Name</th>
                <th className="p-4 font-bold">Business</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats.recentTailors && stats.recentTailors.length > 0 ? (
                stats.recentTailors.map((tailor) => (
                  <tr key={tailor._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-brand-dark text-sm">{tailor.fullName}</p>
                      <p className="text-xs text-gray-500">{tailor.email}</p>
                    </td>
                    <td className="p-4 text-sm font-semibold text-gray-700">
                      {tailor.businessName || 'N/A'}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        tailor.subscriptionStatus === 'pro' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {tailor.subscriptionStatus === 'pro' ? 'PRO' : 'FREE'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-500 font-medium">
                      {new Date(tailor.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-500 text-sm">
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