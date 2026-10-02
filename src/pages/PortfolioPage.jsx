import { useState, useEffect, useMemo, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Image, Plus, X, Trash2, Edit3, Share2, Upload, AlertCircle, Star, ExternalLink, Search, Link2 } from 'lucide-react';
import PortfolioLightbox from './PortfolioLightbox';
import { GENDER_LABELS, GENDER_TABS, CATEGORIES, OCCASIONS, formatNaira } from '../constants/portfolioOptions';

const EMPTY_FORM = {
  title: '',
  description: '',
  gender: '',
  category: '',
  occasion: '',
  fabric: '',
  startingPrice: '',
  turnaroundDays: '',
  completedDate: '', // "YYYY-MM"
  featured: false,
};

const inputCls = 'w-full min-w-0 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-primary focus:bg-white text-base sm:text-sm font-medium';
const labelCls = 'block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5';

// Converts a saved portfolio item into the form shape
const itemToForm = (item) => ({
  title: item.title || '',
  description: item.description || '',
  gender: item.gender || '',
  category: item.category || '',
  occasion: item.occasion || '',
  fabric: item.fabric || '',
  startingPrice: item.startingPrice ?? '',
  turnaroundDays: item.turnaroundDays ?? '',
  completedDate: item.completedDate ? new Date(item.completedDate).toISOString().slice(0, 7) : '',
  featured: !!item.featured,
});

const buildFormData = (form, removedImages = [], newFiles = []) => {
  const fd = new FormData();
  fd.append('title', form.title.trim());
  fd.append('description', form.description.trim());
  fd.append('gender', form.gender);
  fd.append('category', form.category);
  fd.append('occasion', form.occasion);
  fd.append('fabric', form.fabric.trim());
  fd.append('startingPrice', form.startingPrice === '' ? '' : String(form.startingPrice));
  fd.append('turnaroundDays', form.turnaroundDays === '' ? '' : String(form.turnaroundDays));
  fd.append('completedDate', form.completedDate);
  fd.append('featured', String(!!form.featured));
  removedImages.forEach((url) => fd.append('removeImages', url));
  newFiles.forEach((file) => fd.append('images', file));
  return fd;
};

