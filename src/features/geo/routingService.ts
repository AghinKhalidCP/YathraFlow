import type { LegGeometry, TransportMode } from "../journey/journeyTypes";

// Configurable OSRM routing endpoint (Open-Source Routing Machine)
export const ROUTING_CONFIG = {
  OSRM_BASE_URL: "https://router.project-osrm.org/route/v1",
  TIMEOUT_MS: 8000,
};

// Route geometry in-memory cache to avoid duplicate routing calls
const routeGeometryCache = new Map<string, LegGeometry>();

/**
 * Calculates straight-line distance in kilometers using the Haversine formula.
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Maps YathraFlow transport mode to OSRM profile.
 * OSRM public instance provides 'car' (driving) and 'foot' (walking) profiles.
 */
function getOsrmProfile(mode: TransportMode): string | null {
  if (mode === "walking") {
    return "foot";
  }
  if (mode === "car" || mode === "taxi" || mode === "auto" || mode === "ksrtc_bus" || mode === "private_bus") {
    return "car";
  }
  // Train, Ferry, Other do not use road routing
  return null;
}

/**
 * Fetches real road/footpath geometry from OpenStreetMap OSRM routing service.
 * Respects transport limitations: Train and Ferry are treated as manual transit geometry without fabricating road routes.
 */
export async function fetchLegRouteGeometry(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
  mode: TransportMode,
  signal?: AbortSignal
): Promise<LegGeometry> {
  const cacheKey = `${fromLat.toFixed(5)},${fromLng.toFixed(5)}_${toLat.toFixed(5)},${toLng.toFixed(5)}_${mode}`;
  if (routeGeometryCache.has(cacheKey)) {
    return routeGeometryCache.get(cacheKey)!;
  }

  // Handle manual non-road modes (Train, Ferry, Other)
  const profile = getOsrmProfile(mode);
  if (!profile) {
    const straightDist = calculateHaversineDistanceKm(fromLat, fromLng, toLat, toLng);
    const speedKmh = mode === "train" ? 50 : mode === "ferry" ? 18 : 25;
    const estDurationMinutes = Math.max(5, Math.round((straightDist / speedKmh) * 60));

    const manualGeometry: LegGeometry = {
      coordinates: [
        [fromLat, fromLng],
        [toLat, toLng],
      ],
      distanceKm: straightDist,
      durationMinutes: estDurationMinutes,
      status: "manual_transit",
      isStraightLineFallback: true,
    };
    routeGeometryCache.set(cacheKey, manualGeometry);
    return manualGeometry;
  }

  // OSRM API expects: {lon},{lat};{lon},{lat}
  const url = `${ROUTING_CONFIG.OSRM_BASE_URL}/${profile}/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ROUTING_CONFIG.TIMEOUT_MS);

    // Merge signals if provided
    const response = await fetch(url, {
      signal: signal || controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`OSRM service response HTTP ${response.status}`);
    }

    const data = await response.json();
    if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
      throw new Error("OSRM returned no route for these coordinates");
    }

    const route = data.routes[0];
    const distanceKm = Math.round((route.distance / 1000) * 10) / 10;
    const durationMinutes = Math.round(route.duration / 60);

    // GeoJSON coordinates are [lon, lat], Leaflet polyline expects [lat, lon]
    const coordinates: [number, number][] = route.geometry.coordinates.map(
      (coord: [number, number]) => [coord[1], coord[0]]
    );

    const result: LegGeometry = {
      coordinates,
      distanceKm,
      durationMinutes,
      status: mode === "walking" ? "walking_calculated" : "road_calculated",
      isStraightLineFallback: false,
    };

    routeGeometryCache.set(cacheKey, result);
    return result;
  } catch (err: any) {
    if (err.name === "AbortError" && signal?.aborted) throw err;
    console.warn("OSRM routing unavailable for coordinates, applying fallback:", err.message);

    const straightDist = calculateHaversineDistanceKm(fromLat, fromLng, toLat, toLng);
    // Road distance multiplier approximation for Kerala terrain ~ 1.3x
    const roadApproxKm = Math.round(straightDist * 1.3 * 10) / 10;
    const speedKmh = mode === "walking" ? 4.5 : 32;
    const estDurationMinutes = Math.max(3, Math.round((roadApproxKm / speedKmh) * 60));

    const fallback: LegGeometry = {
      coordinates: [
        [fromLat, fromLng],
        [toLat, toLng],
      ],
      distanceKm: roadApproxKm,
      durationMinutes: estDurationMinutes,
      status: "unavailable",
      isStraightLineFallback: true,
    };
    routeGeometryCache.set(cacheKey, fallback);
    return fallback;
  }
}
