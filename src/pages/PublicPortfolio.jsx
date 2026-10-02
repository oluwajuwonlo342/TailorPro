import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { Scissors, AlertCircle, Phone, X } from 'lucide-react';

export default function PublicPortfolio() {
  const { userId } = useParams();
  const [tailor, setTailor] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lightbox, setLightbox] = useState(null); // { images: [], index: 0 }

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const res = await api.get(`/portfolio/public/${userId}`);
        setTailor(res.data.tailor);
        setItems(res.data.data || []);
      } catch (err) {
        setError('This portfolio link is invalid or no longer available.');
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-bg px-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-brand-dark font-bold animate-pulse">Loading portfolio...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl max-w-md w-full text-center border border-gray-100">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-5 border border-red-100">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-brand-dark mb-2">Portfolio Unavailable</h2>
          <p className="text-gray-600 text-sm font-medium">{error}</p>
        </div>
      </div>
    );
  }

  const brandName = tailor?.businessName || tailor?.fullName || 'Tailor';
  const initial = brandName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-brand-bg font-sans">
      {/* Header */}
      <div className="bg-brand-dark px-6 py-12 sm:py-16 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-primary"></div>
        <div className="w-20 h-20 rounded-3xl overflow-hidden bg-primary/20 text-white flex items-center justify-center mx-auto mb-5 border border-white/20 shadow-lg">
          {tailor?.profilePhoto ? (
            <img src={tailor.profilePhoto} alt={brandName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl font-black">{initial}</span>
          )}
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white mb-2 tracking-tight">{brandName}</h1>
        <p className="text-gray-300 text-sm font-medium">Portfolio of Recent Work</p>

        {tailor?.phone && (
          <a
            href={`https://wa.me/${tailor.phone.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center mt-6 px-5 py-3 bg-emerald-600 text-white font-bold text-sm rounded-2xl hover:bg-emerald-700 transition-all shadow-lg"
          >
            <Phone className="w-4 h-4 mr-2" /> Contact on WhatsApp
          </a>
        )}
      </div>

      {/* Gallery */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 font-medium">No pieces have been added yet — check back soon.</p>
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
                  {item.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                  )}
                  {item.images.length > 1 && (
                    <p className="text-[11px] font-bold text-gray-400 mt-1.5">{item.images.length} photos</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pb-10 text-center flex items-center justify-center gap-2 text-gray-400">
        <Scissors className="w-4 h-4" />
        <span className="text-xs font-bold uppercase tracking-widest">Powered by TailorPro</span>
      </div>

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
