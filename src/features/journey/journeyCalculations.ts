import type { JourneyLeg, CostSummaryResult, DurationSummaryResult } from "./journeyTypes";

/**
 * Calculates financial summaries safely without treating unknown fares as zero.
 * Walking legs explicitly cost ₹0.
 */
export function calculateRouteCostSummary(legs: JourneyLeg[]): CostSummaryResult {
  let knownSubtotal = 0;
  let unknownFareLegCount = 0;
  let knownFareLegCount = 0;
  let walkingLegCount = 0;
  const estimates: CostSummaryResult["estimates"] = [];

  for (const leg of legs) {
    if (leg.mode === "walking") {
      walkingLegCount++;
      if (leg.fare.value !== null) {
        knownSubtotal += leg.fare.value;
      }
      knownFareLegCount++;
      continue;
    }

    if (leg.fare.value === null) {
      unknownFareLegCount++;
    } else {
      knownSubtotal += leg.fare.value;
      knownFareLegCount++;
      if (leg.fare.source === "organiser" || leg.fare.source === "curated" || leg.fare.source === "external") {
        estimates.push({
          source: leg.fare.source,
          amount: leg.fare.value,
          note: leg.fare.note,
          legDescription: `${leg.from} → ${leg.to} (${leg.mode})`,
        });
      }
    }
  }

  const totalLegCount = legs.length;
  const isFullyPriced = totalLegCount > 0 && unknownFareLegCount === 0;

  return {
    knownSubtotal,
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
 * Aggregates known travel durations in minutes and breaks down walking vs vehicle time.
 */
export function calculateRouteDurationSummary(legs: JourneyLeg[]): DurationSummaryResult {
  let knownTotalMinutes = 0;
  let walkingMinutes = 0;
  let vehicleMinutes = 0;
  let unknownDurationLegCount = 0;
  let knownDurationLegCount = 0;

  for (const leg of legs) {
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
    hasUnknownDurations: unknownDurationLegCount > 0,
    unknownDurationLegCount,
    knownDurationLegCount,
    totalLegCount,
    isFullyTimed: totalLegCount > 0 && unknownDurationLegCount === 0,
  };
}
