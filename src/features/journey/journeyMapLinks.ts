import type { JourneyLeg, TransportMode } from "./journeyTypes";

/**
 * Ensures location has regional context (defaulting to Kerala)
 * so Google Maps directions query resolves reliably.
 */
export function formatLocationForMapQuery(location: string, region: string = "Kerala"): string {
  const trimmed = location.trim();
  if (!trimmed) return "";

  // If already contains region or common Kerala cities, don't repeat
  const lower = trimmed.toLowerCase();
  if (
    lower.includes("kerala") ||
    lower.includes("kochi") ||
    lower.includes("kozhikode") ||
    lower.includes("calicut") ||
    lower.includes("trivandrum") ||
    lower.includes("thiruvananthapuram") ||
    lower.includes("thrissur") ||
    lower.includes("kannur") ||
    lower.includes("alappuzha") ||
    lower.includes("kottayam")
  ) {
    return trimmed;
  }

  return `${trimmed}, ${region}`;
}

/**
 * Maps YathraFlow transit modes to Google Maps travelmode parameter
 */
export function mapModeToGoogleTravelMode(mode: TransportMode): "driving" | "walking" | "transit" {
  switch (mode) {
    case "walking":
      return "walking";
    case "train":
    case "bus":
    case "other":
      return "transit";
    case "auto":
    case "taxi":
    default:
      return "driving";
  }
}

/**
 * Generates a direct Google Maps Directions URL for a single journey leg
 */
export function buildGoogleMapsLegUrl(
  from: string,
  to: string,
  mode: TransportMode = "bus",
  region: string = "Kerala",
  options?: { customMapUrl?: string; fromCoords?: string; toCoords?: string }
): string {
  if (options?.customMapUrl && options.customMapUrl.trim()) {
    return options.customMapUrl.trim();
  }

  const originQuery = options?.fromCoords?.trim() || formatLocationForMapQuery(from, region);
  const destQuery = options?.toCoords?.trim() || formatLocationForMapQuery(to, region);

  if (!originQuery && !destQuery) return "";
  if (!destQuery) return buildGoogleMapsSearchUrl(originQuery, region);
  if (!originQuery) return buildGoogleMapsSearchUrl(destQuery, region);

  const travelMode = mapModeToGoogleTravelMode(mode);
  const params = new URLSearchParams({
    api: "1",
    origin: originQuery,
    destination: destQuery,
    travelmode: travelMode,
  });

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

/**
 * Generates a direct Google Maps search URL for an individual location/hub
 */
export function buildGoogleMapsSearchUrl(location: string, region: string = "Kerala"): string {
  const query = formatLocationForMapQuery(location, region);
  if (!query) return "";

  const params = new URLSearchParams({
    api: "1",
    query,
  });

  return `https://www.google.com/maps/search/?${params.toString()}`;
}

/**
 * Generates a full journey route URL in Google Maps including intermediate transfer waypoints
 */
export function buildFullRouteGoogleMapsUrl(
  origin: string,
  destination: string,
  legs: JourneyLeg[] = [],
  region: string = "Kerala"
): string {
  const formattedOrigin = formatLocationForMapQuery(origin, region);
  const formattedDestination = formatLocationForMapQuery(destination, region);

  if (!formattedOrigin && !formattedDestination) return "";
  if (!formattedOrigin) return buildGoogleMapsSearchUrl(formattedDestination, region);
  if (!formattedDestination) return buildGoogleMapsSearchUrl(formattedOrigin, region);

  // Extract intermediate transfer stops as waypoints (avoid duplicate endpoints)
  const waypointList: string[] = [];
  legs.forEach((leg, index) => {
    if (index > 0 && leg.from) {
      const formatted = formatLocationForMapQuery(leg.from, region);
      if (formatted && !waypointList.includes(formatted)) {
        waypointList.push(formatted);
      }
    }
  });

  const params = new URLSearchParams({
    api: "1",
    origin: formattedOrigin,
    destination: formattedDestination,
  });

  if (waypointList.length > 0) {
    // Google Maps dir waypoints separated by '|'
    params.set("waypoints", waypointList.slice(0, 5).join("|"));
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}
