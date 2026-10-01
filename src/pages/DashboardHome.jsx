import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Users, ShoppingBag, DollarSign, CheckCircle, Clock, Plus, ArrowUpRight, CreditCard, ChevronRight, AlertCircle, Flame, Timer, BellRing } from 'lucide-react';

export default function DashboardHome() {
  const { user } = useAuth();
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
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <div className="text-gray-500 font-bold text-sm">Loading your workspace...</div>
        </div>
      </div>
    );
  }

  // Calculate usage for Free users
  const isFreePlan = user?.plan === 'free' || !user?.plan;
  const customerLimit = 20;
  const orderLimit = 30; 
  
  const customerPercentage = Math.min((stats.totalCustomers / customerLimit) * 100, 100);
  const orderPercentage = Math.min((stats.activeOrders / orderLimit) * 100, 100);

  // Time-based Order Urgency Logic
  const checkOrderUrgency = (dueDate, status) => {
    if (status === 'Delivered' || status === 'Cancelled' || status === 'Completed') return { type: 'normal', days: null };
    
    const today = new Date();
    today.setHours(0,0,0,0);
    const targetDate = new Date(dueDate);
    targetDate.setHours(0,0,0,0);
    
    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { type: 'overdue', days: Math.abs(diffDays) };
    if (diffDays >= 0 && diffDays <= 3) return { type: 'due_soon', days: diffDays };
    return { type: 'normal', days: diffDays };
  };

  // Extract urgent orders for the top alert banner
  const urgentOrders = stats.recentOrders.map(order => ({
    ...order,
    urgency: checkOrderUrgency(order.dueDate, order.status)
  })).filter(order => order.urgency.type !== 'normal');

  const overdueCount = urgentOrders.filter(o => o.urgency.type === 'overdue').length;
  const dueSoonCount = urgentOrders.filter(o => o.urgency.type === 'due_soon').length;

  return (
    <div className="space-y-8 font-sans max-w-7xl mx-auto pb-20">
      
      {/* Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark">Dashboard Overview</h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">Welcome back, here is what's happening in your fashion house today.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link 
            to="/customers/new" 
            className="flex-1 sm:flex-none px-5 py-3 bg-gray-50 border border-gray-200 text-brand-dark font-bold rounded-2xl hover:bg-gray-100 transition-all flex items-center justify-center text-sm"
          >
            <Plus className="w-4 h-4 mr-1.5 text-primary" /> Add Customer
          </Link>
          <Link 
            to="/orders/new" 
            className="flex-1 sm:flex-none px-6 py-3 bg-primary text-white font-bold rounded-2xl hover:bg-primary-dark transition-all shadow-md shadow-primary/20 flex items-center justify-center text-sm"
          >
            <ShoppingBag className="w-4 h-4 mr-2" /> New Order
          </Link>
        </div>
      </div>

      {/* Smart Priority Alerts Banner */}
      {urgentOrders.length > 0 && (
        <div className="bg-gradient-to-r from-gray-900 to-brand-dark rounded-3xl p-1 shadow-lg shadow-gray-900/10 animate-fade-in">
          <div className="bg-white rounded-[22px] p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-white/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
                <BellRing className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="font-extrabold text-brand-dark text-lg">Attention Required</h3>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {overdueCount > 0 && (
                    <span className="inline-flex items-center text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-lg border border-red-100">
                      <Flame className="w-3.5 h-3.5 mr-1" /> {overdueCount} Overdue
                    </span>
                  )}
                  {dueSoonCount > 0 && (
                    <span className="inline-flex items-center text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100">
                      <Timer className="w-3.5 h-3.5 mr-1" /> {dueSoonCount} Due Soon (2-3 Days)
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Link to="/orders" className="shrink-0 px-5 py-2.5 bg-brand-dark text-white text-xs font-bold rounded-xl hover:bg-black transition-colors shadow-md">
              Review Schedule
            </Link>
          </div>
        </div>
      )}

      {/* Free Plan Usage Tracker */}
      {isFreePlan && (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-8">
            
            {/* Customer Limit Tracker */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Customers</span>
                <span className="text-sm font-extrabold text-brand-dark">{stats.totalCustomers} <span className="text-gray-400 font-medium">/ {customerLimit}</span></span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div className={`h-2 rounded-full transition-all duration-500 ${customerPercentage > 85 ? 'bg-red-500' : 'bg-primary'}`} style={{ width: `${customerPercentage}%` }}></div>
              </div>
              {customerPercentage > 85 && <p className="text-xs text-red-500 mt-2 font-bold flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/> Nearing customer limit</p>}
            </div>

            {/* Order Limit Tracker */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Monthly Orders</span>
                <span className="text-sm font-extrabold text-brand-dark">{stats.activeOrders} <span className="text-gray-400 font-medium">/ {orderLimit}</span></span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div className={`h-2 rounded-full transition-all duration-500 ${orderPercentage > 85 ? 'bg-red-500' : 'bg-primary'}`} style={{ width: `${orderPercentage}%` }}></div>
              </div>
            </div>

          </div>

          <div className="shrink-0 w-full md:w-auto">
            <Link to="/settings/billing" className="w-full inline-flex items-center justify-center px-6 py-3 bg-brand-dark text-white text-sm font-bold rounded-2xl hover:bg-black transition-colors shadow-sm">
              Upgrade to Pro
            </Link>
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-brand-dark mb-1">{stats.totalCustomers}</h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Customers</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-brand-dark mb-1">{stats.activeOrders}</h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Orders</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-red-600 mb-1 truncate">₦{stats.outstandingBalances?.toLocaleString() || 0}</h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Outstanding Balance</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#0F1423] to-[#1a2235] p-6 rounded-3xl border border-gray-800 shadow-xl flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
            <DollarSign className="w-48 h-48 text-white" />
          </div>
          <div className="relative z-10 flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-white/10 text-white rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <ArrowUpRight className="w-6 h-6" />
            </div>
          </div>
          <div className="relative z-10">
            <h3 className="text-2xl sm:text-3xl font-black text-white mb-1 truncate">₦{stats.totalRevenue?.toLocaleString() || 0}</h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Revenue Collected</p>
          </div>
        </div>

      </div>

      {/* Recent Activity Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Orders (Enhanced with Urgency Badges) */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-extrabold text-brand-dark text-lg">Recent Orders</h3>
            <Link to="/orders" className="flex items-center text-primary font-bold text-xs hover:text-primary-dark transition-colors">
              View All <ChevronRight className="w-4 h-4 ml-0.5" />
            </Link>
          </div>

          {stats.recentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center flex-1">
              <ShoppingBag className="w-12 h-12 text-gray-200 mb-3" />
              <p className="text-brand-dark font-bold text-sm mb-1">No orders yet</p>
              <p className="text-gray-500 text-xs mb-4">Create your first order to start tracking production.</p>
              <Link to="/orders/new" className="text-primary font-bold text-xs bg-primary/10 px-4 py-2 rounded-xl hover:bg-primary hover:text-white transition-colors">
                + Create Order
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentOrders.map(order => {
                const urgency = checkOrderUrgency(order.dueDate, order.status);
                let bgStyle = 'bg-gray-50/50 border-gray-100 hover:bg-gray-50';
                let alertBadge = null;

                if (urgency.type === 'overdue') {
                  bgStyle = 'bg-red-50/40 border-red-100 hover:bg-red-50/80';
                  alertBadge = (
                    <span className="flex items-center text-[10px] font-black uppercase tracking-wider text-red-600 bg-red-100 px-2 py-0.5 rounded-md mt-1.5 w-fit">
                      <Flame className="w-3 h-3 mr-1" /> {urgency.days} Day{urgency.days > 1 ? 's' : ''} Overdue
                    </span>
                  );
                } else if (urgency.type === 'due_soon') {
                  bgStyle = 'bg-amber-50/40 border-amber-100 hover:bg-amber-50/80';
                  alertBadge = (
                    <span className="flex items-center text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-100 px-2 py-0.5 rounded-md mt-1.5 w-fit">
                      <Timer className="w-3 h-3 mr-1" /> Due in {urgency.days === 0 ? 'Today' : `${urgency.days} Day${urgency.days > 1 ? 's' : ''}`}
                    </span>
                  );
                }

                return (
                  <div key={order._id} className={`p-4 rounded-2xl border flex items-center justify-between transition-colors ${bgStyle}`}>
                    <div>
                      <h4 className="font-bold text-brand-dark text-sm">{order.outfitName}</h4>
                      <p className="text-xs font-medium text-gray-500 mt-1">{order.customer?.fullName || 'Client'} • Due {new Date(order.dueDate).toLocaleDateString()}</p>
                      {alertBadge}
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-gray-600 inline-block mb-1.5 shadow-sm">
                        {order.status}
                      </span>
                      <p className="text-sm font-black text-brand-dark">₦{order.totalAmount?.toLocaleString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Customers */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-extrabold text-brand-dark text-lg">Recent Customers</h3>
            <Link to="/customers" className="flex items-center text-primary font-bold text-xs hover:text-primary-dark transition-colors">
              View All <ChevronRight className="w-4 h-4 ml-0.5" />
            </Link>
          </div>

          {stats.recentCustomers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center flex-1">
              <Users className="w-12 h-12 text-gray-200 mb-3" />
              <p className="text-brand-dark font-bold text-sm mb-1">No customers yet</p>
              <p className="text-gray-500 text-xs mb-4">Add your first customer to build your database.</p>
              <Link to="/customers/new" className="text-primary font-bold text-xs bg-primary/10 px-4 py-2 rounded-xl hover:bg-primary hover:text-white transition-colors">
                + Add Customer
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentCustomers.map(cust => (
                <div key={cust._id} className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-brand-dark text-white font-bold rounded-xl flex items-center justify-center text-sm shadow-sm">
                      {cust.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-brand-dark text-sm">{cust.fullName}</h4>
                      <p className="text-xs font-medium text-gray-500 mt-1">{cust.phone}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-gray-400">
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
