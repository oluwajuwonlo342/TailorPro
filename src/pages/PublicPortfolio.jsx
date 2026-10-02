import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { Scissors, AlertCircle, Phone, MapPin, Search, Star } from 'lucide-react';
import PortfolioLightbox from './PortfolioLightbox';
import { GENDER_LABELS, GENDER_TABS, formatNaira } from './PortfolioOptions';

export default function PublicPortfolio() {
  const { userId } = useParams();
  const [tailor, setTailor] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeItem, setActiveItem] = useState(null);

  // Filters
  const [genderFilter, setGenderFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [search, setSearch] = useState('');

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

  // Featured pieces first
  const sortedItems = useMemo(
    () => [...items].sort((a, b) => Number(!!b.featured) - Number(!!a.featured)),
    [items]
  );

  const genderCounts = useMemo(() => {
    const counts = {};
    items.forEach((i) => { if (i.gender) counts[i.gender] = (counts[i.gender] || 0) + 1; });
    return counts;
  }, [items]);

  const specialties = useMemo(
    () => [...new Set(items.map((i) => i.category).filter(Boolean))],
    [items]
  );

  // Images for the hero background: the tailor's cover image if they have one,
  // otherwise a collage of their own work (featured pieces first)
  const heroImages = useMemo(() => {
    if (tailor?.coverImage) return [tailor.coverImage];
    return sortedItems.map((i) => i.images?.[0]).filter(Boolean).slice(0, 6);
  }, [tailor, sortedItems]);

  const byGender = useMemo(
    () => sortedItems.filter((i) => genderFilter === 'All' || i.gender === genderFilter),
    [sortedItems, genderFilter]
  );

  // Only offer categories that actually exist for the selected gender
  const categoryOptions = useMemo(
    () => [...new Set(byGender.map((i) => i.category).filter(Boolean))],
    [byGender]
  );

  const visibleItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return byGender.filter((i) => {
      if (categoryFilter !== 'All' && i.category !== categoryFilter) return false;
      if (!q) return true;
      return [i.title, i.description, i.fabric, i.category, i.occasion]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [byGender, categoryFilter, search]);

  const clearFilters = () => {
    setGenderFilter('All');
    setCategoryFilter('All');
    setSearch('');
  };

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
  const location = tailor?.location || tailor?.address;
  const phoneDigits = tailor?.phone ? tailor.phone.replace(/[^0-9]/g, '') : '';

  const orderUrlFor = (item) =>
    phoneDigits
      ? `https://wa.me/${phoneDigits}?text=${encodeURIComponent(
          `Hello ${brandName}, I saw "${item.title}" on your portfolio and I'd like to order something similar.`
        )}`
      : null;

  const chipCls = (active) =>
    `shrink-0 px-4 py-2 rounded-full text-xs font-bold border transition-colors ${
      active
        ? 'bg-brand-dark text-white border-brand-dark'
        : 'bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary'
    }`;

  const filtersActive = genderFilter !== 'All' || categoryFilter !== 'All' || search.trim() !== '';

  return (
    <div
      className="min-h-screen bg-brand-bg font-sans"
      style={{
        backgroundImage: 'radial-gradient(rgba(15, 20, 35, 0.07) 1px, transparent 1px)',
        backgroundSize: '22px 22px',
      }}
    >
      {/* Header */}
      <div className="bg-brand-dark px-5 sm:px-6 py-14 sm:py-20 text-center relative overflow-hidden rounded-b-[2rem] sm:rounded-b-[3rem] shadow-xl">
        {/* Background image layer: single cover photo, or a collage of the tailor's work */}
        {heroImages.length >= 3 ? (
          <div className="absolute inset-0 grid grid-cols-3 sm:grid-cols-6 opacity-40" aria-hidden="true">
            {heroImages.slice(0, 6).map((src, i) => (
              <div
                key={src + i}
                className={`bg-cover bg-center ${i >= 3 ? 'hidden sm:block' : ''}`}
                style={{ backgroundImage: `url("${src}")` }}
              />
            ))}
          </div>
        ) : heroImages.length > 0 ? (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40"
            style={{ backgroundImage: `url("${heroImages[0]}")` }}
            aria-hidden="true"
          />
        ) : null}

        {/* Dark gradient so text stays readable on any photo */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/70 via-brand-dark/80 to-brand-dark" aria-hidden="true"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-primary"></div>

        <div className="relative z-10">
        <div className="w-24 h-24 rounded-3xl overflow-hidden bg-primary/20 text-white flex items-center justify-center mx-auto mb-5 ring-4 ring-white/10 border border-white/30 shadow-2xl">
          {tailor?.profilePhoto ? (
            <img src={tailor.profilePhoto} alt={brandName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl font-black">{initial}</span>
          )}
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white mb-2 tracking-tight break-words">{brandName}</h1>
        <p className="text-gray-300 text-sm font-medium">Fashion Designer • Portfolio of Recent Work</p>

        {location && (
          <p className="inline-flex items-center justify-center text-gray-400 text-xs font-semibold mt-2">
            <MapPin className="w-3.5 h-3.5 mr-1 shrink-0" /> {location}
          </p>
        )}

        {tailor?.bio && (
          <p className="text-gray-300 text-sm font-medium mt-4 max-w-xl mx-auto leading-relaxed">{tailor.bio}</p>
        )}

        {specialties.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mt-5 max-w-2xl mx-auto">
            {specialties.slice(0, 6).map((s) => (
              <span key={s} className="text-[11px] font-bold text-white/80 bg-white/10 border border-white/10 px-3 py-1 rounded-full">
                {s}
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
          {phoneDigits && (
            <a
              href={`https://wa.me/${phoneDigits}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full sm:w-auto px-5 py-3 bg-emerald-600 text-white font-bold text-sm rounded-2xl hover:bg-emerald-700 transition-all shadow-lg"
            >
              <Phone className="w-4 h-4 mr-2" /> Contact on WhatsApp
            </a>
          )}
          {items.length > 0 && (
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              {items.length} piece{items.length > 1 ? 's' : ''} • {specialties.length} categor{specialties.length === 1 ? 'y' : 'ies'}
            </span>
          )}
        </div>
        </div>
      </div>

      {/* Filters (sticky) */}
      {items.length > 0 && (
        <div className="sticky top-0 z-30 bg-brand-bg/95 backdrop-blur border-b border-gray-200/70">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              {/* Gender tabs */}
              <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] -mx-4 px-4 sm:mx-0 sm:px-0">
                <button onClick={() => { setGenderFilter('All'); setCategoryFilter('All'); }} className={chipCls(genderFilter === 'All')}>
                  All ({items.length})
                </button>
                {GENDER_TABS.filter((g) => genderCounts[g.value]).map((g) => (
                  <button
                    key={g.value}
                    onClick={() => { setGenderFilter(g.value); setCategoryFilter('All'); }}
                    className={chipCls(genderFilter === g.value)}
                  >
                    {g.label} ({genderCounts[g.value]})
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative sm:ml-auto sm:w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search styles, fabrics..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-full outline-none focus:border-primary text-base sm:text-sm"
                />
              </div>
            </div>

            {/* Category chips */}
            {categoryOptions.length > 1 && (
              <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] -mx-4 px-4 sm:mx-0 sm:px-0">
                <button onClick={() => setCategoryFilter('All')} className={chipCls(categoryFilter === 'All')}>
                  All categories
                </button>
                {categoryOptions.map((c) => (
                  <button key={c} onClick={() => setCategoryFilter(c)} className={chipCls(categoryFilter === c)}>
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Gallery */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 font-medium">No pieces have been added yet — check back soon.</p>
          </div>
        ) : visibleItems.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-brand-dark font-bold mb-1">No pieces match your filters</p>
            <p className="text-gray-500 text-sm mb-5">Try a different category or clear the search.</p>
            <button onClick={clearFilters} className="px-5 py-2.5 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary-dark">
              Clear filters
            </button>
          </div>
        ) : (
          <>
            {filtersActive && (
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                Showing {visibleItems.length} of {items.length} pieces
              </p>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {visibleItems.map((item) => (
                <div key={item._id} className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm overflow-hidden group min-w-0">
                  <button
                    onClick={() => setActiveItem(item)}
                    className="relative block w-full aspect-[3/4] bg-gray-100 overflow-hidden"
                    aria-label={`View ${item.title}`}
                  >
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {item.gender && (
                      <span className="absolute top-2 left-2 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md bg-white/90 text-brand-dark shadow-sm">
                        {GENDER_LABELS[item.gender]}
                      </span>
                    )}
                    {item.featured && (
                      <span className="absolute top-2 right-2 w-7 h-7 rounded-full bg-amber-400 text-white flex items-center justify-center shadow-sm" title="Featured">
                        <Star className="w-3.5 h-3.5 fill-current" />
                      </span>
                    )}
                    {item.images.length > 1 && (
                      <span className="absolute bottom-2 right-2 text-[10px] font-bold px-2 py-1 rounded-md bg-black/60 text-white">
                        {item.images.length} photos
                      </span>
                    )}
                  </button>
                  <div className="p-3 sm:p-4">
                    {item.category && (
                      <p className="text-[10px] font-black uppercase tracking-wider text-primary truncate">{item.category}</p>
                    )}
                    <h4 className="font-bold text-brand-dark text-sm truncate mt-0.5">{item.title}</h4>
                    {item.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                    )}
                    {(item.fabric || item.startingPrice) && (
                      <p className="text-[11px] font-bold text-gray-400 mt-2 truncate">
                        {item.fabric}
                        {item.fabric && item.startingPrice ? ' • ' : ''}
                        {item.startingPrice ? `From ${formatNaira(item.startingPrice)}` : ''}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="pb-10 text-center flex items-center justify-center gap-2 text-gray-400">
        <Scissors className="w-4 h-4" />
        <span className="text-xs font-bold uppercase tracking-widest">Powered by TailorPro</span>
      </div>

      {activeItem && (
        <PortfolioLightbox
          item={activeItem}
          onClose={() => setActiveItem(null)}
          orderUrl={orderUrlFor(activeItem)}
        />
      )}
    </div>
  );
}
