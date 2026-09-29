import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Users, ShoppingBag, DollarSign, CheckCircle, Clock, Plus, ArrowUpRight, CreditCard } from 'lucide-react';

export default function DashboardHome() {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    outstandingBalances: 0,
    recentOrders: [],
    recentCustomers: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/dashboard');
        setStats(response.data.data);
      } catch (err) {
        console.error("Failed to fetch dashboard metrics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-primary font-semibold text-lg animate-pulse">Loading dashboard overview...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans pb-20">
      
      {/* Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark">Dashboard Overview</h1>
          <p className="text-gray-500 text-sm mt-1">Here is what's happening in your fashion house today.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link 
            to="/customers" 
            className="px-4 py-3 bg-gray-50 border border-gray-200 text-brand-dark font-bold rounded-xl hover:bg-gray-100 transition-all flex items-center text-sm"
          >
            <Plus className="w-4 h-4 mr-2 text-primary" /> Add Customer
          </Link>
          <Link 
            to="/orders" 
            className="px-5 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all shadow-md shadow-primary/20 flex items-center text-sm"
          >
            <ShoppingBag className="w-4 h-4 mr-2" /> New Order
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Total Customers */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Customers</p>
            <h3 className="text-3xl font-extrabold text-brand-dark">{stats.totalCustomers}</h3>
          </div>
          <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
            <Users className="w-7 h-7" />
          </div>
        </div>

        {/* Active Orders */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Active Orders</p>
            <h3 className="text-3xl font-extrabold text-brand-dark">{stats.activeOrders}</h3>
          </div>
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
            <ShoppingBag className="w-7 h-7" />
          </div>
        </div>

        {/* Outstanding Balances */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Outstanding Balances</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-status-danger">₦{stats.outstandingBalances?.toLocaleString() || 0}</h3>
          </div>
          <div className="w-14 h-14 bg-red-50 text-status-danger rounded-2xl flex items-center justify-center">
            <CreditCard className="w-7 h-7" />
          </div>
        </div>

        {/* Completed Orders */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Completed Orders</p>
            <h3 className="text-3xl font-extrabold text-brand-dark">{stats.completedOrders}</h3>
          </div>
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <CheckCircle className="w-7 h-7" />
          </div>
        </div>

        {/* Total Revenue Collected */}
        <div className="lg:col-span-2 bg-gradient-to-br from-brand-dark to-gray-900 p-8 rounded-3xl shadow-xl flex items-center justify-between text-white relative overflow-hidden">
          <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-10">
            <DollarSign className="w-64 h-64 text-white" />
          </div>
          <div className="relative z-10">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Total Revenue Collected</p>
            <h3 className="text-3xl sm:text-4xl font-black text-primary-light">₦{stats.totalRevenue?.toLocaleString() || 0}</h3>
          </div>
          <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center relative z-10">
            <ArrowUpRight className="w-7 h-7 text-primary-light" />
          </div>
        </div>

      </div>

      {/* Recent Activity Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Orders */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-extrabold text-brand-dark text-lg">Recent Orders</h3>
            <Link to="/orders" className="text-primary font-bold text-xs hover:underline">View All</Link>
          </div>

          {stats.recentOrders.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">No orders recorded yet.</div>
          ) : (
            <div className="space-y-4">
              {stats.recentOrders.map(order => (
                <div key={order._id} className="p-4 bg-brand-bg rounded-2xl border border-gray-100 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-brand-dark text-sm">{order.outfitName}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{order.customer?.fullName || 'Client'} • Due {new Date(order.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-gray-600 inline-block mb-1">
                      {order.status}
                    </span>
                    <p className="text-xs font-bold text-brand-dark">₦{order.totalAmount?.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Customers */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-extrabold text-brand-dark text-lg">Recent Customers</h3>
            <Link to="/customers" className="text-primary font-bold text-xs hover:underline">View All</Link>
          </div>

          {stats.recentCustomers.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">No customers registered yet.</div>
          ) : (
            <div className="space-y-4">
              {stats.recentCustomers.map(cust => (
                <div key={cust._id} className="p-4 bg-brand-bg rounded-2xl border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 text-primary font-bold rounded-xl flex items-center justify-center text-sm">
                      {cust.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-brand-dark text-sm">{cust.fullName}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{cust.phone}</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-gray-400">
                    {new Date(cust.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}