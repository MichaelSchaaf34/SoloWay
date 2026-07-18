import React, { useMemo } from 'react';
import { Globe2, MapPin } from 'lucide-react';

function buildEmbedUrl(lat, lng, { zoom = 'local' } = {}) {
  const delta = zoom === 'world' ? 18 : 0.012;
  const latDelta = zoom === 'world' ? 12 : delta * 0.72;
  const bbox = `${lng - delta},${lat - latDelta},${lng + delta},${lat + latDelta}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${lat}%2C${lng}`;
}

const ExperienceLocationMap = ({ location }) => {
  const localMapUrl = useMemo(() => {
    if (!location) return null;
    return buildEmbedUrl(location.lat, location.lng, { zoom: 'local' });
  }, [location?.lat, location?.lng]);

  const worldMapUrl = useMemo(() => {
    if (!location) return null;
    return buildEmbedUrl(location.lat, location.lng, { zoom: 'world' });
  }, [location?.lat, location?.lng]);

  if (!location || !localMapUrl) {
    return (
      <div
        className="flex h-full min-h-[220px] flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-300 bg-white p-6 text-center dark:border-slate-700 dark:bg-slate-950"
        aria-hidden="true"
      >
        <Globe2 className="h-8 w-8 text-slate-300 dark:text-slate-600" />
        <p className="mt-3 text-sm text-slate-400 dark:text-slate-500">Map preview</p>
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950"
      aria-live="polite"
      aria-label={`Map showing ${location.label} in ${location.destinationName}, ${location.country}`}
    >
      <div className="border-b border-slate-200/80 px-4 py-3 dark:border-slate-800">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-300">
            <MapPin className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{location.label}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {location.destinationName}, {location.country}
            </p>
          </div>
        </div>
      </div>

      <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-900">
        <iframe
          key={localMapUrl}
          title={`Map of ${location.label}`}
          src={localMapUrl}
          className="h-full w-full border-0 transition-opacity duration-300"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />

        <div className="pointer-events-none absolute bottom-3 right-3 overflow-hidden rounded-xl border border-white/80 shadow-lg dark:border-slate-700">
          <div className="flex items-center gap-1 bg-white/95 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:bg-slate-950/95 dark:text-slate-400">
            <Globe2 className="h-3 w-3" />
            World
          </div>
          <iframe
            key={worldMapUrl}
            title={`World context for ${location.label}`}
            src={worldMapUrl}
            className="h-[72px] w-[96px] border-0 bg-slate-200 dark:bg-slate-800"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            tabIndex={-1}
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
};

export default ExperienceLocationMap;
