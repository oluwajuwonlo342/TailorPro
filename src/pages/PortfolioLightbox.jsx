// Save as: src/components/PortfolioLightbox.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Star, Phone } from 'lucide-react';
import { GENDER_LABELS, formatNaira, formatMonthYear } from './PortfolioOptions';

/*
 * item:     the portfolio piece
 * onClose:  close handler
 * orderUrl: optional. When provided (public page), shows an "Order a similar style" button.
 */
export default function PortfolioLightbox({ item, onClose, orderUrl }) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef(null);
  const images = item.images || [];

  const next = useCallback(() => setIndex((i) => (i + 1) % images.length), [images.length]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + images.length) % images.length), [images.length]);

  // Lock page scroll while open (runs once, so the original value is restored correctly)
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = original; };
  }, []);

  // Keyboard: Esc closes, arrows navigate
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (images.length > 1 && e.key === 'ArrowRight') next();
      if (images.length > 1 && e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, next, prev, images.length]);

  // Swipe on touch devices
  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null || images.length < 2) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
    touchStartX.current = null;
  };

  const details = [
    ['Category', item.category],
    ['Made for', GENDER_LABELS[item.gender]],
    ['Fabric', item.fabric],
    ['Occasion', item.occasion],
    ['Starting from', item.startingPrice ? formatNaira(item.startingPrice) : null],
    ['Turnaround', item.turnaroundDays ? `${item.turnaroundDays} day${Number(item.turnaroundDays) > 1 ? 's' : ''}` : null],
    ['Completed', item.completedDate ? formatMonthYear(item.completedDate) : null],
  ].filter(([, value]) => value);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 overflow-y-auto overscroll-contain" onClick={onClose}>
      <div className="min-h-full flex items-center justify-center p-3 sm:p-6">
        <div
          className="relative w-full max-w-5xl bg-white rounded-3xl overflow-hidden grid lg:grid-cols-[3fr_2fr]"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3 right-3 z-20 w-10 h-10 rounded-full bg-black/50 text-white hover:bg-black/70 flex items-center justify-center backdrop-blur-sm"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Image side */}
          <div className="bg-black flex flex-col">
            <div
              className="relative flex-1 flex items-center justify-center min-h-[280px]"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={images[index]}
                alt={`${item.title} - photo ${index + 1}`}
                className="w-full max-h-[62vh] lg:max-h-[80vh] object-contain"
              />

              {images.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    aria-label="Previous photo"
                    className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white hover:bg-black/70 flex items-center justify-center"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={next}
                    aria-label="Next photo"
                    className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white hover:bg-black/70 flex items-center justify-center"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <span className="absolute bottom-3 left-3 text-[11px] font-bold text-white bg-black/50 px-2.5 py-1 rounded-full">
                    {index + 1} / {images.length}
                  </span>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto p-3 bg-black/80">
                {images.map((url, idx) => (
                  <button
                    key={url + idx}
                    onClick={() => setIndex(idx)}
                    aria-label={`Show photo ${idx + 1}`}
                    className={`w-14 h-14 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${idx === index ? 'border-white' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details side */}
          <div className="p-5 sm:p-8 flex flex-col">
            <div className="flex flex-wrap items-center gap-2 mb-3 pr-10 lg:pr-0">
              {item.gender && (
                <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-primary/10 text-primary">
                  {GENDER_LABELS[item.gender]}
                </span>
              )}
              {item.featured && (
                <span className="inline-flex items-center text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-amber-100 text-amber-700">
                  <Star className="w-3 h-3 mr-1 fill-current" /> Featured
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-brand-dark break-words">{item.title}</h2>

            {item.description && (
              <p className="text-sm text-gray-600 font-medium mt-3 leading-relaxed whitespace-pre-wrap break-words">{item.description}</p>
            )}

            {details.length > 0 && (
              <dl className="mt-6 grid grid-cols-2 gap-3">
                {details.map(([label, value]) => (
                  <div key={label} className="bg-gray-50 border border-gray-100 rounded-2xl p-3 min-w-0">
                    <dt className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{label}</dt>
                    <dd className="text-sm font-bold text-brand-dark mt-0.5 break-words">{value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {orderUrl && (
              <a
                href={orderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 lg:mt-auto lg:pt-6 w-full"
              >
                <span className="w-full px-5 py-3.5 bg-emerald-600 text-white font-bold text-sm rounded-2xl hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center">
                  <Phone className="w-4 h-4 mr-2" /> Order a similar style
                </span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
