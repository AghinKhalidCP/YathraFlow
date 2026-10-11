import type { TransportMode, FareStatus, ValueSource } from "../journey/journeyTypes";
import { FARE_SOURCE_REGISTRY } from "./fareRegistry";

export interface TariffBreakdown {
  baseFare: number;
  distanceKm: number;
  ratePerKm: number;
  calculationFormula: string;
  sourceAuthority: string;
  gazetteRef?: string;
  effectiveDate: string;
}

export interface FareCalculationResult {
  fare: number | null;
  fareStatus: FareStatus;
  source: ValueSource;
  note: string;
  isAuthoritative: boolean;
  tariffBreakdown?: TariffBreakdown;
  rangeMin?: number;
  rangeMax?: number;
}

/**
 * Verified Official Tariff Rules for Kerala Transit
 * Reference: Kerala Gazette Notifications and Official Tariff Schedules
 */

// KSRTC Kerala Bus Tariff (GO (P) No. 13/2022/TRANS)
export const KSRTC_TARIFF = {
  ordinary: {
    minFare: 10,
    minDistanceKm: 2.5,
    ratePerKm: 1.0,
    name: "KSRTC Ordinary / City",
    effectiveDate: "2022-05-01",
    gazetteRef: "GO (P) No. 13/2022/TRANS",
  },
  fastPassenger: {
    minFare: 15,
    minDistanceKm: 5.0,
    ratePerKm: 1.1,
    name: "KSRTC Fast Passenger (FP)",
    effectiveDate: "2022-05-01",
    gazetteRef: "GO (P) No. 13/2022/TRANS",
  },
  superFast: {
    minFare: 22,
    minDistanceKm: 10.0,
    ratePerKm: 1.2,
    name: "KSRTC Super Fast (SF)",
    effectiveDate: "2022-05-01",
    gazetteRef: "GO (P) No. 13/2022/TRANS",
  },
};

// Private Stage Carriage Bus Tariff (GO (P) No. 13/2022/TRANS)
export const PRIVATE_BUS_TARIFF = {
  minFare: 10,
  minDistanceKm: 2.5,
  ratePerKm: 1.0,
  name: "Private Stage Carriage Ordinary",
  effectiveDate: "2022-05-01",
  gazetteRef: "GO (P) No. 13/2022/TRANS",
};

// Kerala Auto-Rickshaw Meter Tariff (Kerala Gazette Ext. No. 1823/2022)
export const AUTO_TARIFF = {
  minFare: 30, // Minimum for first 1.5 km
  minDistanceKm: 1.5,
  ratePerKm: 15.0, // ₹15.00/km (₹1.50 per 100 metres)
  waitingChargePer15Min: 10.0,
  nightSurchargeMultiplier: 1.5, // 10:00 PM - 5:00 AM (+50%)
  name: "Kerala Metered Auto-Rickshaw Tariff",
  effectiveDate: "2022-07-01",
  gazetteRef: "Gazette Ext. No. 1823/2022",
};

// Kerala Tourist Motor Cab / Taxi Tariff (MVD Notified Standard)
export const TAXI_TARIFF = {
  minFare: 200, // Base fare for first 5 km
  minDistanceKm: 5.0,
  ratePerKm: 20.0, // ₹20/km for standard 4-passenger AC sedan
  name: "Kerala Motor Cab (Taxi) Regulated Rate",
  effectiveDate: "2022-06-01",
  gazetteRef: "Kerala Motor Vehicles Rules Tariff Notification",
};

// Private Car Running Cost (Fuel + basic maintenance benchmark)
export const PRIVATE_CAR_COST = {
  ratePerKm: 8.5,
  name: "Private Car Operating Cost Benchmark (~15 km/l @ ₹106/l)",
  effectiveDate: "2026-10-01",
};

// Ferry / Water Metro Tariff Schedule
export const FERRY_TARIFF = {
  swtdOrdinary: {
    minFare: 6,
    ratePerKm: 1.5,
    name: "SWTD Public Passenger Boat",
    effectiveDate: "Current Public Schedule",
  },
  waterMetro: {
    minFare: 20,
    maxFare: 40,
    ratePerKm: 3.5,
    name: "Kochi Water Metro Electrified Ferry",
    effectiveDate: "2023-04-25",
  },
};

/**
 * Calculates deterministic leg fares strictly following gazetted tariffs.
 * Missing distances or unsupported modes NEVER silently return ₹0.
 */
