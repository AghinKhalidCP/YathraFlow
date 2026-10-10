import type { TransportMode, FareStatus, ValueSource } from "../journey/journeyTypes";

export interface FareCalculationResult {
  fare: number | null;
  fareStatus: FareStatus;
  source: ValueSource;
  note: string;
  tariffBreakdown?: {
    baseFare: number;
    distanceKm: number;
    ratePerKm: number;
    calculationFormula: string;
  };
}

/**
 * Transparent fare calculation engine for Kerala transit modes.
 * Fares use actual route distance when available.
 */

// KSRTC Kerala Bus Tariff (Based on Kerala Motor Vehicles Department notified fares)
export const KSRTC_TARIFF = {
  ordinary: {
    minFare: 10,
    minDistanceKm: 2.5,
    ratePerKm: 1.0,
    name: "KSRTC Ordinary / City",
  },
  fastPassenger: {
    minFare: 15,
    minDistanceKm: 5.0,
    ratePerKm: 1.1,
    name: "KSRTC Fast Passenger (FP)",
  },
  superFast: {
    minFare: 22,
    minDistanceKm: 10.0,
    ratePerKm: 1.25,
    name: "KSRTC Super Fast",
  },
};

// Private Bus Tariff (Kerala MVD notified private stage carriage fares)
export const PRIVATE_BUS_TARIFF = {
  minFare: 10,
  minDistanceKm: 2.5,
  ratePerKm: 1.0,
  name: "Private Stage Carriage",
};

// Kerala Auto-Rickshaw Government Tariff (Kerala MVD notified rates)
export const AUTO_TARIFF = {
  minFare: 30, // Minimum charge for up to 1.5 km
  minDistanceKm: 1.5,
  ratePerKm: 15.0, // ₹15/km after 1.5km
  waitingChargePerMin: 0.5,
  nightSurchargeMultiplier: 1.5, // 10 PM - 5 AM
};

// Taxi / Cab Pricing Model (Uber/Ola/Local taxi standard Kerala sedan/hatchback)
export const TAXI_TARIFF = {
  minFare: 120, // Base fare including first 3 km
  minDistanceKm: 3.0,
  ratePerKm: 22.0, // ₹22/km
  name: "Taxi / Cab Ride",
};

// Private Car Operating Cost Model (Petrol/Diesel + depreciation ~ ₹8.5/km)
export const PRIVATE_CAR_COST = {
  ratePerKm: 8.5,
  name: "Private Car Fuel & Running Cost",
};

// Ferry / Water Metro Tariff (SWTD Passenger Boats & Kochi Water Metro)
export const FERRY_TARIFF = {
  swtdOrdinary: { minFare: 6, ratePerKm: 1.5, name: "SWTD Public Ferry" },
  waterMetro: { minFare: 20, ratePerKm: 4.0, name: "Kochi Water Metro" },
};

/**
 * Calculates fare estimates based on actual route distance and selected transport mode.
 */
