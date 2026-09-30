import { useState } from 'react';
import { X, Printer, Scissors } from 'lucide-react';

export default function InvoiceModal({ order, customer, businessName, logoUrl, isOpen, onClose }) {
  const [imageError, setImageError] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const totalAmount = order.totalAmount || 0;
  const depositPaid = order.depositPaid || order.amountPaid || 0;
  const balanceDue = Math.max(0, totalAmount - depositPaid);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden relative border border-gray-100 my-8">
        
        {/* Modal Action Header (Hidden when printing) */}
        <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-primary inline-block"></span>
            <span className="font-bold text-sm text-gray-700">Order Invoice & Receipt</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-dark transition-colors flex items-center gap-2 shadow-sm"
            >
              <Printer className="w-4 h-4" /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Document Area */}
        <div className="p-8 sm:p-12 space-y-8 bg-white print:p-0 print:m-4 font-sans">
          
          {/* Brand & Header */}
          <div className="flex justify-between items-start border-b border-gray-100 pb-6">
            <div className="flex items-center space-x-3">
              {/* Tailor Logo / Profile Image or Fallback Scissors Icon */}
              {logoUrl && !imageError ? (
                <img 
                  src={logoUrl} 
                  alt="Business Logo" 
                  onError={() => setImageError(true)} // Falls back to scissors if Cloudinary fails
                  className="w-12 h-12 rounded-2xl object-cover shadow-md border border-gray-100" 
                />
              ) : (
                <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-md">
                  <Scissors className="w-6 h-6" />
                </div>
              )}
              <div>
                <h1 className="text-xl font-extrabold text-brand-dark">{businessName || 'TailorPro Fashion House'}</h1>
                <p className="text-xs text-gray-500 font-medium">Bespoke Tailoring & Garment Construction</p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-black uppercase tracking-wider mb-1">
                {order.status || 'Confirmed'}
              </span>
              <p className="text-xs text-gray-400 font-medium">Date: {new Date(order.createdAt || Date.now()).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Client & Order Meta */}
          <div className="grid grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Billed To:</p>
              <h3 className="font-bold text-brand-dark text-base">{customer?.fullName || customer?.name || 'Valued Customer'}</h3>
              <p className="text-xs text-gray-600">{customer?.phone || 'No phone provided'}</p>
              <p className="text-xs text-gray-600">{customer?.email || ''}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Order Details:</p>
              <p className="text-xs font-bold text-brand-dark">Style: {order.outfitName || order.outfitType || 'Custom Outfit'}</p>
              {order.fittingDate && (
                <p className="text-xs text-gray-600 mt-1">Fitting Date: {new Date(order.fittingDate).toLocaleDateString()}</p>
              )}
              {order.dueDate && (
                <p className="text-xs text-gray-600 mt-1">Due Date: {new Date(order.dueDate).toLocaleDateString()}</p>
              )}
            </div>
          </div>

          {/* Itemized Table */}
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-gray-400 text-[10px] uppercase tracking-wider">
                <th className="py-3 font-bold">Description</th>
                <th className="py-3 font-bold text-center">Qty</th>
                <th className="py-3 font-bold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              <tr>
                <td className="py-4 font-bold text-brand-dark">
                  {order.outfitName || order.description || 'Bespoke Garment Tailoring'}
                  {order.fabricDescription && <p className="text-xs text-gray-500 font-normal mt-0.5">Fabric: {order.fabricDescription}</p>}
                </td>
                <td className="py-4 text-center text-gray-600 font-medium">1</td>
                <td className="py-4 text-right font-bold text-brand-dark">₦{totalAmount.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          {/* Financial Breakdown */}
          <div className="border-t border-gray-100 pt-6 flex justify-end">
            <div className="w-full sm:w-72 space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal:</span>
                <span className="font-bold">₦{totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-emerald-600 font-medium">
                <span>Amount Paid:</span>
                <span>- ₦{depositPaid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-base font-black text-brand-dark border-t border-gray-200 pt-3">
                <span>Balance Due:</span>
                <span className={balanceDue > 0 ? 'text-red-600' : 'text-emerald-600'}>
                  ₦{balanceDue.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="border-t border-gray-100 pt-6 text-center text-xs text-gray-400 font-medium space-y-1">
            <p>Thank you for choosing {businessName || 'TailorPro'}! We appreciate your patronage.</p>
            <p>For inquiries regarding this order, please contact us.</p>
          </div>

        </div>
      </div>
    </div>
  );
}
