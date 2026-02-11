import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import FirstChoice from './pages/FirstChoice';
import Explore from './pages/Explore';
import Itineraries from './pages/Itineraries';
import ItineraryDetail from './pages/ItineraryDetail';
import { ProtectedRoute } from './components';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/start" element={<ProtectedRoute><FirstChoice /></ProtectedRoute>} />
        <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
        <Route path="/itineraries" element={<ProtectedRoute><Itineraries /></ProtectedRoute>} />
        <Route path="/itineraries/:itineraryId" element={<ProtectedRoute><ItineraryDetail /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
