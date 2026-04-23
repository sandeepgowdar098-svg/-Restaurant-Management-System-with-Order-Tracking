import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { TableProvider } from './context/TableContext';

import Navbar from './components/Navbar';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import JoinTable from './pages/customer/JoinTable';
import Menu from './pages/customer/Menu';
import SharedCart from './pages/customer/SharedCart';
import OrderStatus from './pages/customer/OrderStatus';
import Feedback from './pages/customer/Feedback';
import KitchenDashboard from './pages/kitchen/Dashboard';
import AdminLayout from './pages/admin/AdminLayout';
import AdminOverview from './pages/admin/AdminOverview';
import AdminMenu from './pages/admin/AdminMenu';
import AdminOrders from './pages/admin/AdminOrders';
import AdminTables from './pages/admin/AdminTables';
import AdminFeedback from './pages/admin/AdminFeedback';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminOffers from './pages/admin/AdminOffers';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="pulse" style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : user.role === 'kitchen' ? '/kitchen' : '/join-table'} /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/join-table" /> : <Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Customer */}
        <Route path="/join-table" element={<ProtectedRoute roles={['customer']}><JoinTable /></ProtectedRoute>} />
        <Route path="/menu" element={<ProtectedRoute roles={['customer']}><Menu /></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute roles={['customer']}><SharedCart /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute roles={['customer']}><OrderStatus /></ProtectedRoute>} />
        <Route path="/feedback/:orderId" element={<ProtectedRoute roles={['customer']}><Feedback /></ProtectedRoute>} />

        {/* Kitchen */}
        <Route path="/kitchen" element={<ProtectedRoute roles={['kitchen']}><KitchenDashboard /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminOverview />} />
          <Route path="menu" element={<AdminMenu />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="tables" element={<AdminTables />} />
          <Route path="feedback" element={<AdminFeedback />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="offers" element={<AdminOffers />} />
        </Route>

        {/* Default */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy_id'}>
      <Router>
        <AuthProvider>
          <SocketProvider>
            <TableProvider>
              <AppRoutes />
              <Toaster position="top-right" toastOptions={{
                style: { background: '#1a1a2e', color: '#eaeaea', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }
              }} />
            </TableProvider>
          </SocketProvider>
        </AuthProvider>
      </Router>
    </GoogleOAuthProvider>
  );
}
