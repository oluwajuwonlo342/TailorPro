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
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <div className="text-gray-500 font-bold text-sm">Loading financials...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 font-sans max-w-7xl mx-auto pb-20">
      
      {/* Back to Dashboard Link */}
      <Link to="/dashboard" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-primary transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </Link>
      
      {/* Page Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm mt-2 sm:mt-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark">Payments & Financials</h1>
        <p className="text-gray-500 text-sm mt-1 font-medium">Monitor revenue, track outstanding balances, and send payment reminders.</p>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {/* Revenue Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm flex items-center space-x-5 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
            <TrendingUp className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Total Revenue Collected</p>
            <h2 className="text-2xl sm:text-3xl font-black text-brand-dark">₦{totalRevenue.toLocaleString()}</h2>
          </div>
        </div>

        {/* Outstanding Debt Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm flex items-center space-x-5 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center shrink-0">
            <AlertCircle className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Total Outstanding</p>
            <h2 className="text-2xl sm:text-3xl font-black text-red-600">₦{totalOutstanding.toLocaleString()}</h2>
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
            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {['All', 'Fully Paid', 'Outstanding'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
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
          {/* min-w-[800px] ensures the table scrolls horizontally on mobile instead of squishing text */}
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-extrabold">
                <th className="p-5 sm:px-6">Customer & Outfit</th>
                <th className="p-5 sm:px-6">Total Billed</th>
                <th className="p-5 sm:px-6">Amount Paid</th>
                <th className="p-5 sm:px-6">Balance</th>
                <th className="p-5 sm:px-6">Status</th>
                <th className="p-5 sm:px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredLedger.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center text-gray-400 text-sm font-bold">
                    <div className="flex flex-col items-center justify-center">
                      <Wallet className="w-10 h-10 text-gray-300 mb-3" />
                      No payment records found matching your criteria.
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLedger.map(order => {
                  const total = Number(order.totalAmount || 0);
                  const paid = Number(order.amountPaid || 0);
                  const balance = total - paid;
                  const isFullyPaid = balance <= 0;

                  return (
                    <tr key={order._id} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="p-5 sm:px-6">
                        <p className="font-extrabold text-brand-dark text-sm break-words">{order.customer?.fullName || 'Walk-in Client'}</p>
                        <p className="text-xs font-semibold text-primary mt-0.5 break-words">{order.outfitName}</p>
                      </td>
                      <td className="p-5 sm:px-6 font-bold text-gray-600 text-sm whitespace-nowrap">₦{total.toLocaleString()}</td>
                      <td className="p-5 sm:px-6 font-bold text-emerald-600 text-sm whitespace-nowrap">₦{paid.toLocaleString()}</td>
                      <td className="p-5 sm:px-6 whitespace-nowrap">
                        <span className={`font-black text-sm ${isFullyPaid ? 'text-gray-400' : 'text-red-600'}`}>
                          ₦{balance.toLocaleString()}
                        </span>
                      </td>
                      <td className="p-5 sm:px-6 whitespace-nowrap">
                        {isFullyPaid ? (
                          <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Cleared
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-100 shadow-sm">
                            <Wallet className="w-3.5 h-3.5 mr-1" /> Pending
                          </span>
                        )}
                      </td>
                      <td className="p-5 sm:px-6 text-right whitespace-nowrap">
                        {!isFullyPaid && (
                          <button 
                            onClick={() => handleSendReminder(order)}
                            className="inline-flex items-center px-4 py-2 bg-white text-primary font-bold text-xs rounded-xl hover:bg-primary hover:text-white transition-all border border-gray-200 shadow-sm group-hover:border-primary/30"
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
