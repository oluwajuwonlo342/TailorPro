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
    /* 
      FIXED SCROLLING WRAPPER: 
      Removed 'flex items-center' which cuts off tall modals.
      Added 'z-[999]' to ensure it floats above the sidebar/navbar.
      Used 'pt-6 pb-12' and 'mx-auto' to ensure proper scrolling.
    */
    <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm overflow-y-auto print:bg-transparent print:backdrop-blur-none p-4 sm:pt-10 sm:pb-20">
      
      <div className="relative w-full max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden print:shadow-none print:border-none print:rounded-none">
        
        {/* Modal Action Header (Hidden when printing/downloading) */}
        <div className="px-5 py-4 bg-gray-50 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-2.5">
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
              title="Download as PDF"
              className="px-4 py-2 sm:py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-dark transition-all flex items-center gap-2 shadow-md shadow-primary/20"
            >
              <Download className="w-4 h-4 shrink-0" /> Save PDF
            </button>
            <div className="w-px h-8 bg-gray-200 mx-1 sm:mx-2"></div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-red-500 rounded-xl hover:bg-red-50 transition-colors shrink-0"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Document Area */}
        <div className="p-6 sm:p-12 space-y-8 bg-white print:p-0 print:m-0 font-sans text-gray-900">
          
          {/* Brand & Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 sm:gap-0 border-b-2 border-gray-100 pb-8">
            <div className="flex items-center space-x-4">
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
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-brand-dark tracking-tight break-words">{businessName || 'TailorPro Fashion'}</h1>
                <p className="text-[11px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Bespoke Garment Construction</p>
              </div>
            </div>
            <div className="flex flex-col items-start sm:items-end w-full sm:w-auto border-t sm:border-0 border-gray-100 pt-5 sm:pt-0">
              <span className="inline-block px-3.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-xs font-black uppercase tracking-wider mb-2">
                {order.status || 'Confirmed'}
              </span>
              <p className="text-xs text-gray-400 font-semibold">
                Date: <span className="text-gray-800">{new Date(order.createdAt || Date.now()).toLocaleDateString()}</span>
              </p>
            </div>
          </div>

          {/* Client & Order Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 bg-gray-50/70 p-6 sm:p-8 rounded-3xl border border-gray-100 print:bg-transparent print:border-gray-200 print:rounded-2xl print:p-6">
            <div>
              <p className="text-[11px] font-black text-primary uppercase tracking-wider mb-2">Billed To:</p>
              <h3 className="font-black text-brand-dark text-base sm:text-lg mb-1.5 break-words">{customer?.fullName || customer?.name || 'Valued Customer'}</h3>
              {customer?.phone && <p className="text-xs font-medium text-gray-600 mb-0.5">{customer.phone}</p>}
              {customer?.email && <p className="text-xs font-medium text-gray-600 break-words">{customer.email}</p>}
            </div>
            <div className="text-left sm:text-right mt-2 sm:mt-0 border-t sm:border-0 border-gray-200 pt-4 sm:pt-0">
              <p className="text-[11px] font-black text-primary uppercase tracking-wider mb-2">Order Details:</p>
              <p className="text-sm sm:text-base font-bold text-brand-dark mb-1.5 break-words">{order.outfitName || order.outfitType || 'Custom Outfit'}</p>
              {order.dueDate && (
                <p className="text-xs font-medium text-gray-600">
                  Due Date: <span className="font-bold text-gray-900">{new Date(order.dueDate).toLocaleDateString()}</span>
                </p>
              )}
            </div>
          </div>

          {/* Itemized Table */}
          <div className="overflow-x-auto mt-8">
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
                  <td className="py-5 sm:py-6 text-right font-black text-brand-dark text-base sm:text-lg align-top sm:align-middle">₦{totalAmount.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown */}
          <div className="border-t-2 border-brand-dark/10 pt-6 sm:pt-8 flex justify-end">
            <div className="w-full sm:w-80 space-y-4">
              <div className="flex justify-between text-sm text-gray-600 font-medium">
                <span>Subtotal:</span>
                <span className="font-bold text-brand-dark">₦{totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-emerald-600 font-medium">
                <span>Amount Paid:</span>
                <span className="font-bold">- ₦{depositPaid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-base sm:text-lg font-black text-brand-dark border-t border-gray-200 pt-4 mt-2">
                <span className="uppercase tracking-wide text-xs text-gray-500">Balance Due:</span>
                <span className={`text-lg sm:text-xl ${balanceDue > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  ₦{balanceDue.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="border-t border-gray-100 pt-8 sm:pt-10 mt-10 sm:mt-16 text-center space-y-2">
            <p className="text-sm sm:text-base font-black text-gray-900 break-words">Thank you for choosing {businessName || 'TailorPro'}!</p>
            <p className="text-xs text-gray-500 font-medium max-w-md mx-auto">We appreciate your patronage. For inquiries regarding this order, please contact us.</p>
          </div>

        </div>
      </div>
    </div>
  );
}
