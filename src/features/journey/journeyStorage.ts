import type { Journey } from "./journeyTypes";

const STORAGE_KEY = "yathraflow_current_journey_v1";

export function saveJourneyToLocalStorage(journey: Journey): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(journey));
  } catch (err) {
    console.error("Failed to save journey to localStorage", err);
  }
}

export function loadJourneyFromLocalStorage(): Journey | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data) as Journey;
    }
  } catch (err) {
    console.error("Failed to load journey from localStorage", err);
  }
  return null;
}

export function encodeJourneyToUrl(journey: Journey): string {
  try {
    const jsonStr = JSON.stringify(journey);
    const encodedStr = encodeURIComponent(jsonStr);
    return btoa(encodedStr);
  } catch (err) {
    console.error("Failed to encode journey to URL", err);
    return "";
  }
}

export function decodeJourneyFromUrl(encoded: string): Journey | null {
  try {
    const decodedStr = atob(encoded);
    const jsonStr = decodeURIComponent(decodedStr);
    const journey = JSON.parse(jsonStr) as Journey;
    if (journey && journey.id && Array.isArray(journey.routes)) {
      return journey;
    }
  } catch (err) {
    console.error("Failed to decode journey from URL", err);
  }
  return null;
}

export function generateShareableUrl(journey: Journey, isEmbed: boolean = false): string {
  const baseUrl = `${window.location.origin}${window.location.pathname}`;
  const encodedData = encodeJourneyToUrl(journey);
  const paramKey = isEmbed ? "embedData" : "jdata";
  return `${baseUrl}?${paramKey}=${encodedData}`;
}
