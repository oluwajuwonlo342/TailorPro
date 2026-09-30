import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, Scissors, AlertCircle } from 'lucide-react';

export default function OrderCreate() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    customer: '',
    outfitName: '',
    fabricDescription: '',
    dueDate: '',
    totalAmount: '',
    amountPaid: '',
    notes: ''
  });

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await api.get('/customers');
        // Handle different response structures gracefully
        const list = response.data.data || response.data || [];
        setCustomers(list);
      } catch (err) {
        console.error("Failed to load customers", err);
        setError("Failed to load customer list. Please try refreshing.");
      } finally {
        setLoadingCustomers(false);
      }
    };
    fetchCustomers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.customer) {
      setError('Please select a customer for this order.');
      return;
    }

    const total = Number(formData.totalAmount || 0);
    const paid = Number(formData.amountPaid || 0);

    if (paid > total) {
      setError('Amount paid cannot exceed the total order amount.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Ensure we send clean payload matching backend expectations
      const payload = {
        customer: formData.customer, // This is the customer _id
        outfitName: formData.outfitName,
        fabricDescription: formData.fabricDescription,
        dueDate: formData.dueDate,
        totalAmount: total,
        amountPaid: paid,
        notes: formData.notes
      };

      console.log("Submitting order payload:", payload);

      await api.post('/orders', payload);
      navigate('/orders');
    } catch (err) {
      console.error("Order creation error response:", err.response?.data);
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to create order. Please check your inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const total = Number(formData.totalAmount || 0);
  const paid = Number(formData.amountPaid || 0);
  const balance = total - paid;

  return (
    <div className="space-y-6 font-sans max-w-4xl mx-auto pb-20">
      <Link to="/orders" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-primary transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders
      </Link>

      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-gray-100">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center font-bold">
            <Scissors className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-brand-dark">Create New Tailoring Order</h1>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">Log client requirements, pricing, and production deadlines.</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-2xl border border-red-100 font-bold flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Customer Selection */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Customer *</label>
            {loadingCustomers ? (
              <div className="py-3 px-4 bg-gray-50 rounded-2xl text-sm text-gray-400 font-medium animate-pulse">Loading customers...</div>
            ) : customers.length === 0 ? (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-center justify-between">
                <span className="text-sm font-bold text-amber-800">No customers found. You need to add a customer first.</span>
                <Link to="/customers" className="px-4 py-2 bg-primary text-white font-bold text-xs rounded-xl shadow-sm">Add Customer</Link>
              </div>
            ) : (
              <select
                name="customer"
                required
                value={formData.customer}
                onChange={handleChange}
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-brand-dark outline-none focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary transition-all cursor-pointer"
              >
                <option value="">-- Choose Customer --</option>
                {customers.map(c => (
                  <option key={c._id} value={c._id}>
                    {c.fullName} ({c.phone})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Outfit Name & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Outfit / Style Name *</label>
              <input
                type="text"
                name="outfitName"
                required
                placeholder="e.g. Agbada 3-Piece, Senator Suit, Ankara Gown"
                value={formData.outfitName}
                onChange={handleChange}
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-brand-dark outline-none focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Due Date *</label>
              <input
                type="date"
                name="dueDate"
                required
                value={formData.dueDate}
                onChange={handleChange}
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-brand-dark outline-none focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary transition-all cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Fabric Description & Color</label>
            <input
              type="text"
              name="fabricDescription"
              placeholder="e.g. Navy blue cashmere with gold embroidery"
              value={formData.fabricDescription}
              onChange={handleChange}
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-brand-dark outline-none focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            />
          </div>

          {/* Pricing & Payments */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50/70 p-6 rounded-3xl border border-gray-100">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Total Amount (₦) *</label>
              <input
                type="number"
                name="totalAmount"
                required
                min="0"
                placeholder="0.00"
                value={formData.totalAmount}
                onChange={handleChange}
                className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-black text-brand-dark outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Initial Deposit Paid (₦)</label>
              <input
                type="number"
                name="amountPaid"
                min="0"
                placeholder="0.00"
                value={formData.amountPaid}
                onChange={handleChange}
                className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-black text-emerald-600 outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
            </div>
            <div className="sm:col-span-2 flex items-center justify-between pt-3 border-t border-gray-200/60">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Calculated Balance Due:</span>
              <span className={`text-base font-black ${balance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                ₦{balance.toLocaleString()} {balance === 0 && '(Fully Paid)'}
              </span>
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Styling Instructions / Notes</label>
            <textarea
              name="notes"
              rows="3"
              placeholder="Any special design adjustments or client remarks..."
              value={formData.notes}
              onChange={handleChange}
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium text-brand-dark outline-none focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none"
            ></textarea>
          </div>

          {/* Form Actions */}
          <div className="pt-4 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
            <Link to="/orders" className="w-full sm:w-auto px-6 py-3.5 text-center text-gray-600 font-bold text-sm hover:bg-gray-100 rounded-2xl transition-colors">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3.5 bg-primary text-white font-bold text-sm rounded-2xl hover:bg-primary-dark transition-all shadow-md shadow-primary/20 disabled:opacity-70 flex items-center justify-center"
            >
              {isSubmitting ? 'Creating Order...' : 'Save & Create Order'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
