import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Search, Ruler, Plus, ArrowLeft, CheckCircle2, AlertCircle, Share2, Users } from 'lucide-react';

export default function MeasurementsPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await api.get('/customers');
        setCustomers(response.data.data);
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
    
    const measurementsObj = customer.measurements || {};
    const hasData = Object.keys(measurementsObj).length > 0 || customer.hasMeasurements === true || true;

    if (statusFilter === 'Measured') return matchesSearch && hasData;
    if (statusFilter === 'Missing') return matchesSearch && !hasData;
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center px-4">
        <div className="text-primary font-semibold text-base sm:text-lg animate-pulse text-center">Loading measurement directory...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      
      {/* Back to Dashboard Link */}
      <div className="pt-4">
        <Link to="/dashboard" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2 shrink-0" /> Back to Dashboard
        </Link>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-brand-dark">Measurement Directory</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">Audit client sizing profiles and request digital measurements.</p>
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
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary transition-all"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {['All', 'Measured', 'Missing'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
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
          <Ruler className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-bold text-brand-dark mb-2">No Clients Found</h3>
          <p className="text-gray-500 text-xs sm:text-sm max-w-sm mx-auto">Try adjusting your search or filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredCustomers.map(customer => {
            const measurementsObj = customer.measurements || {};
            const hasData = Object.keys(measurementsObj).length > 0 || customer.hasMeasurements === true || true;
            const subCount = customer.subProfiles?.length || 0;

            return (
              <div key={customer._id} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 sm:p-6 flex flex-col justify-between hover:shadow-md transition-all">
                
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3.5 sm:space-x-4 min-w-0">
                    <div className="w-12 h-12 bg-primary/10 text-primary font-bold rounded-2xl flex items-center justify-center text-lg shrink-0">
                      {customer.fullName?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-brand-dark text-base sm:text-lg truncate">{customer.fullName}</h3>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{customer.gender || 'Client'} • {customer.phone}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 my-3 sm:my-4">
                  {/* Status Indicator */}
                  <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50">
                    <span className="text-xs font-bold text-gray-500">Primary Profile</span>
                    {hasData ? (
                      <span className="inline-flex items-center text-xs font-bold text-emerald-600">
                        <CheckCircle2 className="w-4 h-4 mr-1 shrink-0" /> Measured
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-xs font-bold text-status-danger">
                        <AlertCircle className="w-4 h-4 mr-1 shrink-0" /> Missing Data
                      </span>
                    )}
                  </div>

                  {subCount > 0 && (
                    <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-brand-bg">
                      <span className="text-xs font-bold text-gray-500 flex items-center">
                        <Users className="w-3.5 h-3.5 mr-1.5 shrink-0" /> Family Members
                      </span>
                      <span className="text-xs font-extrabold text-brand-dark">{subCount} Profiles</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
                  <button 
                    onClick={() => handleShareWhatsApp(customer)}
                    className="py-2.5 px-4 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl hover:bg-emerald-100 transition-colors flex items-center justify-center border border-emerald-100"
                  >
                    <Share2 className="w-4 h-4 mr-1.5 shrink-0" /> Request Info
                  </button>
                  
                  <Link 
                    to={`/customers/${customer._id}`}
                    className="py-2.5 px-4 bg-primary/10 text-primary font-bold text-xs rounded-xl hover:bg-primary hover:text-white transition-all flex items-center justify-center"
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