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
    gender: 'Male', // Added Gender with default
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
    <div className="space-y-8 font-sans">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark">Customer Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your clients, contact details, and history ({customers.length} total)</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="px-5 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all shadow-md shadow-primary/20 flex items-center justify-center text-sm"
        >
          <Plus className="w-5 h-5 mr-2" /> Add New Customer
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input 
          type="text"
          placeholder="Search by name or phone number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all shadow-sm"
        />
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-primary font-semibold animate-pulse">Loading customers...</div>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center shadow-sm">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-brand-dark">No customers found</h3>
          <p className="text-gray-500 text-sm mt-1">Get started by adding your first client.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map(customer => (
            <div key={customer._id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary/10 text-primary font-bold rounded-2xl flex items-center justify-center text-lg">
                      {customer.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-brand-dark text-lg">{customer.fullName}</h3>
                      <p className="text-xs text-gray-400">Added {new Date(customer.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(customer._id)} className="text-gray-400 hover:text-status-danger p-2 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-6">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{customer.phone}</span>
                  </div>
                  {customer.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{customer.email}</span>
                    </div>
                  )}
                  {customer.address && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{customer.address}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs font-semibold px-3 py-1 bg-brand-bg text-gray-600 rounded-lg">Active Client</span>
                <Link to={`/customers/${customer._id}`} className="text-primary font-bold text-sm hover:underline">
                  View Profile
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl relative">
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-brand-dark">
              <X className="w-6 h-6" />
            </button>
            
            <h2 className="text-2xl font-bold text-brand-dark mb-2">Add New Customer</h2>
            <p className="text-sm text-gray-500 mb-6">Enter customer details and measurement references.</p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 text-status-danger text-sm rounded-xl border border-red-100 font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateCustomer} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input 
                    type="text" required
                    value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    placeholder="Chinedu Okafor"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                  <select 
                    value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Unisex">Unisex / Other</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input 
                  type="tel" required
                  value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  placeholder="+234 800 000 0000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input 
                  type="email"
                  value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  placeholder="chinedu@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                <input 
                  type="text"
                  value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  placeholder="10 Awolowo Way, Ikeja, Lagos"
                />
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark shadow-lg shadow-primary/20">Save Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}