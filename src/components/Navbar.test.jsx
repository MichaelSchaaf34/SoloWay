import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Navbar from './Navbar';
import useAuth from '../hooks/useAuth';
import { DarkModeProvider } from '../context/DarkModeContext';

vi.mock('../hooks/useAuth', () => ({
  default: vi.fn(),
}));

describe('Navbar theme control', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    useAuth.mockReturnValue({
      isAuthenticated: false,
      isInitializing: false,
      user: null,
      logout: vi.fn(),
    });
  });

  it('visibly toggles the document between light and dark themes', async () => {
    render(
      <MemoryRouter>
        <DarkModeProvider>
          <Navbar />
        </DarkModeProvider>
      </MemoryRouter>
    );

    const themeButtons = screen.getAllByRole('button', { name: 'Switch to dark mode' });
    fireEvent.click(themeButtons[0]);

    await waitFor(() => expect(document.documentElement).toHaveClass('dark'));
    expect(screen.getAllByRole('button', { name: 'Switch to light mode' })).toHaveLength(2);
  });
});
