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
    return (
      <div className="flex h-[60vh] items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <div className="text-gray-500 font-bold text-sm tracking-wide">Loading Tailor Database...</div>
        </div>
      </div>
    );
  }

  // Action Dropdown Component to avoid code duplication between mobile and desktop views
  const ActionMenu = ({ tailor }) => (
    <div className="relative">
      <button 
        onClick={() => toggleDropdown(tailor._id)}
        className={`p-2 transition-all rounded-xl ${openDropdown === tailor._id ? 'text-primary bg-primary/10 shadow-inner' : 'text-gray-400 hover:text-primary hover:bg-primary/5'}`}
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {openDropdown === tailor._id && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpenDropdown(null)}></div>
          <div className="absolute right-0 top-12 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in">
            <button 
              onClick={() => { navigate(`/admin/tailors/${tailor._id}`); toggleDropdown(tailor._id); }}
              className="w-full text-left px-5 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
            >
              <Eye className="w-4 h-4 text-gray-400" /> View Profile
            </button>
            
            <button 
              onClick={() => { alert(`Suspending ${tailor.fullName}`); toggleDropdown(tailor._id); }}
              className="w-full text-left px-5 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
            >
              <Ban className="w-4 h-4 text-gray-400" /> Suspend Account
            </button>
            
            <div className="h-px bg-gray-100 my-1.5"></div>
            
            <button 
              onClick={() => triggerDelete(tailor)}
              className="w-full text-left px-5 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
            >
              <Trash2 className="w-4 h-4 text-red-500" /> Delete Tailor
            </button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 font-sans relative px-4 sm:px-6 lg:px-8 pb-20 pt-4 sm:pt-8">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark tracking-tight">Manage Tailors</h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">View, audit, and manage all registered tailors on the platform.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-2xl flex items-center text-sm font-bold border border-red-100 shadow-sm animate-fade-in">
          <ShieldAlert className="w-5 h-5 mr-2 shrink-0" />
          {error}
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:max-w-md">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search by name, business, or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary transition-all font-bold text-brand-dark shadow-sm"
          />
        </div>
        <div className="text-[11px] font-black text-gray-400 uppercase tracking-widest w-full md:w-auto text-left md:text-right px-2 md:px-0">
          Total Directory: <span className="text-brand-dark text-sm ml-1 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">{filteredTailors.length}</span>
        </div>
      </div>

      {/* ==================================================== */}
      {/* MOBILE VIEW (Cards) - Visible only on screens < lg */}
      {/* ==================================================== */}
      <div className="lg:hidden space-y-5">
        {filteredTailors.length > 0 ? (
          filteredTailors.map((tailor) => (
            <div key={tailor._id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-5 hover:shadow-md transition-shadow">
              
              {/* Top Row: User Info & Actions */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className="w-14 h-14 rounded-2xl bg-brand-dark text-white shrink-0 flex items-center justify-center font-bold text-xl shadow-sm">
                    {tailor.fullName?.charAt(0).toUpperCase() || 'T'}
                  </div>
                  <div className="truncate">
                    <p className="font-extrabold text-brand-dark text-lg truncate mb-0.5">{tailor.fullName}</p>
                    <p className="text-xs font-semibold text-gray-500 truncate">{tailor.email}</p>
                  </div>
                </div>
                <ActionMenu tailor={tailor} />
              </div>

              {/* Bottom Grid: Data Points */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50/80 border border-gray-100 p-5 rounded-2xl">
                <div>
                  <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1.5">Business</p>
                  <p className="text-sm font-bold text-gray-700 truncate">{tailor.businessName || <span className="text-gray-400 italic">Not set</span>}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1.5">Phone</p>
                  <p className="text-sm font-bold text-gray-700 truncate">{tailor.phoneNumber || tailor.phone || <span className="text-gray-400 italic">Not set</span>}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1.5">Status</p>
                  {tailor.plan === 'pro' ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wider border bg-emerald-50 text-emerald-700 border-emerald-200">
                      <CheckCircle className="w-3 h-3 mr-1" /> PRO
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wider border bg-gray-100 text-gray-600 border-gray-200">
                      FREE
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1.5">Joined</p>
                  <p className="text-sm font-bold text-gray-700">
                    {new Date(tailor.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-12 text-center rounded-3xl border border-gray-100 shadow-sm">
            <SearchX className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-brand-dark text-lg font-bold mb-1">No Tailors Found</p>
            <p className="text-gray-500 text-sm font-medium">Try adjusting your search terms.</p>
          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* DESKTOP VIEW (Table) - Visible only on screens >= lg */}
      {/* ==================================================== */}
      <div className="hidden lg:block bg-white rounded-3xl border border-gray-100 shadow-sm overflow-visible pb-16 min-h-[400px]">
        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-[11px] uppercase tracking-widest border-b border-gray-100">
                <th className="p-6 font-black">Tailor Details</th>
                <th className="p-6 font-black">Business Name</th>
                <th className="p-6 font-black">Phone Number</th>
                <th className="p-6 font-black">Subscription</th>
                <th className="p-6 font-black">Joined Date</th>
                <th className="p-6 font-black text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredTailors.length > 0 ? (
                filteredTailors.map((tailor) => (
                  <tr key={tailor._id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-brand-dark text-white shrink-0 flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
                          {tailor.fullName?.charAt(0).toUpperCase() || 'T'}
                        </div>
                        <div>
                          <p className="font-extrabold text-brand-dark text-sm mb-0.5">{tailor.fullName}</p>
                          <p className="text-xs font-semibold text-gray-500">{tailor.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-sm font-bold text-gray-700">
                      {tailor.businessName || <span className="text-gray-400 italic">Not set</span>}
                    </td>
                    <td className="p-6 text-sm font-bold text-gray-700">
                      {tailor.phoneNumber || tailor.phone || <span className="text-gray-400 italic">Not set</span>}
                    </td>
                    <td className="p-6">
                      {tailor.plan === 'pro' ? (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border bg-emerald-50 text-emerald-700 border-emerald-200">
                          <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> PRO PLAN
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border bg-gray-100 text-gray-600 border-gray-200">
                          FREE PLAN
                        </span>
                      )}
                    </td>
                    <td className="p-6 text-sm text-gray-500 font-bold">
                      {new Date(tailor.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="p-6 text-center">
                      <ActionMenu tailor={tailor} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-16 text-center">
                    <SearchX className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                    <p className="text-brand-dark text-lg font-bold mb-1">No Tailors Found</p>
                    <p className="text-gray-500 text-sm font-medium">Try adjusting your search terms.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Sleek Confirmation Modal Overlay --- */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl mx-4 transform transition-all">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-red-50 border border-red-100 mb-6 mx-auto shadow-inner">
              <ShieldAlert className="w-7 h-7 text-red-600" />
            </div>
            <h3 className="text-2xl font-black text-center text-brand-dark mb-3">Delete Account?</h3>
            <p className="text-center text-gray-500 text-sm mb-8 font-medium leading-relaxed">
              Are you sure you want to permanently remove <strong className="text-brand-dark font-black">{tailorToDelete?.fullName}</strong>? This action cannot be undone and will erase all their dashboard access and customer data.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
                className="flex-1 py-3.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={executeDelete}
                disabled={isDeleting}
                className="flex-1 py-3.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-red-600/20 flex items-center justify-center disabled:opacity-70"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  'Yes, Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
