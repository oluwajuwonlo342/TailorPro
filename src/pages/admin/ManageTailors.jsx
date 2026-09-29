import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MoreVertical, ShieldAlert, CheckCircle, SearchX, Eye, Trash2, Ban } from 'lucide-react';
import api from '../../services/api';

export default function ManageTailors() {
  const [tailors, setTailors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [openDropdown, setOpenDropdown] = useState(null);

  // Deletion Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [tailorToDelete, setTailorToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchTailors = async () => {
      try {
        const response = await api.get('/admin/tailors');
        setTailors(response.data);
      } catch (err) {
        console.error("Failed to fetch tailors", err);
        setError('Failed to load tailor data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTailors();
  }, []);

  const filteredTailors = tailors.filter(tailor => 
    tailor.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tailor.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tailor.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  // --- Deletion Handlers ---
  const triggerDelete = (tailor) => {
    setTailorToDelete(tailor);
    setIsDeleteModalOpen(true);
    setOpenDropdown(null); 
  };

  const executeDelete = async () => {
    if (!tailorToDelete) return;
    
    setIsDeleting(true);
    try {
      await api.delete(`/admin/tailors/${tailorToDelete._id}`);
      setTailors(tailors.filter(t => t._id !== tailorToDelete._id));
      setIsDeleteModalOpen(false);
      setTailorToDelete(null);
    } catch (err) {
      console.error("Failed to delete tailor", err);
      alert(err.response?.data?.error || 'Failed to delete tailor.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 font-bold text-gray-500 animate-pulse">Loading Tailor Database...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans relative">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-dark">Manage Tailors</h1>
          <p className="text-gray-500 text-sm mt-1">View and manage all registered tailors on the platform.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-status-danger rounded-xl flex items-center text-sm font-bold border border-red-100">
          <ShieldAlert className="w-5 h-5 mr-2 shrink-0" />
          {error}
        </div>
      )}

      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search by name, business, or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary transition-all font-medium"
          />
        </div>
        <div className="text-sm font-bold text-gray-500 w-full sm:w-auto text-right">
          Total Tailors: <span className="text-brand-dark">{filteredTailors.length}</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden pb-16">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-5 font-bold">Tailor details</th>
                <th className="p-5 font-bold">Business Name</th>
                <th className="p-5 font-bold">Phone Number</th>
                <th className="p-5 font-bold">Subscription</th>
                <th className="p-5 font-bold">Joined Date</th>
                <th className="p-5 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTailors.length > 0 ? (
                filteredTailors.map((tailor) => (
                  <tr key={tailor._id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {tailor.fullName?.charAt(0).toUpperCase() || 'T'}
                        </div>
                        <div>
                          <p className="font-bold text-brand-dark text-sm">{tailor.fullName}</p>
                          <p className="text-xs text-gray-500">{tailor.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-sm font-semibold text-gray-700">
                      {tailor.businessName || <span className="text-gray-400 italic">Not set</span>}
                    </td>
                    <td className="p-5 text-sm font-medium text-gray-600">
                      {tailor.phoneNumber || tailor.phone || <span className="text-gray-400 italic">Not set</span>}
                    </td>
                    <td className="p-5">
                      {tailor.subscriptionStatus === 'pro' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                          <CheckCircle className="w-3 h-3 mr-1" /> PRO
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                          FREE
                        </span>
                      )}
                    </td>
                    <td className="p-5 text-sm text-gray-500 font-medium">
                      {new Date(tailor.createdAt).toLocaleDateString()}
                    </td>
                    
                    <td className="p-5 text-center relative">
                      <button 
                        onClick={() => toggleDropdown(tailor._id)}
                        className={`p-2 transition-colors rounded-lg ${openDropdown === tailor._id ? 'text-primary bg-primary/10' : 'text-gray-400 hover:text-primary hover:bg-primary/10'}`}
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {openDropdown === tailor._id && (
                        <div className="absolute right-8 top-12 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                          <button 
                            onClick={() => { navigate(`/admin/tailors/${tailor._id}`); toggleDropdown(tailor._id); }}
                            className="w-full text-left px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4 text-gray-400" /> View Profile
                          </button>
                          
                          <button 
                            onClick={() => { alert(`Suspending ${tailor.fullName}`); toggleDropdown(tailor._id); }}
                            className="w-full text-left px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Ban className="w-4 h-4 text-gray-400" /> Suspend Account
                          </button>
                          
                          <div className="h-px bg-gray-100 my-1"></div>
                          
                          <button 
                            onClick={() => triggerDelete(tailor)}
                            className="w-full text-left px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" /> Delete Tailor
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-12 text-center">
                    <SearchX className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm font-medium">No tailors found matching your search.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Sleek Confirmation Modal Overlay --- */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4 mx-auto">
              <ShieldAlert className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-black text-center text-brand-dark mb-2">Delete Tailor Account?</h3>
            <p className="text-center text-gray-500 text-sm mb-6">
              Are you sure you want to permanently remove <strong className="text-brand-dark">{tailorToDelete?.fullName}</strong>? This action cannot be undone and will erase all their dashboard access.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
                className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={executeDelete}
                disabled={isDeleting}
                className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}