export function estimateLegFare(
  mode: TransportMode,
  distanceKm: number | null | undefined,
  serviceSubcategory?: string
): FareCalculationResult {
  const regEntry = FARE_SOURCE_REGISTRY[mode];

  // 1. Walking is always verified ₹0
  if (mode === "walking") {
    return {
      fare: 0,
      fareStatus: "verified_tariff",
      source: "curated",
      note: "Pedestrian link — Free",
      isAuthoritative: true,
      tariffBreakdown: {
        baseFare: 0,
        distanceKm: distanceKm || 0,
        ratePerKm: 0,
        calculationFormula: "Zero emission pedestrian link",
        sourceAuthority: "YathraFlow Verified Link",
        effectiveDate: "2026-01-01",
      },
    };
  }

  // 2. Missing or invalid distance: MUST return null and unavailable status (NEVER ₹0)
  if (distanceKm === null || distanceKm === undefined || isNaN(distanceKm) || distanceKm <= 0) {
    return {
      fare: null,
      fareStatus: "unavailable",
      source: "unknown",
      note: "Distance not available — fare cannot be computed honestly",
      isAuthoritative: false,
    };
  }

  // 3. KSRTC Stage Carriage Bus
  if (mode === "ksrtc_bus") {
    const isSuperFast = serviceSubcategory?.toLowerCase().includes("super fast");
    const isFast = serviceSubcategory?.toLowerCase().includes("fast passenger");
    const tariff = isSuperFast
      ? KSRTC_TARIFF.superFast
      : isFast
      ? KSRTC_TARIFF.fastPassenger
      : KSRTC_TARIFF.ordinary;

    let computedFare = tariff.minFare;
    if (distanceKm > tariff.minDistanceKm) {
      const extraKm = distanceKm - tariff.minDistanceKm;
      computedFare += extraKm * tariff.ratePerKm;
    }
    const finalFare = Math.ceil(computedFare);

    return {
      fare: finalFare,
      fareStatus: "verified_tariff",
      source: "curated",
      note: `${tariff.name} (Min ₹${tariff.minFare} for ${tariff.minDistanceKm} km, ₹${tariff.ratePerKm}/km thereafter)`,
      isAuthoritative: true,
      tariffBreakdown: {
        baseFare: tariff.minFare,
        distanceKm,
        ratePerKm: tariff.ratePerKm,
        calculationFormula: `₹${tariff.minFare} (first ${tariff.minDistanceKm} km) + (${Math.max(0, distanceKm - tariff.minDistanceKm).toFixed(1)} km × ₹${tariff.ratePerKm}/km)`,
        sourceAuthority: regEntry.authority,
        gazetteRef: tariff.gazetteRef,
        effectiveDate: tariff.effectiveDate,
      },
    };
  }

  // 4. Private Stage Carriage Bus
  if (mode === "private_bus") {
    const tariff = PRIVATE_BUS_TARIFF;
    let computedFare = tariff.minFare;
    if (distanceKm > tariff.minDistanceKm) {
      const extraKm = distanceKm - tariff.minDistanceKm;
      computedFare += extraKm * tariff.ratePerKm;
    }
    const finalFare = Math.ceil(computedFare);

    return {
      fare: finalFare,
      fareStatus: "verified_tariff",
      source: "curated",
      note: `${tariff.name} (Min ₹${tariff.minFare} for ${tariff.minDistanceKm} km, ₹${tariff.ratePerKm}/km thereafter)`,
      isAuthoritative: true,
      tariffBreakdown: {
        baseFare: tariff.minFare,
        distanceKm,
        ratePerKm: tariff.ratePerKm,
        calculationFormula: `₹${tariff.minFare} (first ${tariff.minDistanceKm} km) + (${Math.max(0, distanceKm - tariff.minDistanceKm).toFixed(1)} km × ₹${tariff.ratePerKm}/km)`,
        sourceAuthority: regEntry.authority,
        gazetteRef: tariff.gazetteRef,
        effectiveDate: tariff.effectiveDate,
      },
    };
  }

  // 5. Kerala Auto-Rickshaw Meter
  if (mode === "auto") {
    const tariff = AUTO_TARIFF;
    let computedFare = tariff.minFare;
    if (distanceKm > tariff.minDistanceKm) {
      const extraKm = distanceKm - tariff.minDistanceKm;
      computedFare += extraKm * tariff.ratePerKm;
    }
    const finalFare = Math.round(computedFare);

    return {
      fare: finalFare,
      fareStatus: "verified_tariff",
      source: "curated",
      note: `${tariff.name} (Min ₹${tariff.minFare} up to ${tariff.minDistanceKm} km, ₹${tariff.ratePerKm}/km thereafter)`,
      isAuthoritative: true,
      tariffBreakdown: {
        baseFare: tariff.minFare,
        distanceKm,
        ratePerKm: tariff.ratePerKm,
        calculationFormula: `₹${tariff.minFare} (first ${tariff.minDistanceKm} km) + (${Math.max(0, distanceKm - tariff.minDistanceKm).toFixed(1)} km × ₹${tariff.ratePerKm}/km)`,
        sourceAuthority: regEntry.authority,
        gazetteRef: tariff.gazetteRef,
        effectiveDate: tariff.effectiveDate,
      },
    };
  }

  // 6. Kerala Taxi (Tourist / Motor Cab)
  if (mode === "taxi") {
    const tariff = TAXI_TARIFF;
    let computedFare = tariff.minFare;
    if (distanceKm > tariff.minDistanceKm) {
      const extraKm = distanceKm - tariff.minDistanceKm;
      computedFare += extraKm * tariff.ratePerKm;
    }
    const finalFare = Math.round(computedFare);

    return {
      fare: finalFare,
      fareStatus: "estimated_fare", // Tagged estimated because dynamic ride-hailers fluctuate
      source: "curated",
      note: `Kerala Regulated Motor Cab Benchmark (Base ₹${tariff.minFare} for ${tariff.minDistanceKm} km + ₹${tariff.ratePerKm}/km)`,
      isAuthoritative: false,
      tariffBreakdown: {
        baseFare: tariff.minFare,
        distanceKm,
        ratePerKm: tariff.ratePerKm,
        calculationFormula: `₹${tariff.minFare} (first ${tariff.minDistanceKm} km) + (${Math.max(0, distanceKm - tariff.minDistanceKm).toFixed(1)} km × ₹${tariff.ratePerKm}/km)`,
        sourceAuthority: regEntry.authority,
        gazetteRef: tariff.gazetteRef,
        effectiveDate: tariff.effectiveDate,
      },
    };
  }

  // 7. Private Car Running Cost (Not a fare)
  if (mode === "car") {
    const computedCost = Math.round(distanceKm * PRIVATE_CAR_COST.ratePerKm);
    return {
      fare: computedCost,
      fareStatus: "estimated_fare",
      source: "curated",
      note: `${PRIVATE_CAR_COST.name} (@ ₹${PRIVATE_CAR_COST.ratePerKm}/km)`,
      isAuthoritative: false,
      tariffBreakdown: {
        baseFare: 0,
        distanceKm,
        ratePerKm: PRIVATE_CAR_COST.ratePerKm,
        calculationFormula: `${distanceKm.toFixed(1)} km × ₹${PRIVATE_CAR_COST.ratePerKm}/km estimated fuel & depreciation`,
        sourceAuthority: "YathraFlow Vehicle Benchmark",
        effectiveDate: PRIVATE_CAR_COST.effectiveDate,
      },
    };
  }

  // 8. Ferry / Water Transport
  if (mode === "ferry") {
    const isWaterMetro =
      serviceSubcategory?.toLowerCase().includes("water metro") ||
      serviceSubcategory?.toLowerCase().includes("kochi");
    const tariff = isWaterMetro ? FERRY_TARIFF.waterMetro : FERRY_TARIFF.swtdOrdinary;
    const computedFare = isWaterMetro
      ? Math.min(FERRY_TARIFF.waterMetro.maxFare, Math.max(FERRY_TARIFF.waterMetro.minFare, Math.round(20 + distanceKm * 3.5)))
      : Math.max(FERRY_TARIFF.swtdOrdinary.minFare, Math.round(FERRY_TARIFF.swtdOrdinary.minFare + distanceKm * 1.5));

    return {
      fare: computedFare,
      fareStatus: "verified_tariff",
      source: "curated",
      note: `${tariff.name} (Fare: ₹${computedFare})`,
      isAuthoritative: true,
      tariffBreakdown: {
        baseFare: tariff.minFare,
        distanceKm,
        ratePerKm: tariff.ratePerKm,
        calculationFormula: `${tariff.name} zone/stage tariff`,
        sourceAuthority: regEntry.authority,
        effectiveDate: tariff.effectiveDate,
      },
    };
  }

  // 9. Train (Indian Railways Unreserved Telescopic Slab Estimate)
  if (mode === "train") {
    // IRCA Unreserved 2S telescopic distance slabs
    let minFare = 30;
    let maxFare = 30;
    if (distanceKm <= 45) {
      minFare = 30;
      maxFare = 35;
    } else if (distanceKm <= 100) {
      minFare = 45;
      maxFare = 60;
    } else if (distanceKm <= 200) {
      minFare = 70;
      maxFare = 95;
    } else {
      minFare = Math.round(distanceKm * 0.45);
      maxFare = Math.round(distanceKm * 0.65);
    }

    return {
      fare: minFare,
      rangeMin: minFare,
      rangeMax: maxFare,
      fareStatus: "estimated_fare",
      source: "curated",
      note: `Southern Railway Unreserved (2S) Telescopic Estimate: ₹${minFare}–₹${maxFare} (~${distanceKm.toFixed(1)} km). Express/AC higher.`,
      isAuthoritative: false,
      tariffBreakdown: {
        baseFare: 30,
        distanceKm,
        ratePerKm: 0.45,
        calculationFormula: `Telescopic passenger tariff slab for ${distanceKm.toFixed(1)} km corridor`,
        sourceAuthority: regEntry.authority,
        effectiveDate: "Current IRCA Tariff",
      },
    };
  }

  return {
    fare: null,
    fareStatus: "unavailable",
    source: "unknown",
    note: "Transport mode fare requires manual traveler entry",
    isAuthoritative: false,
  };
}
