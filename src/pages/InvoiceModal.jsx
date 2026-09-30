import { useState } from 'react';
import { X, Printer, Scissors, Download } from 'lucide-react';

export default function InvoiceModal({ order, customer, businessName, logoUrl, isOpen, onClose }) {
  const [imageError, setImageError] = useState(false);

  if (!isOpen) return null;

  // The browser's native print dialog natively handles high-quality "Save as PDF" 
  // without needing heavy external libraries.
  const handlePrintOrDownload = () => {
    window.print();
  };

  const totalAmount = order.totalAmount || 0;
  const depositPaid = order.depositPaid || order.amountPaid || 0;
  const balanceDue = Math.max(0, totalAmount - depositPaid);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden relative border border-gray-100 my-8">
        
        {/* Modal Action Header (Hidden when printing/downloading) */}
        <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-primary inline-block shadow-sm shadow-primary/40"></span>
            <span className="font-bold text-sm text-gray-700 uppercase tracking-wider">Invoice & Receipt</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintOrDownload}
              title="Print Invoice"
              className="px-4 py-2 bg-white text-gray-700 border border-gray-200 text-xs font-bold rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
            >
              <Printer className="w-4 h-4" /> Print
            </button>
            <button
              onClick={handlePrintOrDownload}
              title="Download as PDF"
              className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-dark transition-all flex items-center gap-2 shadow-md shadow-primary/20"
            >
              <Download className="w-4 h-4" /> Save PDF
            </button>
            <div className="w-px h-6 bg-gray-200 mx-1"></div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-red-500 rounded-xl hover:bg-red-50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Document Area */}
        <div className="p-8 sm:p-12 space-y-8 bg-white print:p-0 print:m-4 font-sans text-gray-800">
          
          {/* Brand & Header */}
          <div className="flex justify-between items-start border-b border-gray-100 pb-6">
            <div className="flex items-center space-x-4">
              {/* Tailor Logo / Profile Image or Fallback Scissors Icon */}
              {logoUrl && !imageError ? (
                <img 
                  src={logoUrl} 
                  alt="Business Logo" 
                  onError={() => setImageError(true)}
                  className="w-14 h-14 rounded-2xl object-cover shadow-sm border border-gray-100" 
                />
              ) : (
                <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-sm">
                  <Scissors className="w-7 h-7" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-black text-brand-dark">{businessName || 'TailorPro Fashion'}</h1>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mt-0.5">Bespoke Garment Construction</p>
              </div>
            </div>
            <div className="text-right flex flex-col items-end">
              <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-[11px] font-black uppercase tracking-wider mb-2">
                {order.status || 'Confirmed'}
              </span>
              <p className="text-xs text-gray-400 font-semibold">
                Date: <span className="text-gray-700">{new Date(order.createdAt || Date.now()).toLocaleDateString()}</span>
              </p>
            </div>
          </div>

          {/* Client & Order Meta */}
          <div className="grid grid-cols-2 gap-6 bg-gray-50/70 p-6 rounded-2xl border border-gray-100 print:bg-transparent print:border-gray-200 print:p-4">
            <div>
              <p className="text-[10px] font-black text-primary uppercase tracking-wider mb-2">Billed To:</p>
              <h3 className="font-black text-brand-dark text-base mb-1">{customer?.fullName || customer?.name || 'Valued Customer'}</h3>
              {customer?.phone && <p className="text-xs font-medium text-gray-600 mb-0.5">{customer.phone}</p>}
              {customer?.email && <p className="text-xs font-medium text-gray-600">{customer.email}</p>}
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-primary uppercase tracking-wider mb-2">Order Details:</p>
              <p className="text-sm font-bold text-brand-dark mb-1">{order.outfitName || order.outfitType || 'Custom Outfit'}</p>
              {order.dueDate && (
                <p className="text-xs font-medium text-gray-600">
                  Due Date: <span className="font-bold text-gray-800">{new Date(order.dueDate).toLocaleDateString()}</span>
                </p>
              )}
            </div>
          </div>

          {/* Itemized Table */}
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-100 text-gray-400 text-[10px] uppercase tracking-wider">
                <th className="py-3 font-black">Description</th>
                <th className="py-3 font-black text-center">Qty</th>
                <th className="py-3 font-black text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              <tr>
                <td className="py-5">
                  <p className="font-bold text-brand-dark text-base">{order.outfitName || order.description || 'Bespoke Garment Tailoring'}</p>
                  {order.fabricDescription && (
                    <p className="text-xs text-gray-500 font-medium mt-1">Fabric: {order.fabricDescription}</p>
                  )}
                </td>
                <td className="py-5 text-center text-gray-600 font-bold">1</td>
                <td className="py-5 text-right font-black text-brand-dark text-base">₦{totalAmount.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          {/* Financial Breakdown */}
          <div className="border-t-2 border-gray-100 pt-6 flex justify-end">
            <div className="w-full sm:w-72 space-y-3.5">
              <div className="flex justify-between text-sm text-gray-500 font-medium">
                <span>Subtotal:</span>
                <span className="font-bold text-brand-dark">₦{totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-emerald-600 font-medium">
                <span>Amount Paid:</span>
                <span className="font-bold">- ₦{depositPaid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-base font-black text-brand-dark border-t border-gray-200 pt-4 mt-2">
                <span className="uppercase tracking-wide text-xs text-gray-500">Balance Due:</span>
                <span className={`text-lg ${balanceDue > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  ₦{balanceDue.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="border-t border-gray-100 pt-8 mt-12 text-center space-y-1.5">
            <p className="text-sm font-bold text-gray-800">Thank you for choosing {businessName || 'TailorPro'}!</p>
            <p className="text-xs text-gray-400 font-medium">We appreciate your patronage. For inquiries regarding this order, please contact us.</p>
          </div>

        </div>
      </div>
    </div>
  );
}
