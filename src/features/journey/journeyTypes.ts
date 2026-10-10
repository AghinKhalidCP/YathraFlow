export type TransportMode =
  | "train"
  | "bus"
  | "auto"
  | "taxi"
  | "walking"
  | "other";

export type ValueSource =
  | "organiser"
  | "user"
  | "curated"
  | "external"
  | "unknown";

export type EstimatedValue = {
  value: number | null;
  source: ValueSource;
  note?: string;
};

export type JourneyLeg = {
  id: string;
  mode: TransportMode;
  from: string;
  to: string;
  fare: EstimatedValue;
  durationMinutes: EstimatedValue;
  instructions?: string;
  customMapUrl?: string;
  fromCoords?: string;
  toCoords?: string;
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
  routes: JourneyRoute[];
  activeRouteId: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CostSummaryResult = {
  knownSubtotal: number;
  hasUnknownFares: boolean;
  unknownFareLegCount: number;
  knownFareLegCount: number;
  totalLegCount: number;
  isFullyPriced: boolean;
  walkingLegCount: number;
  estimates: {
    source: ValueSource;
    amount: number;
    note?: string;
    legDescription: string;
  }[];
};

export type DurationSummaryResult = {
  knownTotalMinutes: number;
  walkingMinutes: number;
  vehicleMinutes: number;
  hasUnknownDurations: boolean;
  unknownDurationLegCount: number;
  knownDurationLegCount: number;
  totalLegCount: number;
  isFullyTimed: boolean;
};