export default function PortfolioPage() {
  const { user } = useAuth() || {};
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = creating new
  const [form, setForm] = useState(EMPTY_FORM);
  const [existingImages, setExistingImages] = useState([]); // URLs already saved (edit mode)
  const [removedImages, setRemovedImages] = useState([]); // URLs the user removed (edit mode)
  const [newFiles, setNewFiles] = useState([]); // File objects pending upload
  const [newPreviews, setNewPreviews] = useState([]); // local blob URLs for newFiles
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const [activeItem, setActiveItem] = useState(null); // lightbox

  // List filters
  const [genderFilter, setGenderFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [search, setSearch] = useState('');

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    fetchPortfolio();
  }, []);

  // Stop the page behind the modal from scrolling on phones
  useEffect(() => {
    if (!showModal) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = original; };
  }, [showModal]);

  const fetchPortfolio = async () => {
    try {
      const response = await api.get('/portfolio');
      setItems(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch portfolio', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setExistingImages([]);
    setRemovedImages([]);
    setNewFiles([]);
    setNewPreviews([]);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingId(item._id);
    setForm(itemToForm(item));
    setExistingImages(item.images || []);
    setRemovedImages([]);
    setNewFiles([]);
    setNewPreviews([]);
    setError('');
    setShowModal(true);
  };

  const closeModal = () => {
    newPreviews.forEach((url) => URL.revokeObjectURL(url));
    setShowModal(false);
    resetForm();
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    setError('');

    const valid = [];
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        setError(`"${file.name}" is over 5MB and was skipped.`);
        continue;
      }
      if (!file.type.startsWith('image/')) {
        setError(`"${file.name}" isn't an image and was skipped.`);
        continue;
      }
      valid.push(file);
    }

    setNewFiles((prev) => [...prev, ...valid]);
    setNewPreviews((prev) => [...prev, ...valid.map((f) => URL.createObjectURL(f))]);
    e.target.value = '';
  };

  const removeExistingImage = (url) => {
    setExistingImages((prev) => prev.filter((u) => u !== url));
    setRemovedImages((prev) => [...prev, url]);
  };

  const removeNewImage = (index) => {
    URL.revokeObjectURL(newPreviews[index]);
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      setError('Please give this piece a title.');
      return;
    }
    if (!form.gender) {
      setError('Please choose who this piece is made for (Women, Men, Unisex or Kids).');
      return;
    }
    if (!form.category) {
      setError('Please choose a category.');
      return;
    }
    if (existingImages.length === 0 && newFiles.length === 0) {
      setError('Please add at least one photo.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const formData = buildFormData(form, removedImages, newFiles);

      if (editingId) {
        const response = await api.put(`/portfolio/${editingId}`, formData);
        setItems((prev) => prev.map((it) => (it._id === editingId ? response.data.data : it)));
      } else {
        const response = await api.post('/portfolio', formData);
        setItems((prev) => [response.data.data, ...prev]);
      }

      closeModal();
    } catch (err) {
      console.error('Save portfolio item error:', err);
      setError(err.response?.data?.error || 'Failed to save this piece. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Delete this portfolio piece? This cannot be undone.')) return;
    try {
      await api.delete(`/portfolio/${itemId}`);
      setItems((prev) => prev.filter((it) => it._id !== itemId));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete this piece.');
    }
  };

  // Quick pin/unpin from the card (featured pieces show first on the public page)
  const handleToggleFeatured = async (item) => {
    try {
      const fd = buildFormData({ ...itemToForm(item), featured: !item.featured });
      const response = await api.put(`/portfolio/${item._id}`, fd);
      setItems((prev) => prev.map((it) => (it._id === item._id ? response.data.data : it)));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update this piece.');
    }
  };

  const publicUrl = user?._id ? `${window.location.origin}/portfolio/${user._id}` : '';

  const handleSharePortfolio = () => {
    if (!publicUrl) return;
    const message = encodeURIComponent(`Take a look at my recent work! ${publicUrl}`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const handleCopyLink = async () => {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      alert('Portfolio link copied to clipboard!');
    } catch {
      alert(publicUrl);
    }
  };

  // Derived list data
  const sortedItems = useMemo(
    () => [...items].sort((a, b) => Number(!!b.featured) - Number(!!a.featured)),
    [items]
  );
  const allCategories = useMemo(
    () => [...new Set(items.map((i) => i.category).filter(Boolean))],
    [items]
  );
  const featuredCount = items.filter((i) => i.featured).length;

  const visibleItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sortedItems.filter((i) => {
      if (genderFilter !== 'All' && i.gender !== genderFilter) return false;
      if (categoryFilter !== 'All' && i.category !== categoryFilter) return false;
      if (!q) return true;
      return [i.title, i.description, i.fabric, i.category, i.occasion]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [sortedItems, genderFilter, categoryFilter, search]);

  const chipCls = (active) =>
    `shrink-0 px-4 py-2 rounded-full text-xs font-bold border transition-colors ${
      active
        ? 'bg-brand-dark text-white border-brand-dark'
        : 'bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary'
    }`;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 font-sans w-full max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-5 sm:p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-extrabold text-brand-dark">Portfolio</h1>
          <p className="text-gray-500 text-sm mt-1">Showcase your past work — clients can view this as a public gallery.</p>
        </div>
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
          <button
            onClick={handleCopyLink}
            className="px-4 py-3 sm:py-2.5 bg-gray-100 text-brand-dark font-bold text-sm rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center"
          >
            <Link2 className="w-4 h-4 mr-2 shrink-0" /> Copy Link
          </button>
          {publicUrl && (
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 sm:py-2.5 bg-gray-100 text-brand-dark font-bold text-sm rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center"
            >
              <ExternalLink className="w-4 h-4 mr-2 shrink-0" /> View Public
            </a>
          )}
          <button
            onClick={handleSharePortfolio}
            className="px-4 py-3 sm:py-2.5 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-700 transition-all flex items-center justify-center"
          >
            <Share2 className="w-4 h-4 mr-2 shrink-0" /> WhatsApp
          </button>
          <button
            onClick={openCreateModal}
            className="px-5 py-3 sm:py-2.5 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary-dark transition-all shadow-md shadow-primary/20 flex items-center justify-center"
          >
            <Plus className="w-4 h-4 mr-1.5 shrink-0" /> Add Piece
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 sm:py-20 bg-white rounded-3xl border border-dashed border-gray-200 px-4">
          <Image className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-brand-dark mb-1">No pieces yet</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">Add photos of your best work to start building a portfolio you can share with new clients.</p>
          <button onClick={openCreateModal} className="w-full sm:w-auto px-6 py-3 bg-primary text-white font-bold text-sm rounded-2xl hover:bg-primary-dark shadow-md shadow-primary/20">
            + Add Your First Piece
          </button>
        </div>
      ) : (
        <>
          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {[
              ['Pieces', items.length],
              ['Featured', featuredCount],
              ['Categories', allCategories.length],
            ].map(([label, value]) => (
              <div key={label} className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm">
                <p className="text-2xl sm:text-3xl font-black text-brand-dark">{value}</p>
                <p className="text-[11px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-100 shadow-sm space-y-3">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] -mx-4 px-4 md:mx-0 md:px-0">
                <button onClick={() => setGenderFilter('All')} className={chipCls(genderFilter === 'All')}>All</button>
                {GENDER_TABS.map((g) => (
                  <button key={g.value} onClick={() => setGenderFilter(g.value)} className={chipCls(genderFilter === g.value)}>
                    {g.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 md:ml-auto md:w-[28rem]">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full min-w-0 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary text-base sm:text-sm font-medium"
                >
                  <option value="All">All categories</option>
                  {allCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className="relative w-full">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search..."
                    className="w-full min-w-0 pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary text-base sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {visibleItems.length === 0 ? (
            <div className="text-center py-14 bg-white rounded-3xl border border-dashed border-gray-200 px-4">
              <p className="text-brand-dark font-bold mb-1">No pieces match your filters</p>
              <button
                onClick={() => { setGenderFilter('All'); setCategoryFilter('All'); setSearch(''); }}
                className="mt-3 text-primary font-bold text-sm hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {visibleItems.map((item) => (
                <div key={item._id} className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm overflow-hidden group min-w-0">
                  <div className="relative">
                    <button
                      onClick={() => setActiveItem(item)}
                      className="block w-full aspect-[3/4] bg-gray-100 overflow-hidden"
                      aria-label={`View ${item.title}`}
                    >
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </button>
                    {item.gender && (
                      <span className="absolute top-2 left-2 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md bg-white/90 text-brand-dark shadow-sm pointer-events-none">
                        {GENDER_LABELS[item.gender]}
                      </span>
                    )}
                    <button
                      onClick={() => handleToggleFeatured(item)}
                      title={item.featured ? 'Unpin from top' : 'Pin to top (Featured)'}
                      aria-label={item.featured ? 'Unpin from top' : 'Pin to top'}
                      className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-colors ${item.featured ? 'bg-amber-400 text-white' : 'bg-white/90 text-gray-400 hover:text-amber-500'}`}
                    >
                      <Star className={`w-4 h-4 ${item.featured ? 'fill-current' : ''}`} />
                    </button>
                    {item.images.length > 1 && (
                      <span className="absolute bottom-2 right-2 text-[10px] font-bold px-2 py-1 rounded-md bg-black/60 text-white pointer-events-none">
                        {item.images.length} photos
                      </span>
                    )}
                  </div>

                  <div className="p-3 sm:p-4">
                    {item.category && (
                      <p className="text-[10px] font-black uppercase tracking-wider text-primary truncate">{item.category}</p>
                    )}
                    <h4 className="font-bold text-brand-dark text-sm truncate mt-0.5">{item.title}</h4>
                    {(item.fabric || item.startingPrice) && (
                      <p className="text-[11px] font-bold text-gray-400 mt-1 truncate">
                        {item.fabric}
                        {item.fabric && item.startingPrice ? ' • ' : ''}
                        {item.startingPrice ? `From ${formatNaira(item.startingPrice)}` : ''}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => openEditModal(item)}
                        className="flex-1 px-3 py-2.5 sm:py-2 bg-gray-100 text-brand-dark font-bold text-xs rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center"
                      >
                        <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        aria-label="Delete piece"
                        className="px-3 py-2.5 sm:py-2 bg-red-50 text-red-600 font-bold text-xs rounded-xl hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Create/Edit Modal: bottom sheet on phones, centered dialog on sm+ */}
      {showModal && (
        <div className="fixed inset-0 bg-brand-dark/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-xl w-full p-5 sm:p-8 shadow-2xl relative max-h-[92vh] max-h-[92dvh] overflow-y-auto overscroll-contain">
            <button onClick={closeModal} aria-label="Close" className="absolute top-4 right-4 sm:top-6 sm:right-6 text-gray-400 hover:text-brand-dark p-1">
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-lg sm:text-xl font-extrabold text-brand-dark mb-5 sm:mb-6 pr-8">
              {editingId ? 'Edit Piece' : 'Add New Piece'}
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100 flex items-start">
                <AlertCircle className="w-4 h-4 mr-2 mt-0.5 shrink-0" /> <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className={labelCls}>Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setField('title', e.target.value)}
                  placeholder="e.g. Royal Blue Senator Suit"
                  className={inputCls}
                />
              </div>

              {/* Made for */}
              <div>
                <label className={labelCls}>Made For *</label>
                <div className="grid grid-cols-4 gap-2">
                  {GENDER_TABS.map((g) => (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => setField('gender', g.value)}
                      className={`py-3 rounded-xl text-xs sm:text-sm font-bold border transition-colors ${form.gender === g.value ? 'bg-primary text-white border-primary shadow-md shadow-primary/20' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-primary'}`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="min-w-0">
                  <label className={labelCls}>Category *</label>
                  <select value={form.category} onChange={(e) => setField('category', e.target.value)} className={inputCls}>
                    <option value="">Select category...</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="min-w-0">
                  <label className={labelCls}>Occasion</label>
                  <select value={form.occasion} onChange={(e) => setField('occasion', e.target.value)} className={inputCls}>
                    <option value="">Select occasion...</option>
                    {OCCASIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelCls}>Fabric</label>
                <input
                  type="text"
                  value={form.fabric}
                  onChange={(e) => setField('fabric', e.target.value)}
                  placeholder="e.g. Italian cashmere, Ankara, Lace"
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="min-w-0">
                  <label className={labelCls}>Starting Price (₦)</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    value={form.startingPrice}
                    onChange={(e) => setField('startingPrice', e.target.value)}
                    placeholder="e.g. 45000"
                    className={inputCls}
                  />
                </div>
                <div className="min-w-0">
                  <label className={labelCls}>Turnaround (days)</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    value={form.turnaroundDays}
                    onChange={(e) => setField('turnaroundDays', e.target.value)}
                    placeholder="e.g. 14"
                    className={inputCls}
                  />
                </div>
                <div className="min-w-0">
                  <label className={labelCls}>Completed</label>
                  <input
                    type="month"
                    value={form.completedDate}
                    onChange={(e) => setField('completedDate', e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setField('description', e.target.value)}
                  placeholder="Style notes, details, client brief..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-primary focus:bg-white text-base sm:text-sm resize-none min-h-[90px]"
                />
              </div>

              <label className="flex items-start gap-3 p-4 bg-amber-50/60 border border-amber-100 rounded-2xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setField('featured', e.target.checked)}
                  className="mt-0.5 w-5 h-5 accent-amber-500 shrink-0"
                />
                <span>
                  <span className="block text-sm font-bold text-brand-dark">Feature this piece</span>
                  <span className="block text-xs text-gray-500 mt-0.5">Featured pieces appear first on your public portfolio.</span>
                </span>
              </label>

              <div>
                <label className={labelCls}>Photos</label>

                {(existingImages.length > 0 || newPreviews.length > 0) && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
                    {existingImages.map((url, idx) => (
                      <div key={url} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        {idx === 0 && (
                          <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">COVER</span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeExistingImage(url)}
                          aria-label="Remove photo"
                          className="absolute top-1 right-1 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {newPreviews.map((url, idx) => (
                      <div key={url} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 left-1 bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          {existingImages.length === 0 && idx === 0 ? 'COVER' : 'NEW'}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeNewImage(idx)}
                          aria-label="Remove photo"
                          className="absolute top-1 right-1 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <label className="flex items-center justify-center px-5 py-3.5 bg-gray-50 hover:bg-gray-100 text-brand-dark font-bold text-xs rounded-xl border border-dashed border-gray-300 cursor-pointer transition-all">
                  <Upload className="w-4 h-4 mr-2 text-gray-500" /> Add Photos (up to 5MB each)
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-gray-400 font-medium mt-2">The first photo is used as the cover. Portrait (3:4) photos look best.</p>
              </div>

              <div className="pt-4 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 border-t border-gray-100">
                <button type="button" onClick={closeModal} className="px-5 py-3 text-gray-600 font-bold text-sm hover:bg-gray-100 rounded-2xl w-full sm:w-auto">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="px-6 py-3 bg-primary text-white font-bold text-sm rounded-2xl hover:bg-primary-dark disabled:opacity-70 w-full sm:w-auto shadow-md shadow-primary/20">
                  {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Piece'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeItem && <PortfolioLightbox item={activeItem} onClose={() => setActiveItem(null)} />}
    </div>
  );
}
