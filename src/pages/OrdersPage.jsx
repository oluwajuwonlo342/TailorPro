import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

import { ShoppingBag, Plus, Search, Calendar, DollarSign, CheckCircle2, Clock, Trash2, Share2, Filter, AlertCircle, CreditCard, X } from 'lucide-react';

export default function OrdersPage() {
  const { user } = useAuth();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [updatingId, setUpdatingId] = useState(null);

  // Payment Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [additionalPayment, setAdditionalPayment] = useState('');
  const [isPaying, setIsPaying] = useState(false);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data.data);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    const order = orders.find(o => o._id === orderId);
    if (!order) return;

    const total = Number(order.totalAmount || 0);
    const paid = Number(order.amountPaid || 0);
    const balance = total - paid;

    if (newStatus === 'Delivered' && balance > 0) {
      alert(`Cannot mark order as Delivered yet! There is still an outstanding balance of ₦${balance.toLocaleString()}. Please record full payment before delivery.`);
      return;
    }

    setUpdatingId(orderId);
    try {
      const response = await api.put(`/orders/${orderId}`, { status: newStatus });
      setOrders(orders.map(o => o._id === orderId ? response.data.data : o));
    } catch (err) {
      console.error("Status update error:", err.response || err);
      alert(err.response?.data?.error || "Failed to update order status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      await api.delete(`/orders/${orderId}`);
      setOrders(orders.filter(o => o._id !== orderId));
    } catch (err) {
      alert("Failed to delete order.");
    }
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    if (!selectedOrder || !additionalPayment) return;
    setIsPaying(true);
    try {
      const currentPaid = Number(selectedOrder.amountPaid || 0);
      const added = Number(additionalPayment);
      const newPaid = currentPaid + added;
      
      const response = await api.put(`/orders/${selectedOrder._id}`, { amountPaid: newPaid });
      
      setOrders(orders.map(o => o._id === selectedOrder._id ? response.data.data : o));
      setSelectedOrder(null);
      setAdditionalPayment('');
      alert("Payment updated successfully!");
    } catch (err) {
      alert("Failed to update payment.");
    } finally {
      setIsPaying(false);
    }
  };

  const handleSendWhatsAppUpdate = (order) => {
    const customerName = order.customer?.fullName || 'Valued Customer';
    const phone = order.customer?.phone || '';
    const total = Number(order.totalAmount || 0);
    const paid = Number(order.amountPaid || 0);
    const balance = total - paid;

    let paymentStatusText = balance === 0 
      ? "All payments have been settled. Thank you!" 
      : `Outstanding balance remaining: ₦${balance.toLocaleString()}.`;

    // Dynamically fetching the brand name from user DB
    const brandName = user?.brandName || user?.businessName || user?.name || "TailorPro"; 

    const message = encodeURIComponent(`Hello ${customerName}, here is an update on your order (${order.outfitName}) from *${brandName}*. Current Status: *${order.status}*. ${paymentStatusText} Thank you for choosing us!`);
    
    window.open(`https://wa.me/${phone ? phone.replace(/[^0-9]/g, '') : ''}?text=${message}`, '_blank');
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.outfitName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.fabricDescription?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'All') return matchesSearch;
    return matchesSearch && order.status === statusFilter;
  });

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-primary font-semibold text-lg animate-pulse">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans max-w-7xl mx-auto pb-20">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark">Order Management</h1>
          <p className="text-gray-500 text-sm mt-1">Track production stages, deadlines, and financial balances ({orders.length} total orders)</p>
        </div>
        <Link 
          to="/orders/new" 
          className="px-6 py-3.5 bg-primary text-white font-bold rounded-2xl hover:bg-primary-dark transition-all shadow-md shadow-primary/20 flex items-center justify-center text-sm"
        >
          <Plus className="w-5 h-5 mr-2" /> New Order
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="Search by outfit, customer name, or fabric..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary transition-all"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0">
          {['All', 'Pending', 'In Production', 'Ready for Fitting', 'Delivered', 'Cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === status 
                  ? 'bg-brand-dark text-white shadow-md' 
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-brand-dark mb-2">No Orders Found</h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">No orders match your current filter or search criteria.</p>
          <Link to="/orders/new" className="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-primary-dark">
            Create New Order
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map(order => {
            const total = Number(order.totalAmount || 0);
            const paid = Number(order.amountPaid || 0);
            const balance = total - paid;
            
            const statusColors = {
              'Pending': 'bg-amber-50 text-amber-700 border-amber-200',
              'In Production': 'bg-blue-50 text-blue-700 border-blue-200',
              'Ready for Fitting': 'bg-purple-50 text-purple-700 border-purple-200',
              'Delivered': 'bg-emerald-50 text-emerald-700 border-emerald-200',
              'Cancelled': 'bg-red-50 text-red-700 border-red-200'
            };

            return (
              <div key={order._id} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-all">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-bold px-3 py-1 rounded-xl border ${statusColors[order.status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                      {order.status}
                    </span>
                    <div className="flex items-center space-x-1">
                      <button 
                        onClick={() => handleSendWhatsAppUpdate(order)}
                        title="Send WhatsApp Update"
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(order._id)}
                        title="Delete Order"
                        className="p-2 text-gray-400 hover:text-status-danger hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-xl font-extrabold text-brand-dark">{order.outfitName}</h3>
                  <p className="text-sm font-semibold text-primary mt-0.5">{order.customer?.fullName || 'Walk-in Client'}</p>
                  
                  {order.fabricDescription && (
                    <p className="text-xs text-gray-500 mt-2 bg-brand-bg p-2.5 rounded-xl border border-gray-100">
                      <span className="font-bold">Fabric:</span> {order.fabricDescription}
                    </p>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 space-y-3">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1 text-gray-400" /> Due Date:</span>
                    <span className="font-bold text-brand-dark">{new Date(order.dueDate).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center"><DollarSign className="w-3.5 h-3.5 mr-1 text-gray-400" /> Total Amount:</span>
                    <span className="font-extrabold text-brand-dark text-sm">₦{total.toLocaleString()}</span>
                  </div>

                  <div className="bg-brand-bg p-3 rounded-2xl border border-gray-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-400">Paid / Balance</p>
                      <p className="text-xs font-bold text-emerald-600 mt-0.5">₦{paid.toLocaleString()} <span className="text-gray-300">/</span> <span className="text-status-danger">₦{balance.toLocaleString()}</span></p>
                    </div>
                    {balance > 0 && (
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="px-3 py-1.5 bg-primary/10 text-primary font-bold text-xs rounded-xl hover:bg-primary hover:text-white transition-all"
                      >
                        + Add Payment
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100">
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Update Stage:</label>
                  <select 
                    value={order.status}
                    disabled={updatingId === order._id}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-brand-dark outline-none focus:border-primary transition-all cursor-pointer"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Production">In Production</option>
                    <option value="Ready for Fitting">Ready for Fitting</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl relative">
            <button onClick={() => setSelectedOrder(null)} className="absolute top-6 right-6 text-gray-400 hover:text-brand-dark">
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-2xl font-bold text-brand-dark mb-1">Log Payment Installment</h3>
            <p className="text-sm text-gray-500 mb-6">Add payment for <span className="font-bold text-brand-dark">{selectedOrder.outfitName}</span> ({selectedOrder.customer?.fullName})</p>

            <form onSubmit={handleAddPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Amount to Add (₦)</label>
                <input 
                  type="number" required min="1"
                  value={additionalPayment}
                  onChange={(e) => setAdditionalPayment(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm font-bold"
                  autoFocus
                />
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3">
                <button type="button" onClick={() => setSelectedOrder(null)} className="px-5 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-xl text-sm">Cancel</button>
                <button type="submit" disabled={isPaying} className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark text-sm">
                  {isPaying ? 'Recording...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}