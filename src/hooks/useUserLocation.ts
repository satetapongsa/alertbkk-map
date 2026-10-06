'use client';

import { useState, useCallback } from 'react';
import {
  LocationStatus,
  UserLocationData,
  LocationQuality,
} from '@/types/intelligence';
import { reverseGeocode } from '@/lib/reverseGeocode';
import { tacticalAudio } from '@/lib/tacticalAudio';

export interface UseUserLocationOptions {
  onLocationUpdate?: (location: UserLocationData) => void;
  onFollowMapCenter?: (lat: number, lng: number, zoom?: number) => void;
}

export function useUserLocation(options?: UseUserLocationOptions) {
  const [status, setStatus] = useState<LocationStatus>('IDLE');
  const [location, setLocation] = useState<UserLocationData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const classifyQuality = (acc: number): LocationQuality => {
    if (acc <= 10) return 'EXCELLENT';
    if (acc <= 25) return 'GOOD';
    if (acc <= 100) return 'FAIR';
    return 'POOR';
  };

  const getZoomForAccuracy = (acc: number): number => {
    if (acc <= 10) return 17;
    if (acc <= 50) return 16;
    if (acc <= 200) return 14.5;
    return 13;
  };

  const handlePositionSuccess = useCallback(
    (pos: GeolocationPosition) => {
      const { latitude, longitude, accuracy, altitude, altitudeAccuracy, heading, speed } = pos.coords;

      const quality = classifyQuality(accuracy);
      const newLoc: UserLocationData = {
        latitude,
        longitude,
        accuracy: Number(accuracy.toFixed(1)),
        altitude: altitude !== null ? Number(altitude.toFixed(1)) : null,
        altitudeAccuracy: altitudeAccuracy !== null ? Number(altitudeAccuracy.toFixed(1)) : null,
        heading: heading !== null && !isNaN(heading) ? Number(heading.toFixed(0)) : null,
        speed: speed !== null && !isNaN(speed) ? Number(speed.toFixed(1)) : null,
        timestamp: pos.timestamp,
        quality,
      };

      // Non-blocking reverse geocoding for district / city display
      reverseGeocode(latitude, longitude).then((geo) => {
        if (geo) {
          setLocation((prev) => (prev ? { ...prev, district: geo.district, city: geo.city, country: geo.country } : prev));
        }
      });

      setLocation(newLoc);
      setStatus('LOCATED');
      setErrorMsg(null);

      // Move map directly to exact coordinates
      if (options?.onFollowMapCenter) {
        options.onFollowMapCenter(latitude, longitude, getZoomForAccuracy(accuracy));
      }

      if (options?.onLocationUpdate) {
        options.onLocationUpdate(newLoc);
      }
    },
    [options]
  );

  const handlePositionError = useCallback((err: GeolocationPositionError) => {
    tacticalAudio.playCriticalAlert();
    let nextStatus: LocationStatus = 'ERROR';
    let msg = 'LOCATION ERROR';

    switch (err.code) {
      case err.PERMISSION_DENIED:
        nextStatus = 'PERMISSION_DENIED';
        msg = 'LOCATION ACCESS DENIED';
        break;
      case err.POSITION_UNAVAILABLE:
        nextStatus = 'POSITION_UNAVAILABLE';
        msg = 'LOCATION UNAVAILABLE';
        break;
      case err.TIMEOUT:
        nextStatus = 'TIMEOUT';
        msg = 'LOCATION TIMEOUT';
        break;
      default:
        nextStatus = 'ERROR';
        msg = 'LOCATION ERROR';
    }

    setStatus(nextStatus);
    setErrorMsg(msg);
  }, []);

  /**
   * Acquire ONE current position using navigator.geolocation.getCurrentPosition()
   * enableHighAccuracy: true, maximumAge: 0, timeout: 15000
   * No watchPosition. No polling. No tracking. Pure one-shot fix.
   */
  const locate = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setStatus('ERROR');
      setErrorMsg('LOCATION UNAVAILABLE (GEOLOCATION NOT SUPPORTED)');
      return;
    }

    tacticalAudio.playRadarBlip();
    setStatus('REQUESTING');
    setErrorMsg(null);

    const geoOptions: PositionOptions = {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 15000,
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => handlePositionSuccess(pos),
      (err) => handlePositionError(err),
      geoOptions
    );
  }, [handlePositionSuccess, handlePositionError]);

  return {
    status,
    location,
    errorMsg,
    locate,
  };
}
