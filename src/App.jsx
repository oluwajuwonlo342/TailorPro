import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout'; // <-- Admin Layout

// Pages

import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardHome from './pages/DashboardHome';
import CustomersPage from './pages/CustomersPage';
import CustomerProfile from './pages/CustomerProfile';
import OrdersPage from './pages/OrdersPage';
import PublicMeasurementForm from './pages/PublicMeasurementForm';
import ProfileSettings from './pages/ProfileSettings';
import Payments from './pages/Payments';
import Measurements from './pages/Measurements';
import Upgrade from './pages/Upgrade';
import OrderCreate from './pages/OrderCreate';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageTailors from './pages/admin/ManageTailors';
import AdminTailorProfile from './pages/admin/AdminTailorProfile';
import AdminSubscriptions from './pages/admin/AdminSubscriptions';
import AdminOverview from './pages/admin/AdminOverview';
import AdminSettings from './pages/admin/AdminSettings';
import AdminMessages from './pages/admin/AdminMessages'; // <-- NEW IMPORT

// Protected Route Wrapper to block unauthenticated standard users
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-brand-bg">
        <div className="text-primary font-semibold text-lg animate-pulse">Loading TailorPro...</div>
      </div>
    );
  }
  return user ? children : <Navigate to="/login" replace />;
};

// Admin Route Wrapper to protect Super Admin routes
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  let user = {};
  
  try {
    if (userString) user = JSON.parse(userString);
  } catch (e) {
    console.error("Failed to parse user from local storage");
  }

  // Must have token AND be an admin
  if (!token || user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Marketing Pages */}
          <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
          <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
          <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
          <Route path="/upgrade" element={<Upgrade />} />

          {/* Standard Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Public Shared Measurement Form (Accessed via WhatsApp links by clients) */}
          <Route path="/measure-form" element={<PublicMeasurementForm />} />

          {/* =========================================
              SUPER ADMIN ROUTES
          ========================================= */}
          <Route path="/admin/login" element={<AdminLogin />} />
          
          <Route path="/admin" element={
            <AdminRoute>
              <AdminLayout>
                <AdminOverview />
              </AdminLayout>
            </AdminRoute>
          } />
          
          <Route path="/admin/dashboard" element={
            <AdminRoute>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </AdminRoute>
          } />

          <Route path="/admin/tailors" element={
            <AdminRoute>
              <AdminLayout>
                <ManageTailors />
              </AdminLayout>
            </AdminRoute>
          } />
          
          <Route path="/admin/tailors/:id" element={
            <AdminRoute>
              <AdminLayout>
                <AdminTailorProfile />
              </AdminLayout>
            </AdminRoute>
          } />

          <Route path="/admin/subscriptions" element={
            <AdminRoute>
              <AdminLayout>
                <AdminSubscriptions />
              </AdminLayout>
            </AdminRoute>
          } />

          {/* NEW CONTACT MESSAGES ROUTE */}
          <Route path="/admin/messages" element={
            <AdminRoute>
              <AdminLayout>
                <AdminMessages />
              </AdminLayout>
            </AdminRoute>
          } />

          <Route path="/admin/settings" element={
            <AdminRoute>
              <AdminLayout>
                <AdminSettings />
              </AdminLayout>
            </AdminRoute>
          } />

          {/* =========================================
              PROTECTED SAAS APPLICATION ROUTES (TAILORS)
          ========================================= */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout>
                <DashboardHome />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/customers" element={
            <ProtectedRoute>
              <DashboardLayout>
                <CustomersPage />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/customers/:id" element={
            <ProtectedRoute>
              <DashboardLayout>
                <CustomerProfile />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/orders" element={
            <ProtectedRoute>
              <DashboardLayout>
                <OrdersPage />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/payments" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Payments />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/measurements" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Measurements />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/settings" element={
            <ProtectedRoute>
              <DashboardLayout>
                <ProfileSettings />
              </DashboardLayout>
            </ProtectedRoute>
          } />
{/* ADD THIS ROUTE HERE */}
<Route path="/orders/new" element={
  <ProtectedRoute>
    <DashboardLayout>
      <OrderCreate />
    </DashboardLayout>
  </ProtectedRoute>
} />
          {/* Catch-all redirect back to landing page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
