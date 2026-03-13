import React, { useMemo, useState } from 'react';

const CityAutocomplete = ({
  value,
  onChange,
  suggestions = [],
  placeholder = 'City',
  required = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const filteredSuggestions = useMemo(() => {
    const query = value.trim().toLowerCase();
    if (!query) {
      return suggestions.slice(0, 8);
    }

    return suggestions
      .filter(city => city.toLowerCase().includes(query))
      .slice(0, 8);
  }, [suggestions, value]);

  const showSuggestions = isOpen && filteredSuggestions.length > 0;

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        required={required}
        value={value}
        placeholder={placeholder}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 120)}
        onChange={event => {
          setIsOpen(true);
          onChange(event.target.value);
        }}
        className="w-full rounded-xl border border-slate-300 bg-white/90 px-4 py-3 text-slate-900 placeholder:text-slate-500 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
        autoComplete="off"
      />

      {showSuggestions && (
        <div className="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-xl backdrop-blur-sm">
          {filteredSuggestions.map(city => (
            <button
              key={city}
              type="button"
              onMouseDown={event => {
                event.preventDefault();
                onChange(city);
                setIsOpen(false);
              }}
              className="block w-full border-b border-slate-100 px-4 py-2.5 text-left text-sm text-slate-800 hover:bg-teal-50 last:border-b-0"
            >
              {city}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CityAutocomplete;
