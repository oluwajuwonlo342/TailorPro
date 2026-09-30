import { useState } from 'react';
import { X, Printer, Scissors, Download } from 'lucide-react';

export default function InvoiceModal({ order, customer, businessName, logoUrl, isOpen, onClose }) {
  const [imageError, setImageError] = useState(false);

  if (!isOpen) return null;

  const handlePrintOrDownload = () => {
    window.print();
  };

  const totalAmount = order.totalAmount || 0;
  const depositPaid = order.depositPaid || order.amountPaid || 0;
  const balanceDue = Math.max(0, totalAmount - depositPaid);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden relative border border-gray-100 my-4 sm:my-8">
        
        {/* Modal Action Header (Hidden when printing/downloading) */}
        <div className="p-4 bg-gray-50 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-primary inline-block shadow-sm shadow-primary/40 shrink-0"></span>
            <span className="font-bold text-xs sm:text-sm text-gray-700 uppercase tracking-wider truncate">Invoice & Receipt</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handlePrintOrDownload}
              title="Print Invoice"
              className="px-3 sm:px-4 py-2 bg-white text-gray-700 border border-gray-200 text-[11px] sm:text-xs font-bold rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={handlePrintOrDownload}
              title="Download as PDF"
              className="px-3 sm:px-4 py-2 bg-primary text-white text-[11px] sm:text-xs font-bold rounded-xl hover:bg-primary-dark transition-all flex items-center gap-1.5 shadow-md shadow-primary/20"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> Save PDF
            </button>
            <div className="w-px h-6 bg-gray-200 mx-0.5 sm:mx-1"></div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-red-500 rounded-xl hover:bg-red-50 transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Document Area */}
        <div className="p-6 sm:p-12 space-y-8 bg-white print:p-0 print:m-4 font-sans text-gray-800">
          
          {/* Brand & Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-5 sm:gap-0 border-b border-gray-100 pb-6">
            <div className="flex items-center space-x-3 sm:space-x-4">
              {logoUrl && !imageError ? (
                <img 
                  src={logoUrl} 
                  alt="Business Logo" 
                  onError={() => setImageError(true)}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover shadow-sm border border-gray-100 shrink-0" 
                />
              ) : (
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                  <Scissors className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
              )}
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-brand-dark break-words">{businessName || 'TailorPro Fashion'}</h1>
                <p className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wide mt-0.5">Bespoke Garment Construction</p>
              </div>
            </div>
            <div className="flex flex-col items-start sm:items-end w-full sm:w-auto border-t sm:border-0 border-gray-100 pt-4 sm:pt-0">
              <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-[10px] sm:text-[11px] font-black uppercase tracking-wider mb-1.5 sm:mb-2">
                {order.status || 'Confirmed'}
              </span>
              <p className="text-[11px] sm:text-xs text-gray-400 font-semibold">
                Date: <span className="text-gray-700">{new Date(order.createdAt || Date.now()).toLocaleDateString()}</span>
              </p>
            </div>
          </div>

          {/* Client & Order Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 bg-gray-50/70 p-5 sm:p-6 rounded-2xl border border-gray-100 print:bg-transparent print:border-gray-200 print:p-4">
            <div>
              <p className="text-[10px] font-black text-primary uppercase tracking-wider mb-1 sm:mb-2">Billed To:</p>
              <h3 className="font-black text-brand-dark text-sm sm:text-base mb-1 break-words">{customer?.fullName || customer?.name || 'Valued Customer'}</h3>
              {customer?.phone && <p className="text-[11px] sm:text-xs font-medium text-gray-600 mb-0.5">{customer.phone}</p>}
              {customer?.email && <p className="text-[11px] sm:text-xs font-medium text-gray-600 break-words">{customer.email}</p>}
            </div>
            <div className="text-left sm:text-right mt-2 sm:mt-0 border-t sm:border-0 border-gray-200 pt-3 sm:pt-0">
              <p className="text-[10px] font-black text-primary uppercase tracking-wider mb-1 sm:mb-2">Order Details:</p>
              <p className="text-xs sm:text-sm font-bold text-brand-dark mb-1 break-words">{order.outfitName || order.outfitType || 'Custom Outfit'}</p>
              {order.dueDate && (
                <p className="text-[11px] sm:text-xs font-medium text-gray-600">
                  Due Date: <span className="font-bold text-gray-800">{new Date(order.dueDate).toLocaleDateString()}</span>
                </p>
              )}
            </div>
          </div>

          {/* Itemized Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[300px]">
              <thead>
                <tr className="border-b-2 border-gray-100 text-gray-400 text-[9px] sm:text-[10px] uppercase tracking-wider">
                  <th className="py-2 sm:py-3 font-black">Description</th>
                  <th className="py-2 sm:py-3 font-black text-center w-12 sm:w-20">Qty</th>
                  <th className="py-2 sm:py-3 font-black text-right w-24 sm:w-32">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                <tr>
                  <td className="py-4 sm:py-5 pr-2">
                    <p className="font-bold text-brand-dark text-sm sm:text-base break-words">{order.outfitName || order.description || 'Bespoke Garment Tailoring'}</p>
                    {order.fabricDescription && (
                      <p className="text-[11px] sm:text-xs text-gray-500 font-medium mt-1 break-words">Fabric: {order.fabricDescription}</p>
                    )}
                  </td>
                  <td className="py-4 sm:py-5 text-center text-gray-600 font-bold align-top sm:align-middle">1</td>
                  <td className="py-4 sm:py-5 text-right font-black text-brand-dark text-sm sm:text-base align-top sm:align-middle">₦{totalAmount.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown */}
          <div className="border-t-2 border-gray-100 pt-5 sm:pt-6 flex justify-end">
            <div className="w-full sm:w-72 space-y-3 sm:space-y-3.5">
              <div className="flex justify-between text-xs sm:text-sm text-gray-500 font-medium">
                <span>Subtotal:</span>
                <span className="font-bold text-brand-dark">₦{totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm text-emerald-600 font-medium">
                <span>Amount Paid:</span>
                <span className="font-bold">- ₦{depositPaid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm sm:text-base font-black text-brand-dark border-t border-gray-200 pt-3 sm:pt-4 mt-1.5 sm:mt-2">
                <span className="uppercase tracking-wide text-[10px] sm:text-xs text-gray-500">Balance Due:</span>
                <span className={`text-base sm:text-lg ${balanceDue > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  ₦{balanceDue.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="border-t border-gray-100 pt-6 sm:pt-8 mt-8 sm:mt-12 text-center space-y-1 sm:space-y-1.5">
            <p className="text-xs sm:text-sm font-bold text-gray-800 break-words">Thank you for choosing {businessName || 'TailorPro'}!</p>
            <p className="text-[10px] sm:text-xs text-gray-400 font-medium">We appreciate your patronage. For inquiries regarding this order, please contact us.</p>
          </div>

        </div>
      </div>
    </div>
  );
}
