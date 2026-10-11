export type TransportMode =
  | "train"
  | "ksrtc_bus"
  | "private_bus"
  | "auto"
  | "taxi"
  | "car"
  | "walking"
  | "ferry"
  | "other";

export type FareStatus =
  | "verified_tariff"
  | "organiser_provided"
  | "estimated_fare"
  | "user_entered"
  | "unavailable"
  | "unknown";

export type ValueSource =
  | "organiser"
  | "user"
  | "curated"
  | "external"
  | "unknown";

export type LocationVerificationStatus =
  | "verified_search"
  | "user_placed_pin"
  | "browser_gps"
  | "unverified_text";

export type EstimatedValue = {
  value: number | null;
  source: ValueSource;
  fareStatus?: FareStatus;
  note?: string;
  isCalculated?: boolean;
};

export type GeoLocation = {
  id: string; // Stable internal identifier
  name: string;
  displayName: string;
  lat: number;
  lng: number;
  type?: string;
  address?: Record<string, string>;
  providerId?: string; // OSM Place ID or Nominatim ID
  verificationStatus: LocationVerificationStatus;
};

export type LegGeometry = {
  coordinates: [number, number][]; // [lat, lng] array
  distanceKm: number;
  durationMinutes: number;
  status: "road_calculated" | "walking_calculated" | "manual_transit" | "unavailable";
  isStraightLineFallback?: boolean;
};

export type JourneyLeg = {
  id: string;
  mode: TransportMode;
  from: string;
  to: string;
  fromLocation?: GeoLocation;
  toLocation?: GeoLocation;
  fromCoords?: string;
  toCoords?: string;
  serviceName?: string; // e.g. "KSRTC Fast Passenger", "Kochi Water Metro", "Venad Express"
  fare: EstimatedValue;
  durationMinutes: EstimatedValue;
  distanceKm?: number | null;
  instructions?: string;
  transferNotes?: string;
  userNotes?: string;
  customMapUrl?: string;
  geometry?: LegGeometry;
};

export type JourneyRoute = {
  id: string;
  name: string;
  description?: string;
  legs: JourneyLeg[];
};

export type Journey = {
  id: string;
  title: string;
  region: "Kerala";
  originLabel: string;
  destinationLabel: string;
  originLocation?: GeoLocation;
  destinationLocation?: GeoLocation;
  routes: JourneyRoute[];
  activeRouteId: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CostSummaryResult = {
  knownSubtotal: number;
  verifiedSubtotal: number;
  estimatedSubtotal: number;
  hasUnknownFares: boolean;
  unknownFareLegCount: number;
  knownFareLegCount: number;
  totalLegCount: number;
  isFullyPriced: boolean;
  walkingLegCount: number;
  estimates: {
    source: ValueSource;
    fareStatus: FareStatus;
    amount: number;
    note?: string;
    legDescription: string;
    mode: TransportMode;
  }[];
};

export type DurationSummaryResult = {
  knownTotalMinutes: number;
  walkingMinutes: number;
  vehicleMinutes: number;
  walkingDistanceKm: number;
  totalDistanceKm: number;
  hasUnknownDurations: boolean;
  unknownDurationLegCount: number;
  knownDurationLegCount: number;
  totalLegCount: number;
  isFullyTimed: boolean;
};
