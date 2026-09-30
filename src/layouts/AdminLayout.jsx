import { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Activity, Users, CreditCard, Settings, ShieldCheck, LogOut, Menu, X, Shield, Mail } from 'lucide-react';
import api from '../services/api';

export default function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [adminName, setAdminName] = useState('SUPER ADMIN');

  useEffect(() => {
    // 1. Try to load initial name from localStorage if cached
    const cachedUser = localStorage.getItem('adminName');
    if (cachedUser) {
      setAdminName(cachedUser);
    }

    // 2. Fetch fresh admin profile info from backend
    const fetchAdminProfile = async () => {
      try {
        const response = await api.get('/admin/profile'); // Adjust to match your admin profile/settings endpoint if needed
        if (response.data && response.data.fullName) {
          setAdminName(response.data.fullName);
          localStorage.setItem('adminName', response.data.fullName);
        }
      } catch (err) {
        console.error("Failed to fetch admin profile", err);
      }
    };

    fetchAdminProfile();
  }, [location.pathname]); // Re-fetch when navigating (e.g. after saving settings)

  const navLinks = [
    { name: 'Platform Overview', path: '/admin', icon: Activity },
    { name: 'Manage Tailors', path: '/admin/tailors', icon: Users },
    { name: 'Subscriptions', path: '/admin/subscriptions', icon: CreditCard },
    { name: 'Support Inbox', path: '/admin/messages', icon: Mail },
    { name: 'System Settings', path: '/admin/settings', icon: Settings },
  ];

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out of the admin panel?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('adminName');
      navigate('/admin/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex font-sans">
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-[#0F1423] text-white z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo Area */}
        <div className="h-20 flex items-center px-6 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <span className="text-xl font-black tracking-wide">TailorPro</span>
            <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded">Admin</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = link.path === '/admin' 
              ? location.pathname === '/admin' || location.pathname === '/admin/'
              : location.pathname.startsWith(link.path);

            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary text-white shadow-lg shadow-primary/25' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3.5 w-full rounded-xl font-bold text-sm text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-gray-100 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-gray-500 hover:bg-gray-50 rounded-xl"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Dynamic Admin Profile Section */}
          <div 
            onClick={() => navigate('/admin/settings')}
            className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition-colors group"
            title="System Settings"
          >
            <div className="text-right hidden sm:block">
              {/* Displays dynamic fullName instead of hardcoded text */}
              <p className="text-sm font-black text-brand-dark leading-none group-hover:text-primary transition-colors max-w-[200px] truncate">
                {adminName}
              </p>
              <div className="flex items-center justify-end gap-1 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <p className="text-[10px] font-bold text-emerald-600 leading-none uppercase tracking-wider">System Live</p>
              </div>
            </div>
            
            <div className="w-10 h-10 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center group-hover:border-primary/30 group-hover:bg-primary/5 transition-all">
              <ShieldCheck className="w-5 h-5 text-gray-400 group-hover:text-primary" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-8">
          {children}
        </main>
        
      </div>
    </div>
  );
}
