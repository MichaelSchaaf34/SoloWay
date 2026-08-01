import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ExperienceDetail from './ExperienceDetail';
import useAuth from '../hooks/useAuth';
import { useTrip } from '../context/TripContext';
import { getExperience } from '../utils/experienceService';

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
  getExperience: vi.fn(),
}));

function renderExperience(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/destinations/:destinationSlug/experiences/:experienceId"
          element={<ExperienceDetail />}
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('ExperienceDetail', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ isAuthenticated: false });
    useTrip.mockReturnValue({ setDestination: vi.fn(), addToCart: vi.fn() });
    getExperience.mockReset();
  });

  it('renders a curated suggestion from the public detail URL', async () => {
    renderExperience('/destinations/marrakech/experiences/suggested-mrk-2');

    expect(await screen.findByRole('heading', { name: 'Medina Souk & Spice Tour', level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /experiences in marrakech/i })).toHaveAttribute(
      'href',
      '/destinations/marrakech'
    );
    expect(getExperience).not.toHaveBeenCalled();
  });

  it('loads a live bookable experience by id', async () => {
    getExperience.mockResolvedValue({
      data: {
        experience: {
          id: '11111111-1111-1111-1111-111111111111',
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
        },
      },
    });

    renderExperience('/destinations/lisbon/experiences/11111111-1111-1111-1111-111111111111');

    expect(await screen.findByRole('heading', { name: 'Alfama evening food walk', level: 1 })).toBeInTheDocument();
    expect(screen.getAllByText(/Taste local dishes/i).length).toBeGreaterThan(0);
    expect(screen.getByText('Lisbon Local')).toBeInTheDocument();
    expect(getExperience).toHaveBeenCalledWith('11111111-1111-1111-1111-111111111111');
  });
});
