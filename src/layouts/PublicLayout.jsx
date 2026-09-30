import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Scissors, Menu, X } from 'lucide-react';

export default function PublicLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen bg-brand-bg font-sans flex flex-col selection:bg-primary selection:text-white">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center transform group-hover:rotate-6 transition-transform shadow-sm">
                <Scissors className="w-5 h-5" />
              </div>
              <span className="text-xl sm:text-2xl font-black text-brand-dark tracking-tight">TailorPro</span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/#features" className="text-sm text-gray-600 hover:text-primary transition-colors font-bold">Features</Link>
              <Link to="/#pricing" className="text-sm text-gray-600 hover:text-primary transition-colors font-bold">Pricing</Link>
              <Link to="/about" className="text-sm text-gray-600 hover:text-primary transition-colors font-bold">About</Link>
              <Link to="/contact" className="text-sm text-gray-600 hover:text-primary transition-colors font-bold">Contact</Link>
            </div>

            {/* CTA Buttons & Mobile Hamburger Icon */}
            <div className="flex items-center space-x-3 sm:space-x-5">
              <Link to="/login" className="text-brand-dark font-bold hover:text-primary transition-colors text-sm hidden sm:block">
                Log In
              </Link>
              <Link to="/register" className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-primary-dark transition-all shadow-md shadow-primary/20">
                Start Free
              </Link>

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 -mr-2 rounded-xl text-brand-dark hover:bg-gray-50 transition-colors focus:outline-none"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu Overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-gray-100 shadow-xl animate-in slide-in-from-top-2 duration-200 z-40">
            <div className="px-4 pt-2 pb-6 space-y-2">
              <Link to="/#features" className="block px-4 py-3 rounded-xl text-sm font-bold text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors">
                Features
              </Link>
              <Link to="/#pricing" className="block px-4 py-3 rounded-xl text-sm font-bold text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors">
                Pricing
              </Link>
              <Link to="/about" className="block px-4 py-3 rounded-xl text-sm font-bold text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors">
                About
              </Link>
              <Link to="/contact" className="block px-4 py-3 rounded-xl text-sm font-bold text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors">
                Contact
              </Link>
              <div className="pt-4 mt-2 border-t border-gray-100">
                <Link to="/login" className="block text-center w-full py-3.5 bg-gray-50 text-brand-dark font-bold rounded-xl hover:bg-gray-100 transition-colors text-sm">
                  Log In to Dashboard
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow flex flex-col relative z-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#0A0D14] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
          
          <div className="md:col-span-5">
            <div className="flex items-center space-x-2.5 mb-6">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white transform rotate-3">
                 <Scissors className="w-4 h-4" />
              </div>
              <span className="text-xl font-black tracking-tight">TailorPro</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              Manage your fashion business, not your paperwork. The premium operating system for modern tailors and fashion designers.
            </p>
          </div>

          <div className="md:col-span-2">
            <h4 className="font-bold mb-6 text-sm uppercase tracking-wider text-gray-500">Product</h4>
            <ul className="space-y-4 text-sm font-medium text-gray-300">
              <li><Link to="/#features" className="hover:text-primary transition-colors">Features</Link></li>
              <li><Link to="/#pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link to="/register" className="hover:text-primary transition-colors">Start Free Trial</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="font-bold mb-6 text-sm uppercase tracking-wider text-gray-500">Company</h4>
            <ul className="space-y-4 text-sm font-medium text-gray-300">
              <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="font-bold mb-6 text-sm uppercase tracking-wider text-gray-500">Legal</h4>
            <ul className="space-y-4 text-sm font-medium text-gray-300">
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center text-xs font-medium text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} TailorPro. All rights reserved.</p>
          <p>Built for Fashion Creatives.</p>
        </div>
      </footer>
    </div>
  );
}
