import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Scissors, Menu, X } from 'lucide-react';

export default function PublicLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-brand-bg font-sans flex flex-col">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center transform rotate-3 shadow-md">
                <Scissors className="w-6 h-6" />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-brand-dark tracking-tight">TailorPro</span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/#features" className="text-gray-600 hover:text-primary transition font-medium">Features</Link>
              <Link to="/#pricing" className="text-gray-600 hover:text-primary transition font-medium">Pricing</Link>
              <Link to="/about" className="text-gray-600 hover:text-primary transition font-medium">About</Link>
              <Link to="/contact" className="text-gray-600 hover:text-primary transition font-medium">Contact</Link>
            </div>

            {/* CTA Buttons & Mobile Hamburger Icon */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Link to="/login" className="text-brand-dark font-medium hover:text-primary text-sm sm:text-base hidden sm:block">
                Log In
              </Link>
              <Link to="/register" className="bg-primary text-white px-4 sm:px-5 py-2.5 rounded-xl font-medium text-sm sm:text-base hover:bg-primary-dark transition shadow-sm">
                Start Free
              </Link>

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-gray-600 hover:text-primary hover:bg-gray-50 focus:outline-none"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-100 px-4 pt-2 pb-6 space-y-3 animate-fade-in shadow-xl">
            <Link 
              to="/#features" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-base font-medium text-gray-700 hover:bg-primary/5 hover:text-primary"
            >
              Features
            </Link>
            <Link 
              to="/#pricing" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-base font-medium text-gray-700 hover:bg-primary/5 hover:text-primary"
            >
              Pricing
            </Link>
            <Link 
              to="/about" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-base font-medium text-gray-700 hover:bg-primary/5 hover:text-primary"
            >
              About
            </Link>
            <Link 
              to="/contact" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-base font-medium text-gray-700 hover:bg-primary/5 hover:text-primary"
            >
              Contact
            </Link>
            <div className="pt-2 border-t border-gray-100">
              <Link 
                to="/login" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full py-3 mt-2 bg-gray-50 text-brand-dark font-bold rounded-xl hover:bg-gray-100"
              >
                Log In
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-brand-dark text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Scissors className="w-6 h-6 text-primary-light" />
              <span className="text-xl font-bold">TailorPro</span>
            </div>
            <p className="text-gray-400 text-sm">
              Manage your fashion business, not your paperwork. The all-in-one platform for modern tailors and fashion designers.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/#features" className="hover:text-white">Features</Link></li>
              <li><Link to="/#pricing" className="hover:text-white">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/about" className="hover:text-white">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} TailorPro. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
