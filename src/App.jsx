import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import DestinationDetail from './pages/DestinationDetail';
import Reviews from './pages/Reviews';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import FirstChoice from './pages/FirstChoice';
import Explore from './pages/Explore';
import BookingCart from './pages/BookingCart';
import Itineraries from './pages/Itineraries';
import ItineraryDetail from './pages/ItineraryDetail';
import GuestJoin from './pages/GuestJoin';
import BuddyHistory from './pages/BuddyHistory';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import BookingReturn from './pages/BookingReturn';
import ProviderOnboarding from './pages/ProviderOnboarding';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminWaitlist from './pages/admin/AdminWaitlist';
import AdminCatalog from './pages/admin/AdminCatalog';
import AdminOrders from './pages/admin/AdminOrders';
import AdminReviews from './pages/admin/AdminReviews';
import { ProtectedRoute, AdminRoute, ScrollToTop } from './components';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/destinations/:destinationSlug" element={<DestinationDetail />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/start" element={<ProtectedRoute><FirstChoice /></ProtectedRoute>} />
        <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
        {/* AI trip planning is not launched yet; the pages are stubs (see FirstChoice "Coming Soon"). */}
        <Route path="/ai-preferences" element={<Navigate to="/start" replace />} />
        <Route path="/ai-itinerary" element={<Navigate to="/start" replace />} />
        <Route path="/cart" element={<ProtectedRoute><BookingCart /></ProtectedRoute>} />
        <Route path="/booking/return" element={<ProtectedRoute><BookingReturn /></ProtectedRoute>} />
        <Route path="/provider/onboarding" element={<ProtectedRoute><ProviderOnboarding /></ProtectedRoute>} />
        <Route path="/itineraries" element={<ProtectedRoute><Itineraries /></ProtectedRoute>} />
        <Route path="/itineraries/:itineraryId" element={<ProtectedRoute><ItineraryDetail /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/buddy/history" element={<ProtectedRoute><BuddyHistory /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="waitlist" element={<AdminWaitlist />} />
          <Route path="catalog" element={<AdminCatalog />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="reviews" element={<AdminReviews />} />
        </Route>
        <Route path="/join/:token" element={<GuestJoin />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
