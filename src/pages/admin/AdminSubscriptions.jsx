import { useState, useEffect } from 'react';
import { TrendingUp, Users, Search, ShieldAlert, CheckCircle, XCircle } from 'lucide-react';
import api from '../../services/api';

export default function AdminSubscriptions() {
  const [data, setData] = useState({ metrics: { totalPro: 0, totalFree: 0, monthlyRevenue: 0 }, subscribers: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const response = await api.get('/admin/subscriptions');
        setData(response.data);
      } catch (err) {
        console.error("Failed to fetch subscriptions", err);
        setError('Failed to load subscription data.');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  const handleTogglePro = async (userId, currentPlan, fullName) => {
    const actionText = currentPlan === 'pro' ? 'revoke PRO access from' : 'grant PRO access to';
    if (!window.confirm(`Are you sure you want to ${actionText} ${fullName}?`)) return;

    setTogglingId(userId);
    try {
      const response = await api.put(`/admin/subscriptions/${userId}/toggle`);
      
      setData(prevData => {
        // Update the specific user's status
        const updatedSubscribers = prevData.subscribers.map(sub => 
          sub._id === userId 
            ? { ...sub, plan: response.data.plan, subscriptionStatus: response.data.subscriptionStatus } 
            : sub
        );
        
        // Dynamically recalculate the top metrics
        const totalPro = updatedSubscribers.filter(s => s.plan === 'pro').length;
        const totalFree = updatedSubscribers.filter(s => s.plan === 'free').length;
        const monthlyRevenue = totalPro * 3500;

        return {
          metrics: { totalPro, totalFree, monthlyRevenue },
          subscribers: updatedSubscribers
        };
      });
    } catch (err) {
      console.error("Toggle error", err);
      alert(err.response?.data?.error || "Failed to update subscription status");
    } finally {
      setTogglingId(null);
    }
  };

  const filteredSubscribers = data.subscribers.filter(sub => 
    sub.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.businessName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-20 font-bold text-gray-500 animate-pulse">Loading Financial Data...</div>;
  }

  const { metrics } = data;

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-dark">Subscriptions & Revenue</h1>
          <p className="text-gray-500 text-sm mt-1">Track PRO plan upgrades and estimated monthly recurring revenue.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-status-danger rounded-xl flex items-center text-sm font-bold border border-red-100">
          <ShieldAlert className="w-5 h-5 mr-2 shrink-0" />
          {error}
        </div>
      )}

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between transition-all">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Monthly Revenue (MRR)</p>
            <h3 className="text-3xl font-black text-brand-dark">₦{metrics.monthlyRevenue.toLocaleString()}</h3>
          </div>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-primary/10">
            <TrendingUp className="w-7 h-7 text-primary" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between transition-all">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Active PRO Tailors</p>
            <h3 className="text-3xl font-black text-emerald-700">{metrics.totalPro}</h3>
          </div>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-emerald-50">
            <CheckCircle className="w-7 h-7 text-emerald-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between transition-all">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Free / Trial Users</p>
            <h3 className="text-3xl font-black text-gray-700">{metrics.totalFree}</h3>
          </div>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gray-100">
            <Users className="w-7 h-7 text-gray-500" />
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center">
        <div className="relative w-full sm:w-96">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search tailors or business names..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary transition-all font-medium"
          />
        </div>
      </div>

      {/* Subscriber Data Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden pb-16">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-5 font-bold">Tailor</th>
                <th className="p-5 font-bold">Plan Status</th>
                <th className="p-5 font-bold">Billing Details</th>
                <th className="p-5 font-bold text-center">Manual Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSubscribers.length > 0 ? (
                filteredSubscribers.map((sub) => (
                  <tr key={sub._id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-5">
                      <p className="font-bold text-brand-dark text-sm">{sub.fullName}</p>
                      <p className="text-xs text-gray-500">{sub.businessName || sub.email}</p>
                    </td>
                    <td className="p-5">
                      {sub.plan === 'pro' ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                          <CheckCircle className="w-3 h-3 mr-1" /> PRO PLAN
                        </span>
                      ) : sub.subscriptionStatus === 'trial' ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                          14-DAY TRIAL
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                          <XCircle className="w-3 h-3 mr-1" /> FREE PLAN
                        </span>
                      )}
                    </td>
                    <td className="p-5 text-sm font-medium text-gray-600">
                      {sub.plan === 'pro' 
                        ? 'Active Recurring Billing' 
                        : sub.subscriptionStatus === 'trial' 
                          ? `Ends ${new Date(sub.trialEnd).toLocaleDateString()}` 
                          : 'No active billing'}
                    </td>
                    <td className="p-5 text-center">
                      <button 
                        disabled={togglingId === sub._id}
                        onClick={() => handleTogglePro(sub._id, sub.plan, sub.fullName)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                          togglingId === sub._id 
                            ? 'bg-gray-100 text-gray-400 cursor-wait'
                            : sub.plan === 'pro' 
                              ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                              : 'bg-primary/10 text-primary hover:bg-primary/20'
                        }`}
                      >
                        {togglingId === sub._id ? 'Updating...' : sub.plan === 'pro' ? 'Revoke PRO' : 'Grant PRO'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-12 text-center text-gray-500 text-sm font-medium">
                    No subscriptions found.
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
