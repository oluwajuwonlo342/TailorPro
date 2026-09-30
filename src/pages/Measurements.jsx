import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Search, Ruler, Plus, ArrowLeft, CheckCircle2, AlertCircle, Share2, Users, MessageCircle } from 'lucide-react';

export default function MeasurementsPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await api.get('/customers');
        setCustomers(response.data.data || response.data);
      } catch (err) {
        console.error("Failed to fetch customers for measurements", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const handleShareWhatsApp = (customer) => {
    const formUrl = `${window.location.origin}/measure-form?cid=${customer._id}`;
    const message = encodeURIComponent(`Hello ${customer.fullName}, please click this secure link to fill in your clothing measurements for your upcoming outfits: ${formUrl}`);
    window.open(`https://wa.me/${customer.phone ? customer.phone.replace(/[^0-9]/g, '') : ''}?text=${message}`, '_blank');
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm);
    
    // Fixed logic: Removed the accidental '|| true' that was bypassing the filter
    const measurementsData = customer.measurements;
    const hasData = 
      (Array.isArray(measurementsData) && measurementsData.length > 0) || 
      (measurementsData && typeof measurementsData === 'object' && Object.keys(measurementsData).length > 0) || 
      customer.hasMeasurements === true;

    if (statusFilter === 'Measured') return matchesSearch && hasData;
    if (statusFilter === 'Missing') return matchesSearch && !hasData;
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center px-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <div className="text-gray-500 font-bold text-sm">Loading measurement directory...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 font-sans max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      
      {/* Back to Dashboard Link */}
      <div className="pt-2 sm:pt-4">
        <Link to="/dashboard" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2 shrink-0" /> Back to Dashboard
        </Link>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark">Measurement Directory</h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">Audit client sizing profiles and request digital measurements.</p>
        </div>
        <Link 
          to="/customers/add" 
          className="w-full sm:w-auto px-6 py-3.5 bg-primary text-white font-bold rounded-2xl hover:bg-primary-dark transition-all shadow-md shadow-primary/20 flex items-center justify-center text-sm shrink-0"
        >
          <Plus className="w-5 h-5 mr-2 shrink-0" /> Add Client
        </Link>
      </div>

      {/* Controls: Search & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="relative flex-1 w-full md:max-w-md">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="Search by client name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {['All', 'Measured', 'Missing'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
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

      {/* Directory Grid */}
      {filteredCustomers.length === 0 ? (
        <div className="text-center py-16 sm:py-20 bg-white rounded-3xl border border-gray-100 shadow-sm px-4">
          <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-5 border border-gray-100">
            <Ruler className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-extrabold text-brand-dark mb-2">No Clients Found</h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto font-medium">Try adjusting your search or filter criteria to find the client you are looking for.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredCustomers.map(customer => {
            const measurementsData = customer.measurements;
            const hasData = 
              (Array.isArray(measurementsData) && measurementsData.length > 0) || 
              (measurementsData && typeof measurementsData === 'object' && Object.keys(measurementsData).length > 0) || 
              customer.hasMeasurements === true;
              
            const subCount = customer.subProfiles?.length || 0;
            const initial = customer.fullName ? customer.fullName.charAt(0).toUpperCase() : 'C';

            return (
              <div key={customer._id} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow group">
                
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center space-x-4 min-w-0">
                    <div className="w-14 h-14 bg-primary/10 text-primary font-black rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-inner">
                      {initial}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-brand-dark text-lg truncate mb-0.5">{customer.fullName}</h3>
                      <p className="text-xs font-semibold text-gray-500 truncate">{customer.gender || 'Client'} • {customer.phone}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {/* Status Indicator */}
                  <div className="flex items-center justify-between p-3.5 rounded-2xl border border-gray-100 bg-gray-50/80">
                    <span className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Primary Profile</span>
                    {hasData ? (
                      <span className="inline-flex items-center text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1 shrink-0" /> Measured
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-xs font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">
                        <AlertCircle className="w-3.5 h-3.5 mr-1 shrink-0" /> Missing Data
                      </span>
                    )}
                  </div>

                  {subCount > 0 && (
                    <div className="flex items-center justify-between p-3.5 rounded-2xl border border-blue-100 bg-blue-50/50">
                      <span className="text-[11px] font-black text-blue-700 uppercase tracking-wider flex items-center">
                        <Users className="w-3.5 h-3.5 mr-1.5 shrink-0" /> Sub-Profiles
                      </span>
                      <span className="text-xs font-extrabold text-blue-800">{subCount} Member{subCount > 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>

                <div className="pt-5 border-t border-gray-100 flex items-center justify-between gap-3">
                  <button 
                    onClick={() => handleShareWhatsApp(customer)}
                    title="Send Secure Measurement Link via WhatsApp"
                    className="flex-1 py-3 px-3 bg-white text-emerald-600 font-bold text-xs rounded-xl hover:bg-emerald-50 transition-colors flex items-center justify-center border border-emerald-200 shadow-sm group-hover:border-emerald-300"
                  >
                    <MessageCircle className="w-4 h-4 mr-1.5 shrink-0" /> Request
                  </button>
                  
                  <Link 
                    to={`/customers/${customer._id}`}
                    className="flex-1 py-3 px-3 bg-brand-dark text-white font-bold text-xs rounded-xl hover:bg-black transition-all flex items-center justify-center shadow-md shadow-brand-dark/10"
                  >
                    <Ruler className="w-4 h-4 mr-1.5 shrink-0" /> View Sizing
                  </Link>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
