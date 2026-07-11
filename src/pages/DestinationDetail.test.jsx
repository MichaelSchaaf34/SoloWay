import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DestinationDetail from './DestinationDetail';
import useAuth from '../hooks/useAuth';
import { useTrip } from '../context/TripContext';
import { listExperiences } from '../utils/experienceService';

vi.mock('../components/Navbar', () => ({
  default: () => <nav>SoloWay navigation</nav>,
}));

vi.mock('../components/Footer', () => ({
  default: () => <footer>SoloWay footer</footer>,
}));

vi.mock('../hooks/useAuth', () => ({
  default: vi.fn(),
}));

vi.mock('../context/TripContext', () => ({
  useTrip: vi.fn(),
}));

vi.mock('../utils/experienceService', () => ({
  listExperiences: vi.fn(),
}));

function renderDestination(path = '/destinations/lisbon') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/destinations/:destinationSlug" element={<DestinationDetail />} />
        <Route path="/auth" element={<div>Authentication page</div>} />
        <Route path="/cart" element={<div>Booking cart</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('DestinationDetail', () => {
  const setDestination = vi.fn();
  const addToCart = vi.fn();

  beforeEach(() => {
    useAuth.mockReturnValue({ isAuthenticated: false });
    useTrip.mockReturnValue({ setDestination, addToCart });
    listExperiences.mockResolvedValue({
      data: {
        experiences: [{
          id: 'experience-1',
          providerId: 'provider-1',
          providerName: 'Lisbon Local',
          destinationSlug: 'lisbon',
          title: 'Alfama evening food walk',
          description: 'Taste local dishes with a neighborhood host.',
          category: 'food',
          locationName: 'Alfama',
          scheduledTime: '18:30',
          durationMinutes: 120,
          priceCents: 6500,
          currency: 'eur',
        }],
      },
    });
  });

  it('shows a public destination page with live experiences before authentication', async () => {
    renderDestination();

    expect(screen.getByRole('heading', { name: 'Lisbon', level: 1 })).toBeInTheDocument();
    expect(await screen.findByText('Alfama evening food walk')).toBeInTheDocument();
    expect(listExperiences).toHaveBeenCalledWith({ destination: 'lisbon', limit: 24 });
    expect(screen.getByRole('link', { name: /create account to book/i })).toHaveAttribute('href', '/auth');
  });

  it('remembers the destination and experience before opening authentication', async () => {
    renderDestination();
    const bookingLink = await screen.findByRole('link', { name: /create account to book/i });

    fireEvent.click(bookingLink);

    await waitFor(() => expect(screen.getByText('Authentication page')).toBeInTheDocument());
    expect(setDestination).toHaveBeenCalledWith(expect.objectContaining({ id: 'lisbon' }));
    expect(addToCart).toHaveBeenCalledWith(expect.objectContaining({ id: 'experience-1' }));
  });

  it('shows a public not-found page for an unsupported destination slug', () => {
    renderDestination('/destinations/unknown-place');

    expect(screen.getByText('That stop is not on our map yet.')).toBeInTheDocument();
    expect(listExperiences).not.toHaveBeenCalled();
  });
});
