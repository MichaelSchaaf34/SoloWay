import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

// DEV BYPASS — remove before production
const DEV_BYPASS_AUTH = true;

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, isInitializing } = useAuth();

  if (DEV_BYPASS_AUTH) return children;

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center">
        Checking your session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  return children;
};

export default ProtectedRoute;
