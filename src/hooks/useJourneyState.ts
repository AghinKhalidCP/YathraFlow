import { useState, useEffect } from "react";
import type { Journey, JourneyLeg, GeoLocation, JourneyRoute } from "../features/journey/journeyTypes";
import {
  saveJourneyToLocalStorage,
  loadJourneyFromLocalStorage,
  decodeJourneyFromUrl,
} from "../features/journey/journeyStorage";
import {
  addLegToRoute,
  updateLegInRoute,
  duplicateLegInRoute,
  deleteLegFromRoute,
  moveLegInRoute,
  addRouteToJourney,
  deleteRouteFromJourney,
  updateRouteDetails,
  updateJourneyHeader,
  createEmptyRoute,
  createEmptyLeg,
} from "../features/journey/journeyOperations";

function createEmptyJourney(originLoc?: GeoLocation, destLoc?: GeoLocation): Journey {
  const firstLeg: JourneyLeg = {
    ...createEmptyLeg(),
    from: originLoc?.name || "",
    fromLocation: originLoc,
    fromCoords: originLoc ? `${originLoc.lat.toFixed(6)}, ${originLoc.lng.toFixed(6)}` : undefined,
    to: destLoc?.name || "",
    toLocation: destLoc,
    toCoords: destLoc ? `${destLoc.lat.toFixed(6)}, ${destLoc.lng.toFixed(6)}` : undefined,
  };

  const route = {
    ...createEmptyRoute("Recommended Route"),
    legs: [firstLeg],
  };

  return {
    id: `journey-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: originLoc && destLoc ? `${originLoc.name} to ${destLoc.name}` : "",
    region: "Kerala",
    originLabel: originLoc?.name || "",
    destinationLabel: destLoc?.name || "",
    originLocation: originLoc,
    destinationLocation: destLoc,
    routes: [route],
    activeRouteId: route.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function useJourneyState() {
  const [journey, setJourney] = useState<Journey | null>(() => {
    const params = new URLSearchParams(window.location.search);
    const jdata = params.get("jdata") || params.get("embedData");
    if (jdata) {
      const urlJourney = decodeJourneyFromUrl(jdata);
      if (urlJourney) return urlJourney;
    }

    const saved = loadJourneyFromLocalStorage();
    if (saved) return saved;

    // Start empty — strictly zero state
    return null;
  });

  const isEmbed = Boolean(new URLSearchParams(window.location.search).get("embedData"));

  useEffect(() => {
    if (!isEmbed && journey) {
      saveJourneyToLocalStorage(journey);
    }
  }, [journey, isEmbed]);

  const activeRoute = journey
    ? journey.routes.find((r) => r.id === journey.activeRouteId) || journey.routes[0]
    : null;

  const handleCreateNewJourney = (originLoc?: GeoLocation, destLoc?: GeoLocation) => {
    const newJourney = createEmptyJourney(originLoc, destLoc);
    setJourney(newJourney);
  };

  const handleLoadDemo = (demoJourney: Journey) => {
    setJourney(demoJourney);
  };

  const handleClearJourney = () => {
    localStorage.removeItem("yathraflow_current_journey_v1");
    setJourney(null);
  };

  const handleSelectRoute = (routeId: string) => {
    if (!journey) return;
    setJourney((prev) => (prev ? { ...prev, activeRouteId: routeId } : prev));
  };

  const handleAddLeg = () => {
    if (!journey || !activeRoute) return;
    setJourney((prev) => (prev ? addLegToRoute(prev, activeRoute.id) : prev));
  };

  const handleUpdateLeg = (legId: string, updates: Partial<JourneyLeg>) => {
    if (!journey || !activeRoute) return;
    setJourney((prev) => (prev ? updateLegInRoute(prev, activeRoute.id, legId, updates) : prev));
  };

  const handleDuplicateLeg = (legId: string) => {
    if (!journey || !activeRoute) return;
    setJourney((prev) => (prev ? duplicateLegInRoute(prev, activeRoute.id, legId) : prev));
  };

  const handleDeleteLeg = (legId: string) => {
    if (!journey || !activeRoute) return;
    setJourney((prev) => (prev ? deleteLegFromRoute(prev, activeRoute.id, legId) : prev));
  };

  const handleMoveLeg = (legId: string, direction: "up" | "down") => {
    if (!journey || !activeRoute) return;
    setJourney((prev) => (prev ? moveLegInRoute(prev, activeRoute.id, legId, direction) : prev));
  };

  const handleAddRoute = () => {
    if (!journey) return;
    setJourney((prev) => (prev ? addRouteToJourney(prev) : prev));
  };

  const handleDeleteRoute = (routeId: string) => {
    if (!journey) return;
    setJourney((prev) => (prev ? deleteRouteFromJourney(prev, routeId) : prev));
  };

  const handleUpdateRoute = (routeId: string, updates: { name?: string; description?: string }) => {
    if (!journey) return;
    setJourney((prev) => (prev ? updateRouteDetails(prev, routeId, updates) : prev));
  };

  const handleUpdateHeader = (updates: {
    title?: string;
    originLabel?: string;
    destinationLabel?: string;
    originLocation?: GeoLocation;
    destinationLocation?: GeoLocation;
  }) => {
    if (!journey) return;
    setJourney((prev) => (prev ? updateJourneyHeader(prev, updates) : prev));
  };

  const handleLoadGeneratedJourney = (
    routes: JourneyRoute[],
    originLoc: GeoLocation,
    destLoc: GeoLocation,
    title?: string
  ) => {
    const newJourney: Journey = {
      id: `journey-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: title || `${originLoc.name} to ${destLoc.name}`,
      region: "Kerala",
      originLabel: originLoc.name,
      destinationLabel: destLoc.name,
      originLocation: originLoc,
      destinationLocation: destLoc,
      routes: routes.length > 0 ? routes : [createEmptyRoute()],
      activeRouteId: routes[0]?.id || "route-default",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setJourney(newJourney);
  };

  return {
    journey,
    activeRoute,
    isEmbed,
    handleSelectRoute,
    handleAddLeg,
    handleUpdateLeg,
    handleDuplicateLeg,
    handleDeleteLeg,
    handleMoveLeg,
    handleAddRoute,
    handleDeleteRoute,
    handleUpdateRoute,
    handleUpdateHeader,
    handleCreateNewJourney,
    handleLoadGeneratedJourney,
    handleLoadDemo,
    handleClearJourney,
  };
};
