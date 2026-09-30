import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Users, Plus, Search, Trash2, Phone, Mail, MapPin, X } from 'lucide-react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    gender: 'Male',
    email: '',
    phone: '',
    address: '',
    notes: ''
  });

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers');
      setCustomers(response.data.data);
    } catch (err) {
      console.error("Failed to fetch customers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await api.post('/customers', formData);
      setShowModal(false);
      setFormData({ fullName: '', gender: 'Male', email: '', phone: '', address: '', notes: '' });
      fetchCustomers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add customer.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await api.delete(`/customers/${id}`);
        setCustomers(customers.filter(c => c._id !== id));
      } catch (err) {
        alert('Failed to delete customer.');
      }
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  return (
    <div className="space-y-8 font-sans max-w-7xl mx-auto pb-20">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark">Customer Management</h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">Manage your clients, contact details, and history ({customers.length} total)</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="px-6 py-3.5 bg-primary text-white font-bold rounded-2xl hover:bg-primary-dark transition-all shadow-md shadow-primary/20 flex items-center justify-center text-sm"
        >
          <Plus className="w-5 h-5 mr-2" /> Add New Customer
        </button>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input 
          type="text"
          placeholder="Search by name or phone number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all shadow-sm text-sm"
        />
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <div className="text-gray-500 font-bold text-sm">Loading customers...</div>
          </div>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center shadow-sm">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-brand-dark">No customers found</h3>
          <p className="text-gray-500 text-sm mt-1 mb-6">Get started by adding your first client.</p>
          <button 
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 bg-primary/10 text-primary font-bold text-sm rounded-xl hover:bg-primary hover:text-white transition-colors"
          >
            + Add Customer
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map(customer => (
            <div key={customer._id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary/10 text-primary font-bold rounded-2xl flex items-center justify-center text-lg shadow-sm">
                      {customer.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-brand-dark text-base">{customer.fullName}</h3>
                      <p className="text-xs text-gray-400 font-medium mt-0.5">Added {new Date(customer.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(customer._id)} className="text-gray-400 hover:text-red-600 p-2 transition-colors rounded-xl hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2.5 text-sm text-gray-600 mb-6">
                  <div className="flex items-center space-x-2.5">
                    <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="font-medium">{customer.phone}</span>
                  </div>
                  {customer.email && (
                    <div className="flex items-center space-x-2.5">
                      <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="truncate font-medium">{customer.email}</span>
                    </div>
                  )}
                  {customer.address && (
                    <div className="flex items-center space-x-2.5">
                      <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="truncate font-medium">{customer.address}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[11px] font-bold px-3 py-1 bg-gray-50 text-gray-600 rounded-lg uppercase tracking-wider">{customer.gender || 'Client'}</span>
                <Link to={`/customers/${customer._id}`} className="text-primary font-bold text-sm hover:underline flex items-center">
                  View Profile →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Customer Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative my-8">
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-brand-dark p-1 rounded-lg hover:bg-gray-100">
              <X className="w-6 h-6" />
            </button>
            
            <h2 className="text-2xl font-extrabold text-brand-dark mb-1">Add New Customer</h2>
            <p className="text-sm text-gray-500 mb-6">Enter client details and contact information.</p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-2xl border border-red-100 font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateCustomer} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Full Name *</label>
                  <input 
                    type="text" required
                    value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm transition-all"
                    placeholder="Chinedu Okafor"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Gender *</label>
                  <select 
                    value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm transition-all"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Unisex">Unisex / Other</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Phone Number *</label>
                <input 
                  type="tel" required
                  value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm transition-all"
                  placeholder="+234 800 000 0000"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email Address</label>
                <input 
                  type="email"
                  value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm transition-all"
                  placeholder="chinedu@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Delivery Address</label>
                <input 
                  type="text"
                  value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm transition-all"
                  placeholder="10 Awolowo Way, Ikeja, Lagos"
                />
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-3 text-gray-600 font-bold text-sm hover:bg-gray-100 rounded-2xl transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-3 bg-primary text-white font-bold text-sm rounded-2xl hover:bg-primary-dark transition-all shadow-md shadow-primary/20">Save Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
