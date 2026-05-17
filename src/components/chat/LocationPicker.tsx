'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import {
  X,
  Loader2,
  MapPin,
  Navigation,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────

interface LocationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelected: (location: {
    latitude: number;
    longitude: number;
    address?: string;
  }) => void;
}

type LocationState =
  | { status: 'loading' }
  | { status: 'success'; latitude: number; longitude: number; address?: string }
  | { status: 'error'; message: string }
  | { status: 'permission'; message: string };

// ── Component ──────────────────────────────────────────────────────

export function LocationPicker({
  isOpen,
  onClose,
  onLocationSelected,
}: LocationPickerProps) {
  const [state, setState] = useState<LocationState>({ status: 'loading' });
  const [sharing, setSharing] = useState(false);
  const abortRef = useRef(false);
  const watchIdRef = useRef<number | null>(null);

  // ── Request location ──

  const requestLocation = useCallback(() => {
    abortRef.current = false;
    setState({ status: 'loading' });

    if (!navigator.geolocation) {
      setState({
        status: 'error',
        message: 'Geolocation is not supported by your browser.',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        if (abortRef.current) return;

        const { latitude, longitude } = position.coords;
        setState({ status: 'success', latitude, longitude });

        // Reverse geocode for address (best-effort)
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { 'Accept-Language': 'en' } },
          );
          if (abortRef.current) return;

          if (res.ok) {
            const data = await res.json();
            const address = data?.display_name;
            if (address && !abortRef.current) {
              setState({ status: 'success', latitude, longitude, address });
            }
          }
        } catch {
          // Non-critical — we already have coordinates
        }
      },
      (err) => {
        if (abortRef.current) return;

        switch (err.code) {
          case err.PERMISSION_DENIED:
            setState({
              status: 'permission',
              message:
                'Location access was denied. Please allow location access in your browser settings to share your location.',
            });
            break;
          case err.POSITION_UNAVAILABLE:
            setState({
              status: 'error',
              message: 'Unable to determine your location. Please try again.',
            });
            break;
          case err.TIMEOUT:
            setState({
              status: 'error',
              message: 'Location request timed out. Please try again.',
            });
            break;
          default:
            setState({
              status: 'error',
              message: 'An unexpected error occurred while getting your location.',
            });
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      },
    );
  }, []);

  // ── Request on open ──

  useEffect(() => {
    if (isOpen) {
      requestLocation();
    }

    return () => {
      abortRef.current = true;
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [isOpen, requestLocation]);

  // ── Share handler ──

  function handleShare() {
    if (state.status !== 'success') return;
    setSharing(true);
    onLocationSelected({
      latitude: state.latitude,
      longitude: state.longitude,
      address: state.address,
    });
    setSharing(false);
    onClose();
  }

  // ── Static map URL ──

  function getMapUrl(lat: number, lng: number): string {
    return `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=15&size=400x250&maptype=mapnik&markers=${lat},${lng},red-pushpin`;
  }

  // ── Render nothing when closed ──

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="bg-bg-card border border-border-primary rounded-2xl shadow-2xl w-full max-w-md mx-4 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between p-4 border-b border-border-primary">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-accent-primary" />
            <h2 className="text-lg font-semibold text-text-primary">Share Location</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-bg-tertiary text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Content ── */}
        <div className="p-4">
          {/* Loading */}
          {state.status === 'loading' && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 rounded-full bg-accent-primary/15 flex items-center justify-center mb-4">
                <Loader2 className="w-6 h-6 text-accent-primary animate-spin" />
              </div>
              <p className="text-sm text-text-secondary">Getting your location...</p>
              <p className="text-xs text-text-muted mt-1">This may take a moment</p>
            </div>
          )}

          {/* Success */}
          {state.status === 'success' && (
            <div className="space-y-4">
              {/* Map preview */}
              <div className="rounded-xl overflow-hidden border border-border-primary bg-bg-tertiary">
                <Image
                  src={getMapUrl(state.latitude, state.longitude)}
                  alt="Your location on map"
                  width={400}
                  height={200}
                  className="w-full h-[200px] object-cover"
                  unoptimized
                />
              </div>

              {/* Coordinates & address */}
              <div className="bg-bg-secondary rounded-xl p-3 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-accent-primary flex-shrink-0" />
                  <p className="text-sm text-text-primary">
                    {state.latitude.toFixed(6)}, {state.longitude.toFixed(6)}
                  </p>
                </div>
                {state.address && (
                  <p className="text-xs text-text-muted pl-6 line-clamp-2">
                    {state.address}
                  </p>
                )}
              </div>

              {/* Share button */}
              <button
                onClick={handleShare}
                disabled={sharing}
                className="w-full btn-primary py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
              >
                {sharing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <MapPin className="w-4 h-4" />
                )}
                Share This Location
              </button>
            </div>
          )}

          {/* Error */}
          {state.status === 'error' && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 rounded-full bg-red-500/15 flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
              <p className="text-sm text-text-secondary text-center mb-4">
                {state.message}
              </p>
              <button
                onClick={requestLocation}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-bg-tertiary text-text-primary hover:bg-bg-secondary transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          )}

          {/* Permission denied */}
          {state.status === 'permission' && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 rounded-full bg-amber-500/15 flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-amber-400" />
              </div>
              <p className="text-sm font-medium text-text-primary mb-2">
                Permission Required
              </p>
              <p className="text-xs text-text-muted text-center max-w-[280px] mb-4">
                {state.message}
              </p>
              <button
                onClick={requestLocation}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-bg-tertiary text-text-primary hover:bg-bg-secondary transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
