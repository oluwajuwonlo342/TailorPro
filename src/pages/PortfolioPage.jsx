import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Image, Plus, X, Trash2, Edit3, Share2, Upload, AlertCircle } from 'lucide-react';

export default function PortfolioPage() {
  const { user } = useAuth() || {};
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = creating new
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [existingImages, setExistingImages] = useState([]); // URLs already saved (edit mode)
  const [removedImages, setRemovedImages] = useState([]); // URLs the user removed (edit mode)
  const [newFiles, setNewFiles] = useState([]); // File objects pending upload
  const [newPreviews, setNewPreviews] = useState([]); // local blob URLs for newFiles
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Lightbox
  const [lightbox, setLightbox] = useState(null); // { images: [], index: 0 }

  useEffect(() => {
    fetchPortfolio();
  }, []);

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
    setTitle('');
    setDescription('');
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
    setTitle(item.title || '');
    setDescription(item.description || '');
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

    if (!title.trim()) {
      setError('Please give this piece a title.');
      return;
    }
    if (existingImages.length === 0 && newFiles.length === 0) {
      setError('Please add at least one photo.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      removedImages.forEach((url) => formData.append('removeImages', url));
      newFiles.forEach((file) => formData.append('images', file));

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

  const publicUrl = user?._id ? `${window.location.origin}/portfolio/${user._id}` : '';

  const handleSharePortfolio = () => {
    if (!publicUrl) return;
    const message = encodeURIComponent(
      `Take a look at my recent work! ${publicUrl}`
    );
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

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans max-w-7xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-brand-dark">Portfolio</h1>
          <p className="text-gray-500 text-sm mt-1">Showcase your past work — clients can view this as a public gallery.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleCopyLink}
            className="px-4 py-2.5 bg-gray-100 text-brand-dark font-bold text-sm rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center"
          >
            Copy Link
          </button>
          <button
            onClick={handleSharePortfolio}
            className="px-4 py-2.5 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-700 transition-all flex items-center justify-center"
          >
            <Share2 className="w-4 h-4 mr-2 shrink-0" /> Share via WhatsApp
          </button>
          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary-dark transition-all shadow-md shadow-primary/20 flex items-center justify-center"
          >
            <Plus className="w-4 h-4 mr-1.5 shrink-0" /> Add New Piece
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <Image className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-brand-dark mb-1">No pieces yet</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">Add photos of your best work to start building a portfolio you can share with new clients.</p>
          <button onClick={openCreateModal} className="px-6 py-3 bg-primary text-white font-bold text-sm rounded-2xl hover:bg-primary-dark shadow-md shadow-primary/20">
            + Add Your First Piece
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {items.map((item) => (
            <div key={item._id} className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm overflow-hidden group">
              <button
                onClick={() => setLightbox({ images: item.images, index: 0 })}
                className="block w-full aspect-square bg-gray-100 overflow-hidden"
              >
                <img
                  src={item.images[0]}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </button>
              <div className="p-3 sm:p-4">
                <h4 className="font-bold text-brand-dark text-sm truncate">{item.title}</h4>
                {item.images.length > 1 && (
                  <p className="text-[11px] font-bold text-gray-400 mt-0.5">{item.images.length} photos</p>
                )}
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => openEditModal(item)}
                    className="flex-1 px-3 py-2 bg-gray-100 text-brand-dark font-bold text-xs rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center"
                  >
                    <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="px-3 py-2 bg-red-50 text-red-600 font-bold text-xs rounded-xl hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-brand-dark/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={closeModal} className="absolute top-6 right-6 text-gray-400 hover:text-brand-dark">
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-xl font-extrabold text-brand-dark mb-6">
              {editingId ? 'Edit Piece' : 'Add New Piece'}
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 shrink-0" /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Royal Blue Senator Suit"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-primary text-sm font-medium focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Fabric, style notes, occasion..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-primary text-sm resize-none min-h-[90px] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Photos</label>

                {(existingImages.length > 0 || newPreviews.length > 0) && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
                    {existingImages.map((url) => (
                      <div key={url} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(url)}
                          className="absolute top-1 right-1 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {newPreviews.map((url, idx) => (
                      <div key={url} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 left-1 bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded">NEW</span>
                        <button
                          type="button"
                          onClick={() => removeNewImage(idx)}
                          className="absolute top-1 right-1 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <label className="flex items-center justify-center px-5 py-3 bg-gray-50 hover:bg-gray-100 text-brand-dark font-bold text-xs rounded-xl border border-dashed border-gray-300 cursor-pointer transition-all">
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

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button onClick={() => setLightbox(null)} className="absolute top-6 right-6 text-white/80 hover:text-white">
            <X className="w-8 h-8" />
          </button>

          <div className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightbox.images[lightbox.index]}
              alt=""
              className="w-full max-h-[80vh] object-contain rounded-2xl"
            />
            {lightbox.images.length > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                {lightbox.images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setLightbox({ ...lightbox, index: idx })}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${idx === lightbox.index ? 'bg-white' : 'bg-white/30'}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
