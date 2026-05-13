'use client';

import { MapPin, ExternalLink } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────

interface LocationBubbleProps {
  metadata: {
    latitude: number;
    longitude: number;
    address?: string;
  } | null | undefined;
  isMine: boolean;
}

// ── Component ──────────────────────────────────────────────────────

export function LocationBubble({ metadata, isMine }: LocationBubbleProps) {
  if (!metadata || metadata.latitude == null || metadata.longitude == null) return null;

  const { latitude, longitude, address } = metadata;
  const lat = latitude;
  const lng = longitude;

  const mapImageUrl = `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=15&size=300x200&maptype=mapnik&markers=${lat},${lng},red-pushpin`;
  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
  const coordsText = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  const textColor = isMine ? 'text-white' : 'text-text-primary';
  const mutedColor = isMine ? 'text-white/60' : 'text-text-muted';

  return (
    <a
      href={googleMapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-xl overflow-hidden min-w-[200px] max-w-full cursor-pointer group"
    >
      {/* Map image */}
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mapImageUrl}
          alt={address ?? 'Shared location'}
          className="w-full h-[150px] object-cover"
          loading="lazy"
        />
        {/* Pin overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-8 h-8 rounded-full bg-red-500/80 flex items-center justify-center shadow-lg">
            <MapPin className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>

      {/* Address / coordinates */}
      <div className="px-2.5 py-2 flex items-center gap-2">
        <div className="flex-1 min-w-0">
          {address ? (
            <>
              <p className={`text-sm font-medium truncate ${textColor}`}>{address}</p>
              <p className={`text-[10px] ${mutedColor}`}>{coordsText}</p>
            </>
          ) : (
            <p className={`text-sm ${textColor}`}>{coordsText}</p>
          )}
        </div>
        <ExternalLink className={`w-3.5 h-3.5 flex-shrink-0 ${mutedColor} group-hover:opacity-100 opacity-60 transition-opacity`} />
      </div>
    </a>
  );
}
