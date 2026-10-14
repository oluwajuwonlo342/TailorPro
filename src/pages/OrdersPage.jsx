import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import InvoiceModal from './InvoiceModal';

import { ShoppingBag, Plus, Search, Calendar, DollarSign, Trash2, Share2, X, Printer, Lock } from 'lucide-react';

const STATUSES = ['Pending', 'In Production', 'Ready for Fitting', 'Delivered', 'Cancelled'];

const STATUS_COLORS = {
  'Pending': 'bg-amber-50 text-amber-700 border-amber-200',
  'In Production': 'bg-blue-50 text-blue-700 border-blue-200',
  'Ready for Fitting': 'bg-purple-50 text-purple-700 border-purple-200',
  'Delivered': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Cancelled': 'bg-red-50 text-red-700 border-red-200'
};

const formatNaira = (value) => `₦${Number(value || 0).toLocaleString()}`;

// wa.me needs the international format. Converts Nigerian local numbers (0802...) to 234802...
const toWhatsAppNumber = (phone) => {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('234')) return digits;
  if (digits.startsWith('0')) return `234${digits.slice(1)}`;
  if (digits.length === 10) return `234${digits}`;
  return digits;
};

export default function OrdersPage() {
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [proRequired, setProRequired] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [updatingId, setUpdatingId] = useState(null);

  // Payment Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [additionalPayment, setAdditionalPayment] = useState('');
  const [isPaying, setIsPaying] = useState(false);

  // Invoice Modal State
  const [invoiceOrder, setInvoiceOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data.data || []);
      setLoadError('');
      setProRequired(false);
    } catch (err) {
      console.error("Failed to fetch orders", err);
      if (err.response?.status === 403) {
        // Orders is a Pro feature, so the server refuses free accounts
        setProRequired(true);
      } else {
        setLoadError(err.response?.data?.error || 'Could not load your orders. Please refresh and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const replaceOrder = (updated) =>
    setOrders((prev) => prev.map((o) => (o._id === updated._id ? updated : o)));

  const handleStatusChange = async (orderId, newStatus) => {
    const order = orders.find((o) => o._id === orderId);
    if (!order) return;

    const balance = Number(order.totalAmount || 0) - Number(order.amountPaid || 0);

    if (newStatus === 'Delivered' && balance > 0) {
      alert(`Cannot mark order as Delivered yet! There is still an outstanding balance of ${formatNaira(balance)}. Please record full payment before delivery.`);
      return;
    }

    setUpdatingId(orderId);
    try {
      const response = await api.put(`/orders/${orderId}`, { status: newStatus });
      replaceOrder(response.data.data);
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
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete order.");
    }
  };

  const selectedBalance = selectedOrder
    ? Math.max(Number(selectedOrder.totalAmount || 0) - Number(selectedOrder.amountPaid || 0), 0)
    : 0;

  const closePaymentModal = () => {
    setSelectedOrder(null);
    setAdditionalPayment('');
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    const added = Number(additionalPayment);
    if (!Number.isFinite(added) || added <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }
    if (added > selectedBalance) {
      alert(`This payment is more than the outstanding balance of ${formatNaira(selectedBalance)}.`);
      return;
    }

    setIsPaying(true);
    try {
      const newPaid = Number(selectedOrder.amountPaid || 0) + added;
      const response = await api.put(`/orders/${selectedOrder._id}`, { amountPaid: newPaid });

      replaceOrder(response.data.data);
      closePaymentModal();
      alert("Payment updated successfully!");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update payment.");
    } finally {
      setIsPaying(false);
    }
  };

  const brandName = user?.businessName || user?.brandName || "TailorPro";

  const handleSendWhatsAppUpdate = (order) => {
    const customerName = order.customer?.fullName || 'Valued Customer';
    const phone = toWhatsAppNumber(order.customer?.phone);
    const balance = Number(order.totalAmount || 0) - Number(order.amountPaid || 0);

    const paymentStatusText = balance <= 0
      ? "All payments have been settled. Thank you!"
      : `Outstanding balance remaining: ${formatNaira(balance)}.`;

    const message = encodeURIComponent(`Hello ${customerName}, here is an update on your order (${order.outfitName}) from *${brandName}*. Current Status: *${order.status}*. ${paymentStatusText} Thank you for choosing us!`);

    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const search = searchTerm.toLowerCase();
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.outfitName?.toLowerCase().includes(search) ||
      order.customer?.fullName?.toLowerCase().includes(search) ||
      order.fabricDescription?.toLowerCase().includes(search) ||
      order.orderNumber?.toLowerCase().includes(search);

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

  // Free accounts: orders are a Pro feature
  if (proRequired) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 px-4 font-sans">
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-5 border border-amber-100">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-brand-dark mb-2">Orders is a Pro feature</h2>
        <p className="text-gray-500 text-sm mb-6">
          Upgrade to Pro to track orders, deadlines, payments and invoices for your customers.
        </p>
        <Link to="/upgrade" className="inline-block px-6 py-3 bg-brand-dark text-white font-bold rounded-2xl hover:bg-black transition-all shadow-md">
          Upgrade to Pro
        </Link>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 px-4 font-sans">
        <p className="text-red-600 font-bold text-sm mb-4">{loadError}</p>
        <button
          onClick={() => { setLoading(true); fetchOrders(); }}
          className="px-6 py-3 bg-primary text-white font-bold rounded-2xl hover:bg-primary-dark"
        >
          Try Again
        </button>
      </div>
    );
  }

  const businessName = user?.businessName || user?.brandName || 'TailorPro Fashion House';

  return (
    <div className="space-y-6 sm:space-y-8 font-sans max-w-7xl mx-auto pb-20">

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm">
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

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by outfit, customer, fabric or order number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary transition-all"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0">
          {['All', ...STATUSES].map((status) => (
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
        <div className="text-center py-20 px-4 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-brand-dark mb-2">No Orders Found</h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
            {orders.length === 0
              ? 'You have not created any orders yet.'
              : 'No orders match your current filter or search criteria.'}
          </p>
          <Link to="/orders/new" className="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-primary-dark">
            Create New Order
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredOrders.map((order) => {
            const total = Number(order.totalAmount || 0);
            const paid = Number(order.amountPaid || 0);
            const balance = total - paid;

            return (
              <div key={order._id} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 sm:p-6 flex flex-col justify-between hover:shadow-md transition-all">
                <div>
                  <div className="flex items-center justify-between mb-3 gap-2">
                    <span className={`text-xs font-bold px-3 py-1 rounded-xl border whitespace-nowrap ${STATUS_COLORS[order.status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                      {order.status}
                    </span>
                    <div className="flex items-center space-x-1">
                      {/* Invoice button only renders when status is Delivered */}
                      {order.status === 'Delivered' && (
                        <button
                          onClick={() => setInvoiceOrder(order)}
                          title="Generate Invoice & Receipt"
                          className="p-2 text-primary hover:bg-primary/10 rounded-xl transition-colors flex items-center gap-1 text-xs font-bold bg-primary/5 px-2.5"
                        >
                          <Printer className="w-4 h-4" /> Invoice
                        </button>
                      )}
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

                  <h3 className="text-xl font-extrabold text-brand-dark break-words">{order.outfitName}</h3>
                  {order.orderNumber && (
                    <p className="text-[10px] font-bold text-gray-400 tracking-wider mt-0.5">{order.orderNumber}</p>
                  )}
                  <p className="text-sm font-semibold text-primary mt-1">{order.customer?.fullName || 'Walk-in Client'}</p>

                  {order.fabricDescription && (
                    <p className="text-xs text-gray-500 mt-2 bg-brand-bg p-2.5 rounded-xl border border-gray-100 break-words">
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
                    <span className="font-extrabold text-brand-dark text-sm">{formatNaira(total)}</span>
                  </div>

                  <div className="bg-brand-bg p-3 rounded-2xl border border-gray-100 flex items-center justify-between gap-2">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-400">Paid / Balance</p>
                      <p className="text-xs font-bold text-emerald-600 mt-0.5">{formatNaira(paid)} <span className="text-gray-300">/</span> <span className="text-status-danger">{formatNaira(Math.max(balance, 0))}</span></p>
                    </div>
                    {balance > 0 && order.status !== 'Cancelled' && (
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-3 py-1.5 bg-primary/10 text-primary font-bold text-xs rounded-xl hover:bg-primary hover:text-white transition-all whitespace-nowrap"
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
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-brand-dark outline-none focus:border-primary transition-all cursor-pointer disabled:opacity-60"
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Payment Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={closePaymentModal} className="absolute top-5 right-5 sm:top-6 sm:right-6 text-gray-400 hover:text-brand-dark">
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-xl sm:text-2xl font-bold text-brand-dark mb-1 pr-8">Log Payment Installment</h3>
            <p className="text-sm text-gray-500 mb-4">
              Add payment for <span className="font-bold text-brand-dark">{selectedOrder.outfitName}</span> ({selectedOrder.customer?.fullName || 'Walk-in Client'})
            </p>

            <div className="mb-5 p-3 bg-brand-bg rounded-2xl border border-gray-100 text-xs font-bold text-gray-500 flex items-center justify-between">
              <span>Outstanding balance</span>
              <span className="text-status-danger text-sm">{formatNaira(selectedBalance)}</span>
            </div>

            <form onSubmit={handleAddPayment} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-semibold text-gray-700">Amount to Add (₦)</label>
                  <button
                    type="button"
                    onClick={() => setAdditionalPayment(String(selectedBalance))}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    Pay full balance
                  </button>
                </div>
                <input
                  type="number" required min="1" max={selectedBalance} step="any"
                  value={additionalPayment}
                  onChange={(e) => setAdditionalPayment(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm font-bold"
                  autoFocus
                />
              </div>

              <div className="pt-4 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3">
                <button type="button" onClick={closePaymentModal} className="px-5 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-xl text-sm w-full sm:w-auto">Cancel</button>
                <button type="submit" disabled={isPaying} className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark disabled:opacity-70 text-sm w-full sm:w-auto">
                  {isPaying ? 'Recording...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Professional PDF Invoice Modal */}
      {invoiceOrder && (
     <InvoiceModal
  isOpen={!!invoiceOrder}
  order={invoiceOrder}
  customer={invoiceOrder.customer}
  businessName={businessName}
  businessPhone={user?.phone}
  businessAddress={user?.address}
  logoUrl={user?.profilePhoto}
  onClose={() => setInvoiceOrder(null)}
/>
      )}
    </div>
  );
}
