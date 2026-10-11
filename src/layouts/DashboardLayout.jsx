import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, LayoutDashboard, Users, Scissors, ShoppingBag, CreditCard, LogOut, Lock, Image, AlertTriangle, X } from 'lucide-react';

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const REMINDER_DAYS = 5; // start reminding this many days before expiry
const DISMISS_KEY = 'proExpiryReminderDismissed';

const todayKey = () => new Date().toLocaleDateString();

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  // A dismissed reminder stays hidden for the rest of the day, then returns tomorrow
  const [reminderDismissed, setReminderDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) === todayKey();
    } catch {
      return false;
    }
  });

  const dismissReminder = () => {
    setReminderDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, todayKey());
    } catch {
      // storage unavailable: dismissal just lasts until the page reloads
    }
  };

  const getTrialDaysLeft = () => {
    if (!user?.trialEnd) return 0;
    const daysLeft = Math.ceil((new Date(user.trialEnd) - new Date()) / MS_PER_DAY);
    return daysLeft > 0 ? daysLeft : 0;
  };

  const daysLeft = getTrialDaysLeft();

  // Determine if the user has active Pro access (either paid or active trial)
  const isProActive = user?.plan === 'pro' || (user?.subscriptionStatus === 'trial' && daysLeft > 0);

  // Work out what is about to expire: a paid subscription or the free trial
  const getExpiry = () => {
    if (user?.plan === 'pro' && user?.subscriptionEnd) {
      return { type: 'subscription', date: new Date(user.subscriptionEnd) };
    }
    if (user?.subscriptionStatus === 'trial' && user?.trialEnd) {
      return { type: 'trial', date: new Date(user.trialEnd) };
    }
    return null;
  };

  const expiry = getExpiry();
  const expiryDaysLeft = expiry ? Math.ceil((expiry.date - new Date()) / MS_PER_DAY) : null;
  const showReminder =
    expiry !== null &&
    expiryDaysLeft > 0 &&
    expiryDaysLeft <= REMINDER_DAYS &&
    !reminderDismissed;

  const isUrgent = showReminder && expiryDaysLeft <= 2;
  const dayWord = expiryDaysLeft === 1 ? 'day' : 'days';

  // requiresPro:    item is shown but LOCKED (with padlock) for non-Pro users
  // hideWhenNotPro: item is completely HIDDEN for non-Pro users
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, requiresPro: false },
    { name: 'Customers', href: '/customers', icon: Users, requiresPro: false },
    { name: 'Portfolio', href: '/portfolio', icon: Image, requiresPro: false, hideWhenNotPro: true },
    { name: 'Measurements', href: '/measurements', icon: Scissors, requiresPro: true },
    { name: 'Orders', href: '/orders', icon: ShoppingBag, requiresPro: true },
    { name: 'Payments', href: '/payments', icon: CreditCard, requiresPro: true },
  ];

  // Remove hidden items entirely before rendering
  const visibleNavigation = navigation.filter(
    (item) => !(item.hideWhenNotPro && !isProActive)
  );

  const brandName = user?.businessName || user?.brandName || 'My Brand';
  const userInitial = brandName.charAt(0).toUpperCase();

  return (
    <div className="flex h-screen bg-brand-bg font-sans">

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-brand-dark/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-brand-dark text-white transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-center h-16 border-b border-gray-800">
          <span className="text-2xl font-bold text-primary-light">TailorPro</span>
        </div>

        <nav className="p-4 space-y-1">
          {visibleNavigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;

            // Check if this specific item is locked for the current user
            const isLocked = item.requiresPro && !isProActive;

            if (isLocked) {
              return (
                <Link
                  key={item.name}
                  to="/upgrade" // Redirect them to pay if they click a locked feature
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center px-4 py-3 rounded-lg text-gray-500 hover:bg-gray-800 hover:text-white transition-colors group"
                  title="Unlock this feature with PRO"
                >
                  <Icon className="w-5 h-5 mr-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                  <span className="flex-1">{item.name}</span>
                  <Lock className="w-4 h-4 opacity-50 group-hover:text-amber-400 transition-colors" />
                </Link>
              );
            }

            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-primary text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-800">
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-3 text-gray-300 transition-colors rounded-lg hover:bg-gray-800 hover:text-white"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top Header */}
        <header className="flex items-center justify-between px-4 sm:px-6 py-4 bg-white border-b border-gray-200">
          <button className="text-gray-500 lg:hidden focus:outline-none" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex-1 lg:flex-none"></div>

          <div className="flex items-center space-x-2 sm:space-x-4">

            {/* SaaS Plan Badges */}
            {user?.subscriptionStatus === 'trial' && daysLeft > 0 ? (
              <span className="px-3 py-1 text-xs sm:text-sm font-medium text-amber-700 bg-amber-50 rounded-full border border-amber-200 whitespace-nowrap flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                Pro Trial — {daysLeft} days left
              </span>
            ) : user?.plan === 'free' || (user?.subscriptionStatus === 'trial' && daysLeft === 0) ? (
              <Link
                to="/upgrade"
                className="px-4 py-2 text-sm font-bold text-white bg-brand-dark rounded-full hover:bg-black transition-all shadow-md hover:shadow-lg whitespace-nowrap"
              >
                Upgrade to Pro
              </Link>
            ) : null /* Do not show any badge if they are an active paid PRO user */}

            {/* Clickable Profile Avatar */}
            <Link
              to="/settings"
              className="flex items-center space-x-2 bg-gray-50 hover:bg-gray-100 p-1.5 pr-1.5 sm:pr-3 rounded-full border border-gray-200 transition-all cursor-pointer group ml-2"
              title="Go to Profile Settings"
            >
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                {user?.profilePhoto ? (
                  <img src={user.profilePhoto} alt={brandName} className="w-full h-full object-cover" />
                ) : (
                  userInitial
                )}
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700">
                {brandName}
              </span>
            </Link>
          </div>
        </header>

        {/* Pro expiry reminder: shown in the last 5 days, red in the final 2 */}
        {showReminder && (
          <div
            className={`flex flex-wrap items-center gap-x-3 gap-y-2 px-4 sm:px-6 py-3 border-b text-sm ${
              isUrgent
                ? 'bg-red-50 border-red-200 text-red-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
            role="alert"
          >
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p className="flex-1 min-w-[200px] font-medium">
              {expiry.type === 'trial'
                ? `Your Pro trial ends in ${expiryDaysLeft} ${dayWord} (${expiry.date.toLocaleDateString()}). Upgrade now to keep Measurements, Orders, Payments and Portfolio.`
                : `Your Pro subscription expires in ${expiryDaysLeft} ${dayWord} (${expiry.date.toLocaleDateString()}). Renew now to avoid losing access to Measurements, Orders, Payments and Portfolio.`}
            </p>
            <Link
              to="/upgrade"
              className={`px-4 py-2 text-xs sm:text-sm font-bold text-white rounded-full transition-all whitespace-nowrap ${
                isUrgent ? 'bg-red-600 hover:bg-red-700' : 'bg-brand-dark hover:bg-black'
              }`}
            >
              {expiry.type === 'trial' ? 'Upgrade now' : 'Renew now'}
            </Link>
            <button
              onClick={dismissReminder}
              className="p-1 rounded-full hover:bg-black/5 transition-colors"
              aria-label="Dismiss reminder"
              title="Dismiss for today"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
