import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProtectedRoute from './ProtectedRoute';
import useAuth from '../hooks/useAuth';

vi.mock('../hooks/useAuth', () => ({
  default: vi.fn(),
}));

function AuthDestination() {
  const location = useLocation();
  return (
    <div>
      Sign in
      <span data-testid="redirect-from">{location.state?.from}</span>
    </div>
  );
}

function renderProtectedRoute() {
  return render(
    <MemoryRouter initialEntries={['/trips/current']}>
      <Routes>
        <Route
          path="/trips/current"
          element={(
            <ProtectedRoute>
              <div>Private trip</div>
            </ProtectedRoute>
          )}
        />
        <Route path="/auth" element={<AuthDestination />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    useAuth.mockReset();
  });

  it('shows a session check while authentication initializes', () => {
    useAuth.mockReturnValue({ isAuthenticated: false, isInitializing: true });

    renderProtectedRoute();

    expect(screen.getByText('Checking your session...')).toBeInTheDocument();
    expect(screen.queryByText('Private trip')).not.toBeInTheDocument();
  });

  it('redirects signed-out users and preserves their intended path', () => {
    useAuth.mockReturnValue({ isAuthenticated: false, isInitializing: false });

    renderProtectedRoute();

    expect(screen.getByText('Sign in')).toBeInTheDocument();
    expect(screen.getByTestId('redirect-from')).toHaveTextContent('/trips/current');
  });

  it('renders protected content for authenticated users', () => {
    useAuth.mockReturnValue({ isAuthenticated: true, isInitializing: false });

    renderProtectedRoute();

    expect(screen.getByText('Private trip')).toBeInTheDocument();
    expect(screen.queryByText('Sign in')).not.toBeInTheDocument();
  });
});
