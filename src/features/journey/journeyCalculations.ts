import type {
  JourneyLeg,
  CostSummaryResult,
  DurationSummaryResult,
  FareStatus,
} from "./journeyTypes";

/**
 * Calculates financial summaries safely without treating unknown fares as zero.
 * Distinguishes verified government tariffs, fixed stage fares, estimated ranges, and unknown fares.
 * Walking legs explicitly cost ₹0 verified.
 */
export function calculateRouteCostSummary(legs: JourneyLeg[]): CostSummaryResult {
  let knownSubtotal = 0;
  let verifiedSubtotal = 0;
  let estimatedSubtotal = 0;
  let unknownFareLegCount = 0;
  let knownFareLegCount = 0;
  let walkingLegCount = 0;
  const estimates: CostSummaryResult["estimates"] = [];

  for (const leg of legs) {
    if (leg.mode === "walking") {
      walkingLegCount++;
      const walkFare = leg.fare.value ?? 0;
      knownSubtotal += walkFare;
      verifiedSubtotal += walkFare;
      knownFareLegCount++;
      estimates.push({
        source: "curated",
        fareStatus: "verified_tariff",
        amount: 0,
        note: "Pedestrian link — Free",
        legDescription: `${leg.from || "Walk"} → ${leg.to || "Destination"}`,
        mode: "walking",
      });
      continue;
    }

    if (leg.fare.value === null) {
      unknownFareLegCount++;
    } else {
      const amount = leg.fare.value;
      knownSubtotal += amount;
      knownFareLegCount++;

      const fareStatus: FareStatus =
        leg.fare.fareStatus || (leg.fare.source === "user" ? "user_entered" : "estimated_fare");

      if (fareStatus === "verified_tariff" || fareStatus === "user_entered") {
        verifiedSubtotal += amount;
      } else {
        estimatedSubtotal += amount;
      }

      estimates.push({
        source: leg.fare.source,
        fareStatus,
        amount,
        note: leg.fare.note,
        legDescription: `${leg.from || "Origin"} → ${leg.to || "Destination"}`,
        mode: leg.mode,
      });
    }
  }

  const totalLegCount = legs.length;
  const isFullyPriced = totalLegCount > 0 && unknownFareLegCount === 0;

  return {
    knownSubtotal,
    verifiedSubtotal,
    estimatedSubtotal,
    hasUnknownFares: unknownFareLegCount > 0,
    unknownFareLegCount,
    knownFareLegCount,
    totalLegCount,
    isFullyPriced,
    walkingLegCount,
    estimates,
  };
}

/**
 * Aggregates known travel durations in minutes and breaks down walking vs vehicle time and distance.
 */
export function calculateRouteDurationSummary(legs: JourneyLeg[]): DurationSummaryResult {
  let knownTotalMinutes = 0;
  let walkingMinutes = 0;
  let vehicleMinutes = 0;
  let walkingDistanceKm = 0;
  let totalDistanceKm = 0;
  let unknownDurationLegCount = 0;
  let knownDurationLegCount = 0;

  for (const leg of legs) {
    if (leg.distanceKm) {
      totalDistanceKm += leg.distanceKm;
      if (leg.mode === "walking") {
        walkingDistanceKm += leg.distanceKm;
      }
    }

    if (leg.durationMinutes.value === null) {
      unknownDurationLegCount++;
    } else {
      const minutes = leg.durationMinutes.value;
      knownTotalMinutes += minutes;
      knownDurationLegCount++;
      if (leg.mode === "walking") {
        walkingMinutes += minutes;
      } else {
        vehicleMinutes += minutes;
      }
    }
  }

  const totalLegCount = legs.length;

  return {
    knownTotalMinutes,
    walkingMinutes,
    vehicleMinutes,
    walkingDistanceKm: Math.round(walkingDistanceKm * 10) / 10,
    totalDistanceKm: Math.round(totalDistanceKm * 10) / 10,
    hasUnknownDurations: unknownDurationLegCount > 0,
    unknownDurationLegCount,
    knownDurationLegCount,
    totalLegCount,
    isFullyTimed: totalLegCount > 0 && unknownDurationLegCount === 0,
  };
}
