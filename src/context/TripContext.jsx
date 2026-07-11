import React, { useState, useCallback, createContext, useContext } from 'react';

const TripContext = createContext(null);

export const TripProvider = ({ children }) => {
  const [destination, setDestination] = useState(null);
  const [dates, setDates] = useState({ start: '', end: '' });
  const [path, setPath] = useState(null);
  const [preferences, setPreferences] = useState([]);
  const [cart, setCart] = useState([]);
  const [cartError, setCartError] = useState('');

  const addToCart = useCallback((item) => {
    setCart(prev => {
      if (!item.providerId) {
        setCartError('This preview experience is not available for checkout yet.');
        return prev;
      }
      const existingProvider = prev[0]?.providerId;
      if (existingProvider && existingProvider !== item.providerId) {
        setCartError('For now, experiences from different providers require separate checkouts.');
        return prev;
      }
      setCartError('');
      return prev.find(c => c.id === item.id) ? prev : [...prev, item];
    });
  }, []);

  const removeFromCart = useCallback((itemId) => {
    setCart(prev => prev.filter(c => c.id !== itemId));
  }, []);

  const isInCart = useCallback((itemId) => cart.some(c => c.id === itemId), [cart]);

  const cartTotalCents = cart.reduce(
    (sum, item) => sum + (item.priceCents ?? Math.round((item.price || 0) * 100)),
    0
  );
  const cartTotal = cartTotalCents / 100;

  const togglePreference = useCallback((prefId) => {
    setPreferences(prev =>
      prev.includes(prefId) ? prev.filter(p => p !== prefId) : [...prev, prefId]
    );
  }, []);

  const resetTrip = useCallback(() => {
    setDestination(null);
    setDates({ start: '', end: '' });
    setPath(null);
    setPreferences([]);
    setCart([]);
    setCartError('');
  }, []);

  return (
    <TripContext.Provider value={{
      destination, setDestination,
      dates, setDates,
      path, setPath,
      preferences, togglePreference,
      cart, addToCart, removeFromCart, isInCart, cartTotal, cartTotalCents,
      cartError, clearCartError: () => setCartError(''),
      resetTrip,
    }}>
      {children}
    </TripContext.Provider>
  );
};

export const useTrip = () => {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error('useTrip must be used within TripProvider');
  return ctx;
};
