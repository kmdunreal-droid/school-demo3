/**
 * GEO UTILITIES — teacher attendance ke GPS verification ke liye.
 * Haversine formula se school vs live-position distance calculate hota hai.
 */
import { L } from './i18n';
import type { SchoolLocation } from '../types';

/**
 * Default school location (fallback jab tak developer location set na kare).
 * `name` khali rakha gaya hai taake UI mein galat demo naam na dikhe —
 * asli naam developer portal se lat/lng par reverse-geocode kar ke aata hai.
 */
export const DEFAULT_SCHOOL_LOCATION: SchoolLocation = {
  lat: 24.8607,
  lng: 67.0011,
  radiusMeters: 500,
  name: '',
};

/**
 * Purane demo / placeholder naam. Jab location set ki jati hai aur naam abhi bhi
 * yeh placeholder ho, to reverse-geocode se ASLI naam fetch kar ke replace karte hain.
 */
export const DEMO_LOCATION_NAME_PATTERN = /demo\s*academy|not\s*set|unknown|^school$/i;

export interface GeoPosition {
  latitude: number;
  longitude: number;
  accuracyMeters?: number | null;
}

/** Browser geolocation se current position (permission required). */
export async function getCurrentPosition(): Promise<GeoPosition | null> {
  try {
    if (typeof navigator === 'undefined') return null;
    const geoApi = (navigator as any).geolocation;
    if (!geoApi || typeof geoApi.getCurrentPosition !== 'function') {
      console.warn('[Geo] Browser geolocation is not available (requires HTTPS/localhost).');
      return null;
    }
    const pos = await new Promise<any>((resolve, reject) => {
      geoApi.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
      });
    });
    return {
      latitude: pos.coords?.latitude ?? pos.latitude,
      longitude: pos.coords?.longitude ?? pos.longitude,
      accuracyMeters: pos.coords?.accuracy ?? null,
    };
  } catch (e: any) {
    console.warn('[Geo] Location fetch failed:', e?.message || e);
    return null;
  }
}

/** Haversine distance in meters (do lat/lng points). */
export function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371000; // earth radius (m)
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/** School radius ke andar hai ya nahi. */
export function isWithinSchoolRadius(loc: SchoolLocation, lat: number, lng: number, marginM: number = 0): boolean {
  const d = haversineMeters(loc.lat, loc.lng, lat, lng);
  return d <= (loc.radiusMeters + marginM);
}

export function formatDistance(meters: number | null | undefined): string {
  if (meters === null || meters === undefined) return '—';
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(2)} km`;
}

/** Duplicate hisse hata kar "Area, City" jaisa short friendly naam banata hai. */
function buildFriendlyName(parts: (string | undefined | null)[], fallback?: string): string {
  const clean = parts
    .map(p => (typeof p === 'string' ? p.trim() : ''))
    .filter(p => p.length > 0);
  const unique = clean.filter((p, i) => clean.indexOf(p) === i);
  if (unique.length) return unique.slice(0, 3).join(', ');
  return (fallback ?? '').split(',').slice(0, 3).join(',').trim();
}

/**
 * Lat/Lng → asli jagah ka friendly naam (area, city).
 * Provider 1: OpenStreetMap Nominatim (free, no API key).
 * Provider 2: BigDataCloud reverse-geocode-client (free, no API key) — fallback.
 * Dono fail ho jayein ya internet na ho → null (caller purana naam rakhta hai).
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  if (!isFinite(lat) || !isFinite(lng)) return null;

  // ---- Provider 1: OpenStreetMap Nominatim ----
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=18&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    if (res.ok) {
      const data: any = await res.json();
      const a: any = data?.address ?? {};
      const name = buildFriendlyName(
        [
          a.neighbourhood || a.suburb || a.quarter || a.residential || a.city_block,
          a.village || a.hamlet || a.town || a.city_district || a.borough,
          a.city || a.county || a.state_district || a.state,
        ],
        data?.display_name
      );
      if (name) return name;
    }
  } catch {
    /* agla provider try karein */
  }

  // ---- Provider 2: BigDataCloud (fallback) ----
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
    );
    if (res.ok) {
      const d: any = await res.json();
      const name = buildFriendlyName([
        d?.locality || d?.localityInfo?.administrative?.[3]?.name,
        d?.city || d?.principalSubdivision,
        d?.countryName,
      ]);
      if (name) return name;
    }
  } catch {
    /* ignore */
  }

  return null;
}