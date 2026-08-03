import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DestinationDetail from './DestinationDetail';
import useAuth from '../hooks/useAuth';
import { useTrip } from '../context/TripContext';
import { listExperiences } from '../utils/experienceService';
import { listDestinationEvents } from '../utils/eventsService';

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

vi.mock('../utils/eventsService', () => ({
  listDestinationEvents: vi.fn(),
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
  const setDates = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ isAuthenticated: false });
    useTrip.mockReturnValue({ setDestination, setDates, addToCart });
    listDestinationEvents.mockResolvedValue({ data: { events: [] } });
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
    expect(screen.getByRole('link', { name: /view details/i })).toHaveAttribute(
      'href',
      '/destinations/lisbon/experiences/experience-1'
    );
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

  it('scopes events to a trip window from the search bar and shows it', async () => {
    renderDestination('/destinations/lisbon?start=2026-08-07&end=2026-08-12');

    await waitFor(() =>
      expect(listDestinationEvents).toHaveBeenCalledWith('lisbon', {
        limit: 6,
        startDate: '2026-08-07',
        endDate: '2026-08-12',
      })
    );
    expect(screen.getByText('Aug 7 – Aug 12')).toBeInTheDocument();
    expect(setDates).toHaveBeenCalledWith({ start: '2026-08-07', end: '2026-08-12' });
  });

  it('ignores a malformed date range instead of rendering a broken window', async () => {
    renderDestination('/destinations/lisbon?start=nonsense&end=2026-08-12');

    await waitFor(() =>
      expect(listDestinationEvents).toHaveBeenCalledWith('lisbon', {
        limit: 6,
        startDate: '',
        endDate: '',
      })
    );
    expect(screen.queryByLabelText('Clear trip dates')).not.toBeInTheDocument();
  });

  it('drops an end date that falls before the start date', async () => {
    renderDestination('/destinations/lisbon?start=2026-08-12&end=2026-08-07');

    await waitFor(() =>
      expect(listDestinationEvents).toHaveBeenCalledWith('lisbon', {
        limit: 6,
        startDate: '2026-08-12',
        endDate: '',
      })
    );
    expect(screen.getByText('Aug 12')).toBeInTheDocument();
  });

  it('clearing the trip dates refetches events unscoped', async () => {
    renderDestination('/destinations/lisbon?start=2026-08-07&end=2026-08-12');

    const clear = await screen.findByLabelText('Clear trip dates');
    fireEvent.click(clear);

    await waitFor(() =>
      expect(listDestinationEvents).toHaveBeenLastCalledWith('lisbon', {
        limit: 6,
        startDate: '',
        endDate: '',
      })
    );
    expect(screen.queryByLabelText('Clear trip dates')).not.toBeInTheDocument();
    expect(setDates).toHaveBeenLastCalledWith({ start: '', end: '' });
  });

  it('shows a public not-found page for an unsupported destination slug', () => {
    renderDestination('/destinations/unknown-place');

    expect(screen.getByText('That stop is not on our map yet.')).toBeInTheDocument();
    expect(listExperiences).not.toHaveBeenCalled();
  });
});
