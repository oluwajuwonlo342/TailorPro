import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Search, CreditCard, TrendingUp, AlertCircle, MessageCircle, CheckCircle2, Wallet, ArrowLeft } from 'lucide-react';

export default function Payments() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All'); // All, Fully Paid, Outstanding

  useEffect(() => {
    const fetchFinancials = async () => {
      try {
        const response = await api.get('/orders');
        setOrders(response.data.data);
      } catch (err) {
        console.error("Failed to fetch payment data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFinancials();
  }, []);

  // Calculate Global Financial Metrics
  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.amountPaid || 0), 0);
  const totalOutstanding = orders.reduce((sum, order) => {
    const total = Number(order.totalAmount || 0);
    const paid = Number(order.amountPaid || 0);
    return sum + (total - paid);
  }, 0);

  // Filter Logic
  const filteredLedger = orders.filter(order => {
    const total = Number(order.totalAmount || 0);
    const paid = Number(order.amountPaid || 0);
    const balance = total - paid;
    
    const matchesSearch = 
      order.customer?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.outfitName?.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === 'Fully Paid') return matchesSearch && balance <= 0;
    if (filter === 'Outstanding') return matchesSearch && balance > 0;
    return matchesSearch;
  });

  const handleSendReminder = (order) => {
    const customerName = order.customer?.fullName || 'Valued Customer';
    const phone = order.customer?.phone || '';
    const total = Number(order.totalAmount || 0);
    const paid = Number(order.amountPaid || 0);
    const balance = total - paid;

    if (balance <= 0) {
      alert("This customer has fully paid!");
      return;
    }

    const message = encodeURIComponent(`Hello ${customerName}, this is a gentle reminder regarding your outfit (${order.outfitName}). You have an outstanding balance of ₦${balance.toLocaleString()}. Please let us know when you plan to clear this. Thank you!`);
    window.open(`https://wa.me/${phone ? phone.replace(/[^0-9]/g, '') : ''}?text=${message}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-primary font-semibold text-lg animate-pulse">Loading financials...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans max-w-7xl mx-auto pb-20">
      
      {/* Back to Dashboard Link */}
      <Link to="/dashboard" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-primary transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </Link>
      
      {/* Page Header */}
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm mt-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark">Payments & Financials</h1>
        <p className="text-gray-500 text-sm mt-1">Monitor revenue, track outstanding balances, and send payment reminders.</p>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue Card */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center space-x-5">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center">
            <TrendingUp className="w-7 h-7 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Total Revenue Collected</p>
            <h2 className="text-3xl font-extrabold text-brand-dark">₦{totalRevenue.toLocaleString()}</h2>
          </div>
        </div>

        {/* Outstanding Debt Card */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center space-x-5">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
            <AlertCircle className="w-7 h-7 text-status-danger" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Total Outstanding</p>
            <h2 className="text-3xl font-extrabold text-status-danger">₦{totalOutstanding.toLocaleString()}</h2>
          </div>
        </div>
      </div>

      {/* Controls: Search & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="Search customer or outfit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary transition-all"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0">
          {['All', 'Fully Paid', 'Outstanding'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                filter === f 
                  ? 'bg-brand-dark text-white shadow-md' 
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Financial Ledger Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
                <th className="p-5">Customer & Outfit</th>
                <th className="p-5">Total Billed</th>
                <th className="p-5">Amount Paid</th>
                <th className="p-5">Balance</th>
                <th className="p-5">Status</th>
                <th className="p-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredLedger.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-400 text-sm">
                    No payment records found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredLedger.map(order => {
                  const total = Number(order.totalAmount || 0);
                  const paid = Number(order.amountPaid || 0);
                  const balance = total - paid;
                  const isFullyPaid = balance <= 0;

                  return (
                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-5">
                        <p className="font-extrabold text-brand-dark text-sm">{order.customer?.fullName || 'Walk-in Client'}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{order.outfitName}</p>
                      </td>
                      <td className="p-5 font-bold text-gray-600 text-sm">₦{total.toLocaleString()}</td>
                      <td className="p-5 font-bold text-emerald-600 text-sm">₦{paid.toLocaleString()}</td>
                      <td className="p-5">
                        <span className={`font-bold text-sm ${isFullyPaid ? 'text-gray-400' : 'text-status-danger'}`}>
                          ₦{balance.toLocaleString()}
                        </span>
                      </td>
                      <td className="p-5">
                        {isFullyPaid ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Cleared
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Wallet className="w-3 h-3 mr-1" /> Pending
                          </span>
                        )}
                      </td>
                      <td className="p-5 text-right">
                        {!isFullyPaid && (
                          <button 
                            onClick={() => handleSendReminder(order)}
                            className="inline-flex items-center px-3 py-1.5 bg-brand-bg text-primary font-bold text-xs rounded-xl hover:bg-primary hover:text-white transition-all border border-gray-100"
                          >
                            <MessageCircle className="w-3.5 h-3.5 mr-1.5" /> Remind
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}