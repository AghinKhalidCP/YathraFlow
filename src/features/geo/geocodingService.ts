import type { GeoLocation } from "../journey/journeyTypes";

// Configurable geocoding provider endpoints (OpenStreetMap Nominatim compliant)
export const GEOCODING_CONFIG = {
  NOMINATIM_BASE_URL: "https://nominatim.openstreetmap.org",
  USER_AGENT: "YathraFlow-KeralaTravelPlanner/2.0 (contact@yathraflow.app; hackathon-demo)",
  DEFAULT_REGION: "Kerala, India",
  MIN_QUERY_LENGTH: 2,
  DEBOUNCE_MS: 400,
  MAX_RESULTS: 8,
};

// In-memory cache for geocoding queries to comply with Nominatim usage policy (max 1 req/sec, aggressive caching)
const geocodeCache = new Map<string, GeoLocation[]>();
const reverseGeocodeCache = new Map<string, GeoLocation>();

export interface NominatimResult {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  display_name: string;
  name?: string;
  type?: string;
  class?: string;
  address?: Record<string, string>;
}

/**
 * Searches locations using OpenStreetMap Nominatim with Kerala/Indian bounds priority.
 * Complies with Nominatim usage policy: custom User-Agent, result caching, debounce.
 */
export async function searchLocations(query: string, signal?: AbortSignal): Promise<GeoLocation[]> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < GEOCODING_CONFIG.MIN_QUERY_LENGTH) return [];

  const cacheKey = trimmed.toLowerCase();
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey)!;
  }

  // If user query does not mention specific state/country, bias towards Kerala
  let searchQuery = trimmed;
  const lower = trimmed.toLowerCase();
  if (!lower.includes("kerala") && !lower.includes("india") && !lower.includes("calicut") && !lower.includes("cochin")) {
    searchQuery = `${trimmed}, Kerala`;
  }

  const params = new URLSearchParams({
    q: searchQuery,
    format: "jsonv2",
    addressdetails: "1",
    limit: String(GEOCODING_CONFIG.MAX_RESULTS),
    countrycodes: "in",
    "accept-language": "en",
  });

  const url = `${GEOCODING_CONFIG.NOMINATIM_BASE_URL}/search?${params.toString()}`;

  try {
    const response = await fetch(url, {
      signal,
      headers: {
        "User-Agent": GEOCODING_CONFIG.USER_AGENT,
      },
    });

    if (response.status === 429) {
      throw new Error("Rate limit reached. Please wait a moment or choose 'Pick on map'.");
    }

    if (!response.ok) {
      throw new Error(`Location service error (${response.status}). Please try again or use Map Pin.`);
    }

    const data: NominatimResult[] = await response.json();

    const results: GeoLocation[] = data.map((item) => {
      const name = item.name || item.display_name.split(",")[0].trim();
      return {
        id: `osm-${item.osm_type || "node"}-${item.osm_id || item.place_id}`,
        name,
        displayName: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        type: item.type || item.class,
        address: item.address,
        providerId: String(item.place_id),
        verificationStatus: "verified_search",
      };
    });

    geocodeCache.set(cacheKey, results);
    return results;
  } catch (err: any) {
    if (err.name === "AbortError") {
      throw err;
    }
    console.error("Geocoding failed for query:", query, err);
    throw err;
  }
}

/**
 * Reverse geocodes coordinates (lat, lng) to an address using OpenStreetMap Nominatim.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<GeoLocation> {
  const cacheKey = `${lat.toFixed(5)},${lng.toFixed(5)}`;
  if (reverseGeocodeCache.has(cacheKey)) {
    return reverseGeocodeCache.get(cacheKey)!;
  }

  const params = new URLSearchParams({
    lat: lat.toFixed(6),
    lon: lng.toFixed(6),
    format: "jsonv2",
    addressdetails: "1",
    "accept-language": "en",
  });

  const url = `${GEOCODING_CONFIG.NOMINATIM_BASE_URL}/reverse?${params.toString()}`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": GEOCODING_CONFIG.USER_AGENT,
      },
    });

    if (!response.ok) {
      throw new Error(`Reverse geocoding error (${response.status})`);
    }

    const item: NominatimResult = await response.json();
    const name = item.name || item.display_name.split(",")[0].trim();

    const loc: GeoLocation = {
      id: `osm-rev-${lat.toFixed(5)}-${lng.toFixed(5)}`,
      name,
      displayName: item.display_name,
      lat,
      lng,
      type: item.type || item.class,
      address: item.address,
      providerId: String(item.place_id),
      verificationStatus: "user_placed_pin",
    };

    reverseGeocodeCache.set(cacheKey, loc);
    return loc;
  } catch (err: any) {
    console.warn("Reverse geocode fallback for coordinates:", lat, lng, err);
    // Graceful fallback when reverse geocoding fails or is rate-limited
    return {
      id: `user-pin-${Date.now()}`,
      name: `Pinned Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      displayName: `Latitude: ${lat.toFixed(6)}, Longitude: ${lng.toFixed(6)} (User selected point)`,
      lat,
      lng,
      verificationStatus: "user_placed_pin",
    };
  }
}

/**
 * Requests browser location via HTML5 Geolocation API with clear permission and timeout handling.
 */
export function getCurrentBrowserLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        let msg = "Could not get your location.";
        if (err.code === 1) msg = "Location access was denied. Please select your origin manually or pick on the map.";
        if (err.code === 2) msg = "GPS location unavailable. Please search manually.";
        if (err.code === 3) msg = "Location request timed out. Please try again or search manually.";
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
}
