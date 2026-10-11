import type { TransportMode } from "../journey/journeyTypes";

/**
 * Authoritative registry of all transit fare sources, tariffs, and automated access rules.
 * Strictly researched from official Government of Kerala and Indian Railways portals.
 */
export interface FareSourceRegistryEntry {
  mode: TransportMode;
  providerName: string;
  authority: string;
  sourceUrl: string;
  retrievalMethod: "published_gazette_tariff" | "published_schedule" | "manual_online_enquiry" | "market_benchmark";
  effectiveDate: string;
  lastVerifiedDate: string;
  isAuthoritative: boolean;
  automatedAccessPermitted: boolean;
  geographicApplicability: string;
  gazetteNotificationRef?: string;
  baseFareRulesSummary: string;
  limitations: string[];
}

export const FARE_SOURCE_REGISTRY: Record<TransportMode, FareSourceRegistryEntry> = {
  ksrtc_bus: {
    mode: "ksrtc_bus",
    providerName: "Kerala State Road Transport Corporation (KSRTC)",
    authority: "Transport Department, Government of Kerala",
    sourceUrl: "https://onlineksrtcswift.com/",
    retrievalMethod: "published_gazette_tariff",
    effectiveDate: "2022-05-01",
    lastVerifiedDate: "2026-10-11",
    isAuthoritative: true,
    automatedAccessPermitted: false,
    geographicApplicability: "State of Kerala & Interstate Corridors",
    gazetteNotificationRef: "GO (P) No. 13/2022/TRANS dated 30/04/2022",
    baseFareRulesSummary:
      "Ordinary/City: Min ₹10 (first 2.5 km) + ₹1.00/km; Fast Passenger: Min ₹15 (5.0 km) + ₹1.10/km; Super Fast: Min ₹22 (10 km) + ₹1.20/km.",
    limitations: [
      "Online booking portal requires dynamic session and OTP; automated scraping prohibited by ToS.",
      "Interstate routes and seasonal festival special services include additional cess and toll levies.",
      "Luggage charges apply for cargo exceeding standard passenger limits.",
    ],
  },
  private_bus: {
    mode: "private_bus",
    providerName: "Kerala Private Stage Carriage Operators",
    authority: "Motor Vehicles Department (MVD), Government of Kerala",
    sourceUrl: "https://mvd.kerala.gov.in/",
    retrievalMethod: "published_gazette_tariff",
    effectiveDate: "2022-05-01",
    lastVerifiedDate: "2026-10-11",
    isAuthoritative: true,
    automatedAccessPermitted: false,
    geographicApplicability: "District & Regional routes across Kerala",
    gazetteNotificationRef: "GO (P) No. 13/2022/TRANS",
    baseFareRulesSummary:
      "Stage carriage ordinary rate matches state notified bus tariff: Min ₹10 (first 2.5 km) + ₹1.00 per km.",
    limitations: [
      "Private bus routes are managed through individual RTO permits without a unified public digital timetable API.",
      "Student concession fares (minimum ₹1.50) are excluded from standard adult calculations.",
    ],
  },
  auto: {
    mode: "auto",
    providerName: "Kerala Metered Auto-Rickshaw Operators",
    authority: "Motor Vehicles Department (MVD), Government of Kerala",
    sourceUrl: "https://mvd.kerala.gov.in/",
    retrievalMethod: "published_gazette_tariff",
    effectiveDate: "2022-07-01",
    lastVerifiedDate: "2026-10-11",
    isAuthoritative: true,
    automatedAccessPermitted: false,
    geographicApplicability: "All Municipalities, Corporations and Panchayats in Kerala",
    gazetteNotificationRef: "Kerala Gazette Extraordinary No. 1823/2022",
    baseFareRulesSummary:
      "Minimum fare ₹30 for first 1.5 km; ₹15 per additional km (₹1.50 per 100 metres). Waiting charge: ₹10 per 15 min. Night charge: +50% from 10:00 PM to 5:00 AM.",
    limitations: [
      "Rural or unmetered stands may quote negotiated flat fares rather than exact meter readings.",
      "Prepaid counters at railway stations/airports include an administrative counter fee of ₹2 to ₹5.",
    ],
  },
  train: {
    mode: "train",
    providerName: "Southern Railway / Indian Railways",
    authority: "Ministry of Railways, Government of India",
    sourceUrl: "https://www.indianrail.gov.in/enquiry/FARE/FareEnquiry.html",
    retrievalMethod: "manual_online_enquiry",
    effectiveDate: "Current IRCA Tariff",
    lastVerifiedDate: "2026-10-11",
    isAuthoritative: false, // Tariff tables exist, but dynamic quotas & live fares require manual inquiry
    automatedAccessPermitted: false,
    geographicApplicability: "Southern Railway Network (Kerala - TVC / PGT / SA Divisions)",
    baseFareRulesSummary:
      "Distance slab telescopic formula. Unreserved Second Class (2S): Min ₹30 (1-45 km), approx ₹30-₹85 for sub-200 km Kerala corridor. Vande Bharat/AC Chair Car carry dynamic supplements.",
    limitations: [
      "Official indianrail portal employs CAPTCHA; no open free API is available without commercial CRIS authorization.",
      "Tatkal, dynamic surge, and special train surcharges cannot be deterministically computed without PNR query.",
      "Estimates represent Unreserved Second Class (2S) standard passenger fare.",
    ],
  },
  taxi: {
    mode: "taxi",
    providerName: "Kerala Metered & Tourist Taxis",
    authority: "Motor Vehicles Department (MVD), Government of Kerala",
    sourceUrl: "https://mvd.kerala.gov.in/",
    retrievalMethod: "published_gazette_tariff",
    effectiveDate: "2022-06-01",
    lastVerifiedDate: "2026-10-11",
    isAuthoritative: true,
    automatedAccessPermitted: false,
    geographicApplicability: "Statewide Kerala Tourist & Local Motor Cabs",
    gazetteNotificationRef: "Kerala Motor Vehicles (Amendment) Rules Tariff Notification",
    baseFareRulesSummary:
      "Base ₹200 for first 5 km; ₹20/km thereafter for 4-seater AC sedan / hatchback. Round-trip and driver batta apply on outstation travel.",
    limitations: [
      "Private ride-hailing apps (Uber/Ola) use proprietary dynamic surge pricing not bound to standard RTO rate.",
      "Ghat roads (Wayanad, Idukki, Munnar) often have local taxi driver union fixed minimum charts.",
    ],
  },
  car: {
    mode: "car",
    providerName: "Private Vehicle Fuel & Operating Cost Benchmark",
    authority: "Benchmark standard based on Kerala fuel prices",
    sourceUrl: "https://mvd.kerala.gov.in/",
    retrievalMethod: "market_benchmark",
    effectiveDate: "2026-10-01",
    lastVerifiedDate: "2026-10-11",
    isAuthoritative: false,
    automatedAccessPermitted: true,
    geographicApplicability: "Kerala Road Network",
    baseFareRulesSummary:
      "Calculates pure operating fuel and running depreciation cost at ₹8.50 per km (based on ~15 km/l petrol @ ₹106/l). Not a passenger fare.",
    limitations: [
      "Excludes NHAI toll plazas (Paliyekkara, etc.).",
      "Actual vehicle mileage varies significantly by terrain (plains vs ghat roads).",
    ],
  },
  ferry: {
    mode: "ferry",
    providerName: "State Water Transport Dept (SWTD) & Kochi Water Metro",
    authority: "Kerala State Water Transport & KMRL",
    sourceUrl: "https://swtd.kerala.gov.in/",
    retrievalMethod: "published_schedule",
    effectiveDate: "2023-04-25",
    lastVerifiedDate: "2026-10-11",
    isAuthoritative: true,
    automatedAccessPermitted: false,
    geographicApplicability: "Kochi Backwaters, Alappuzha, Kottayam, Kollam Canals",
    baseFareRulesSummary:
      "SWTD Public Boat: Flat ₹6 to ₹18 based on station stage. Kochi Water Metro: Min ₹20 (1st zone), ₹30-₹40 across outer network.",
    limitations: [
      "Boat services subject to weather, seasonal flood advisories, and water hyacinth congestion.",
      "Water Metro only operates on notified electrified routes in Kochi mainland/island corridor.",
    ],
  },
  walking: {
    mode: "walking",
    providerName: "Pedestrian Transit",
    authority: "Zero Emission Pedestrian Link",
    sourceUrl: "https://yathraflow.app",
    retrievalMethod: "published_schedule",
    effectiveDate: "2026-01-01",
    lastVerifiedDate: "2026-10-11",
    isAuthoritative: true,
    automatedAccessPermitted: true,
    geographicApplicability: "All Pedestrian Walkways & Transfers",
    baseFareRulesSummary: "Always verified ₹0 free transfer.",
    limitations: [],
  },
  other: {
    mode: "other",
    providerName: "Special / Unspecified Transit",
    authority: "Local Transit Operators",
    sourceUrl: "https://yathraflow.app",
    retrievalMethod: "market_benchmark",
    effectiveDate: "2026-01-01",
    lastVerifiedDate: "2026-10-11",
    isAuthoritative: false,
    automatedAccessPermitted: false,
    geographicApplicability: "Unspecified",
    baseFareRulesSummary: "Unknown; requires manual entry by traveler.",
    limitations: ["No authoritative tariff available."],
  },
};
