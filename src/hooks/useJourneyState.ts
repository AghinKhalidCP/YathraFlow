import { useState, useEffect } from "react";
import type { Journey, JourneyLeg } from "../features/journey/journeyTypes";
import { SAMPLE_VENUE_JOURNEY, SAMPLE_KOCHI_JOURNEY } from "../data/sampleJourneys";
import {
  saveJourneyToLocalStorage,
  loadJourneyFromLocalStorage,
  decodeJourneyFromUrl,
} from "../features/journey/journeyStorage";
import {
  addLegToRoute,
  updateLegInRoute,
  deleteLegFromRoute,
  moveLegInRoute,
  addRouteToJourney,
  deleteRouteFromJourney,
  updateRouteDetails,
  updateJourneyHeader,
} from "../features/journey/journeyOperations";

export function useJourneyState() {
  const [journey, setJourney] = useState<Journey>(() => {
    const params = new URLSearchParams(window.location.search);
    const jdata = params.get("jdata") || params.get("embedData");
    if (jdata) {
      const urlJourney = decodeJourneyFromUrl(jdata);
      if (urlJourney) return urlJourney;
    }

    const saved = loadJourneyFromLocalStorage();
    if (saved) return saved;

    return SAMPLE_VENUE_JOURNEY;
  });

  const isEmbed = Boolean(new URLSearchParams(window.location.search).get("embedData"));

  useEffect(() => {
    if (!isEmbed) {
      saveJourneyToLocalStorage(journey);
    }
  }, [journey, isEmbed]);

  const activeRoute =
    journey.routes.find((r) => r.id === journey.activeRouteId) || journey.routes[0];

  const handleSelectRoute = (routeId: string) => {
    setJourney((prev) => ({ ...prev, activeRouteId: routeId }));
  };

  const handleAddLeg = () => {
    if (!activeRoute) return;
    setJourney((prev) => addLegToRoute(prev, activeRoute.id));
  };

  const handleUpdateLeg = (legId: string, updates: Partial<JourneyLeg>) => {
    if (!activeRoute) return;
    setJourney((prev) => updateLegInRoute(prev, activeRoute.id, legId, updates));
  };

  const handleDeleteLeg = (legId: string) => {
    if (!activeRoute) return;
    setJourney((prev) => deleteLegFromRoute(prev, activeRoute.id, legId));
  };

  const handleMoveLeg = (legId: string, direction: "up" | "down") => {
    if (!activeRoute) return;
    setJourney((prev) => moveLegInRoute(prev, activeRoute.id, legId, direction));
  };

  const handleAddRoute = () => {
    setJourney((prev) => addRouteToJourney(prev));
  };

  const handleDeleteRoute = (routeId: string) => {
    setJourney((prev) => deleteRouteFromJourney(prev, routeId));
  };

  const handleUpdateRoute = (routeId: string, updates: { name?: string; description?: string }) => {
    setJourney((prev) => updateRouteDetails(prev, routeId, updates));
  };

  const handleUpdateHeader = (updates: { title?: string; originLabel?: string; destinationLabel?: string }) => {
    setJourney((prev) => updateJourneyHeader(prev, updates));
  };

  const handleResetVenueDemo = () => {
    setJourney(SAMPLE_VENUE_JOURNEY);
  };

  const handleLoadKochiDemo = () => {
    setJourney(SAMPLE_KOCHI_JOURNEY);
  };

  return {
    journey,
    activeRoute,
    isEmbed,
    handleSelectRoute,
    handleAddLeg,
    handleUpdateLeg,
    handleDeleteLeg,
    handleMoveLeg,
    handleAddRoute,
    handleDeleteRoute,
    handleUpdateRoute,
    handleUpdateHeader,
    handleResetVenueDemo,
    handleLoadKochiDemo,
  };
}
