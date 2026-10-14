import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Printer, Scissors, Download } from 'lucide-react';

const formatNaira = (value) =>
  `₦${(Number(value) || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

const formatDate = (value) =>
  new Date(value || Date.now()).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

// Print rules: show ONLY the invoice (hide the rest of the app) and keep colours on paper
const PRINT_CSS = `
@media print {
  @page { size: A4; margin: 12mm; }
  html, body { overflow: visible !important; height: auto !important; background: #fff !important; }
  body > *:not(.invoice-portal) { display: none !important; }
  .invoice-portal {
    position: static !important;
    inset: auto !important;
    overflow: visible !important;
    background: #fff !important;
    padding: 0 !important;
  }
  .invoice-sheet {
    box-shadow: none !important;
    border: none !important;
    border-radius: 0 !important;
    max-width: none !important;
    margin: 0 !important;
    overflow: visible !important;
  }
  .invoice-sheet, .invoice-sheet * {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .invoice-avoid-break { break-inside: avoid; }
}
`;

export default function InvoiceModal({
  order,
  customer,
  businessName,
  businessPhone,
  businessAddress,
  logoUrl,
  isOpen,
  onClose
}) {
  const [imageError, setImageError] = useState(false);
  const originalTitle = useRef(typeof document !== 'undefined' ? document.title : '');

  // Lock page scrolling behind the modal, and close on Escape
  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
      document.title = originalTitle.current;
    };
  }, [isOpen, onClose]);

  if (!isOpen || !order) return null;

  const totalAmount = Number(order.totalAmount) || 0;
  const amountPaid = Number(order.depositPaid || order.amountPaid) || 0;
  const balanceDue = Math.max(0, totalAmount - amountPaid);
  const isPaidInFull = totalAmount > 0 && balanceDue === 0;

  const customerName = customer?.fullName || customer?.name || 'Valued Customer';
  const invoiceNumber =
    order.orderNumber || `INV-${String(order._id || '').slice(-6).toUpperCase() || '000000'}`;
  const displayName = businessName || 'TailorPro Fashion';

  // The browser uses the page title as the PDF file name, so set a meaningful one while printing
  const handlePrintOrDownload = () => {
    const safeName = `${invoiceNumber}-${customerName}`
      .replace(/[^\w\- ]+/g, '')
      .trim()
      .replace(/\s+/g, '-');

    document.title = safeName || 'Invoice';

    const restoreTitle = () => {
      document.title = originalTitle.current;
      window.removeEventListener('afterprint', restoreTitle);
    };
    window.addEventListener('afterprint', restoreTitle);

    window.print();
  };

  const contactLine = [businessAddress, businessPhone].filter(Boolean).join('  •  ');

  const modal = (
    <div
      className="invoice-portal fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm overflow-y-auto p-3 sm:p-4 sm:pt-10 sm:pb-20"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`Invoice ${invoiceNumber}`}
    >
      <style>{PRINT_CSS}</style>

      <div className="invoice-sheet relative w-full max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">

        {/* Modal Action Header (hidden when printing) */}
        <div className="px-4 sm:px-5 py-4 bg-gray-50 border-b border-gray-100 print:hidden">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-3 h-3 rounded-full bg-primary inline-block shadow-sm shadow-primary/40 shrink-0"></span>
              <span className="font-bold text-sm text-gray-800 uppercase tracking-wider truncate">Invoice & Receipt</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={handlePrintOrDownload}
                title="Print Invoice"
                className="px-4 py-2 sm:py-2.5 bg-white text-gray-700 border border-gray-200 text-xs font-bold rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-2 shadow-sm"
              >
                <Printer className="w-4 h-4 shrink-0" /> <span className="hidden sm:inline">Print</span>
              </button>
              <button
                onClick={handlePrintOrDownload}
                title="Save as PDF"
                className="px-4 py-2 sm:py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-dark transition-all flex items-center gap-2 shadow-md shadow-primary/20"
              >
                <Download className="w-4 h-4 shrink-0" /> Save PDF
              </button>
              <div className="w-px h-8 bg-gray-200 mx-1 sm:mx-2"></div>
              <button
                onClick={onClose}
                aria-label="Close invoice"
                className="p-2 text-gray-400 hover:text-red-500 rounded-xl hover:bg-red-50 transition-colors shrink-0"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
          <p className="text-[11px] text-gray-400 font-medium mt-2">
            To save a PDF, choose “Save as PDF” as the destination in the print window.
          </p>
        </div>

        {/* Printable Invoice Document Area */}
        <div className="p-5 sm:p-12 space-y-8 bg-white font-sans text-gray-900">

          {/* Brand & Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 sm:gap-4 border-b-2 border-gray-100 pb-8">
            <div className="flex items-center space-x-4 min-w-0">
              {logoUrl && !imageError ? (
                <img
                  src={logoUrl}
                  alt="Business Logo"
                  onError={() => setImageError(true)}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover shadow-sm border border-gray-100 shrink-0"
                />
              ) : (
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-brand-dark text-white rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                  <Scissors className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
              )}
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-black text-brand-dark tracking-tight break-words">{displayName}</h1>
                <p className="text-[11px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Bespoke Garment Construction</p>
                {contactLine && (
                  <p className="text-[11px] sm:text-xs text-gray-500 font-medium mt-1 break-words">{contactLine}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col items-start sm:items-end w-full sm:w-auto border-t sm:border-0 border-gray-100 pt-5 sm:pt-0 shrink-0">
              <span className="inline-block px-3.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-xs font-black uppercase tracking-wider mb-2">
                {order.status || 'Confirmed'}
              </span>
              <p className="text-xs text-gray-400 font-semibold">
                Invoice No: <span className="text-gray-800 font-bold">{invoiceNumber}</span>
              </p>
              <p className="text-xs text-gray-400 font-semibold mt-0.5">
                Order Date: <span className="text-gray-800">{formatDate(order.createdAt)}</span>
              </p>
            </div>
          </div>

          {/* Client & Order Meta */}
          <div className="invoice-avoid-break grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 bg-gray-50/70 p-5 sm:p-8 rounded-3xl border border-gray-100">
            <div>
              <p className="text-[11px] font-black text-primary uppercase tracking-wider mb-2">Billed To:</p>
              <h3 className="font-black text-brand-dark text-base sm:text-lg mb-1.5 break-words">{customerName}</h3>
              {customer?.phone && <p className="text-xs font-medium text-gray-600 mb-0.5">{customer.phone}</p>}
              {customer?.email && <p className="text-xs font-medium text-gray-600 break-words">{customer.email}</p>}
            </div>
            <div className="text-left sm:text-right mt-2 sm:mt-0 border-t sm:border-0 border-gray-200 pt-4 sm:pt-0">
              <p className="text-[11px] font-black text-primary uppercase tracking-wider mb-2">Order Details:</p>
              <p className="text-sm sm:text-base font-bold text-brand-dark mb-1.5 break-words">{order.outfitName || order.outfitType || 'Custom Outfit'}</p>
              {order.dueDate && (
                <p className="text-xs font-medium text-gray-600">
                  Due Date: <span className="font-bold text-gray-900">{formatDate(order.dueDate)}</span>
                </p>
              )}
            </div>
          </div>

          {/* Itemized Table */}
          <div className="invoice-avoid-break overflow-x-auto mt-8">
            <table className="w-full text-left border-collapse min-w-[400px]">
              <thead>
                <tr className="border-b-2 border-brand-dark/10 text-gray-400 text-[10px] sm:text-xs uppercase tracking-wider">
                  <th className="py-3 font-black">Description</th>
                  <th className="py-3 font-black text-center w-16 sm:w-24">Qty</th>
                  <th className="py-3 font-black text-right w-28 sm:w-40">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                <tr>
                  <td className="py-5 sm:py-6 pr-4">
                    <p className="font-bold text-brand-dark text-base sm:text-lg break-words">{order.outfitName || order.description || 'Bespoke Garment Tailoring'}</p>
                    {order.fabricDescription && (
                      <p className="text-xs text-gray-500 font-medium mt-1.5 break-words">Fabric: {order.fabricDescription}</p>
                    )}
                  </td>
                  <td className="py-5 sm:py-6 text-center text-gray-600 font-bold align-top sm:align-middle text-base">1</td>
                  <td className="py-5 sm:py-6 text-right font-black text-brand-dark text-base sm:text-lg align-top sm:align-middle">{formatNaira(totalAmount)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown */}
          <div className="invoice-avoid-break border-t-2 border-brand-dark/10 pt-6 sm:pt-8 flex justify-end">
            <div className="w-full sm:w-80 space-y-4">
              <div className="flex justify-between text-sm text-gray-600 font-medium">
                <span>Subtotal:</span>
                <span className="font-bold text-brand-dark">{formatNaira(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm text-emerald-600 font-medium">
                <span>Amount Paid:</span>
                <span className="font-bold">- {formatNaira(amountPaid)}</span>
              </div>
              <div className="flex justify-between items-center text-base sm:text-lg font-black text-brand-dark border-t border-gray-200 pt-4 mt-2">
                <span className="uppercase tracking-wide text-xs text-gray-500">Balance Due:</span>
                <span className={`text-lg sm:text-xl ${balanceDue > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  {formatNaira(balanceDue)}
                </span>
              </div>
              {isPaidInFull && (
                <div className="text-center border-2 border-emerald-500 text-emerald-600 rounded-xl py-2 text-sm font-black uppercase tracking-[0.2em]">
                  Paid in Full
                </div>
              )}
            </div>
          </div>

          {/* Footer Note */}
          <div className="invoice-avoid-break border-t border-gray-100 pt-8 sm:pt-10 mt-10 sm:mt-16 text-center space-y-2">
            <p className="text-sm sm:text-base font-black text-gray-900 break-words">Thank you for choosing {businessName || 'TailorPro'}!</p>
            <p className="text-xs text-gray-500 font-medium max-w-md mx-auto">
              We appreciate your patronage. For inquiries regarding this order, please contact us{businessPhone ? ` on ${businessPhone}` : ''}.
            </p>
          </div>

        </div>
      </div>
    </div>
  );

  // Render outside the app's layout so printing can show only the invoice
  return createPortal(modal, document.body);
}
