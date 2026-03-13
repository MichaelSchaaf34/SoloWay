import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import FirstChoice from './pages/FirstChoice';
import Explore from './pages/Explore';
import AIPreferences from './pages/AIPreferences';
import AIItinerary from './pages/AIItinerary';
import BookingCart from './pages/BookingCart';
import Itineraries from './pages/Itineraries';
import ItineraryDetail from './pages/ItineraryDetail';
import GuestJoin from './pages/GuestJoin';
import BuddyHistory from './pages/BuddyHistory';
import { ProtectedRoute } from './components';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/start" element={<ProtectedRoute><FirstChoice /></ProtectedRoute>} />
        <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
        <Route path="/ai-preferences" element={<ProtectedRoute><AIPreferences /></ProtectedRoute>} />
        <Route path="/ai-itinerary" element={<ProtectedRoute><AIItinerary /></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute><BookingCart /></ProtectedRoute>} />
        <Route path="/itineraries" element={<ProtectedRoute><Itineraries /></ProtectedRoute>} />
        <Route path="/itineraries/:itineraryId" element={<ProtectedRoute><ItineraryDetail /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/buddy/history" element={<ProtectedRoute><BuddyHistory /></ProtectedRoute>} />
        <Route path="/join/:token" element={<GuestJoin />} />
      </Routes>
    </Router>
  );
}

export default App;