export function estimateLegFare(
  mode: TransportMode,
  distanceKm: number | null | undefined,
  serviceSubcategory?: string
): FareCalculationResult {
  // 1. Walking is always ₹0 verified
  if (mode === "walking") {
    return {
      fare: 0,
      fareStatus: "verified_tariff",
      source: "curated",
      note: "Walking leg — Free",
    };
  }

  // If distance is missing, we cannot calculate an honest fare
  if (distanceKm === null || distanceKm === undefined || isNaN(distanceKm) || distanceKm <= 0) {
    return {
      fare: null,
      fareStatus: "unknown",
      source: "unknown",
      note: "Distance not available — fare unknown",
    };
  }

  // 2. KSRTC Bus Tariff Calculation
  if (mode === "ksrtc_bus") {
    const tariff = KSRTC_TARIFF.ordinary;
    let fare = tariff.minFare;
    if (distanceKm > tariff.minDistanceKm) {
      const extraKm = distanceKm - tariff.minDistanceKm;
      fare += Math.ceil(extraKm * tariff.ratePerKm);
    }
    // Round to nearest integer (KSRTC rounds off)
    fare = Math.ceil(fare);

    return {
      fare,
      fareStatus: "estimated_fare",
      source: "curated",
      note: `KSRTC Ordinary Tariff (Min ₹${tariff.minFare} up to ${tariff.minDistanceKm}km + ₹${tariff.ratePerKm}/km)`,
      tariffBreakdown: {
        baseFare: tariff.minFare,
        distanceKm,
        ratePerKm: tariff.ratePerKm,
        calculationFormula: `₹${tariff.minFare} base + (${Math.max(0, distanceKm - tariff.minDistanceKm).toFixed(1)} km × ₹${tariff.ratePerKm}/km)`,
      },
    };
  }

  // 3. Private Bus Tariff Calculation
  if (mode === "private_bus") {
    const tariff = PRIVATE_BUS_TARIFF;
    let fare = tariff.minFare;
    if (distanceKm > tariff.minDistanceKm) {
      const extraKm = distanceKm - tariff.minDistanceKm;
      fare += Math.ceil(extraKm * tariff.ratePerKm);
    }
    fare = Math.ceil(fare);

    return {
      fare,
      fareStatus: "estimated_fare",
      source: "curated",
      note: `Private Bus Tariff (Min ₹${tariff.minFare} up to ${tariff.minDistanceKm}km + ₹${tariff.ratePerKm}/km)`,
      tariffBreakdown: {
        baseFare: tariff.minFare,
        distanceKm,
        ratePerKm: tariff.ratePerKm,
        calculationFormula: `₹${tariff.minFare} base + (${Math.max(0, distanceKm - tariff.minDistanceKm).toFixed(1)} km × ₹${tariff.ratePerKm}/km)`,
      },
    };
  }

  // 4. Kerala Auto-Rickshaw Government Meter Tariff
  if (mode === "auto") {
    const tariff = AUTO_TARIFF;
    let fare = tariff.minFare;
    if (distanceKm > tariff.minDistanceKm) {
      const extraKm = distanceKm - tariff.minDistanceKm;
      fare += extraKm * tariff.ratePerKm;
    }
    // Round to whole rupee
    fare = Math.round(fare);

    return {
      fare,
      fareStatus: "estimated_fare",
      source: "curated",
      note: `Kerala Auto Meter Rate (Min ₹${tariff.minFare} up to ${tariff.minDistanceKm}km + ₹${tariff.ratePerKm}/km)`,
      tariffBreakdown: {
        baseFare: tariff.minFare,
        distanceKm,
        ratePerKm: tariff.ratePerKm,
        calculationFormula: `₹${tariff.minFare} base + (${Math.max(0, distanceKm - tariff.minDistanceKm).toFixed(1)} km × ₹${tariff.ratePerKm})`,
      },
    };
  }

  // 5. Taxi / Cab Pricing Model
  if (mode === "taxi") {
    const tariff = TAXI_TARIFF;
    let fare = tariff.minFare;
    if (distanceKm > tariff.minDistanceKm) {
      const extraKm = distanceKm - tariff.minDistanceKm;
      fare += extraKm * tariff.ratePerKm;
    }
    fare = Math.round(fare);

    return {
      fare,
      fareStatus: "estimated_fare",
      source: "curated",
      note: `Taxi Estimate (Base ₹${tariff.minFare} up to ${tariff.minDistanceKm}km + ₹${tariff.ratePerKm}/km)`,
      tariffBreakdown: {
        baseFare: tariff.minFare,
        distanceKm,
        ratePerKm: tariff.ratePerKm,
        calculationFormula: `₹${tariff.minFare} base + (${Math.max(0, distanceKm - tariff.minDistanceKm).toFixed(1)} km × ₹${tariff.ratePerKm})`,
      },
    };
  }

  // 6. Private Car Running Cost (Not a taxi fare)
  if (mode === "car") {
    const cost = Math.round(distanceKm * PRIVATE_CAR_COST.ratePerKm);
    return {
      fare: cost,
      fareStatus: "estimated_fare",
      source: "curated",
      note: `Private Vehicle Operating Cost (@ ₹${PRIVATE_CAR_COST.ratePerKm}/km fuel & maintenance)`,
      tariffBreakdown: {
        baseFare: 0,
        distanceKm,
        ratePerKm: PRIVATE_CAR_COST.ratePerKm,
        calculationFormula: `${distanceKm.toFixed(1)} km × ₹${PRIVATE_CAR_COST.ratePerKm}/km operating cost`,
      },
    };
  }

  // 7. Ferry / Water Transport
  if (mode === "ferry") {
    const isWaterMetro = serviceSubcategory?.toLowerCase().includes("water metro");
    const tariff = isWaterMetro ? FERRY_TARIFF.waterMetro : FERRY_TARIFF.swtdOrdinary;
    const fare = Math.max(tariff.minFare, Math.round(tariff.minFare + distanceKm * tariff.ratePerKm));
    return {
      fare,
      fareStatus: "estimated_fare",
      source: "curated",
      note: `${tariff.name} (Min ₹${tariff.minFare})`,
    };
  }

  // 8. Train (Indian Railways unreserved / local / metro)
  if (mode === "train") {
    // Unreserved suburban/express minimum starts at ₹30 for short distance, Metro ₹20-60
    let fare = 30;
    if (distanceKm > 50) fare = 50;
    if (distanceKm > 100) fare = 80;
    return {
      fare,
      fareStatus: "estimated_fare",
      source: "curated",
      note: `Indian Railways Unreserved 2S / Local Fare Estimate (~${distanceKm.toFixed(1)} km)`,
    };
  }

  return {
    fare: null,
    fareStatus: "unknown",
    source: "unknown",
    note: "Transport mode fare requires manual entry",
  };
}
