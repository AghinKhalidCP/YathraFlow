import type { Journey, JourneyLeg, JourneyRoute, GeoLocation } from "./journeyTypes";
import { estimateLegFare } from "../fare/fareCalculator";

export function createEmptyLeg(): JourneyLeg {
  return {
    id: `leg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    mode: "ksrtc_bus",
    from: "",
    to: "",
    fare: {
      value: null,
      source: "unknown",
      fareStatus: "unknown",
      note: "",
    },
    durationMinutes: {
      value: null,
      source: "unknown",
      note: "",
    },
    instructions: "",
  };
}

export function createEmptyRoute(name: string = "Route A"): JourneyRoute {
  return {
    id: `route-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name,
    description: "",
    legs: [createEmptyLeg()],
  };
}

export function addLegToRoute(journey: Journey, routeId: string, newLeg?: JourneyLeg): Journey {
  const targetRoute = journey.routes.find((r) => r.id === routeId);
  const lastLeg = targetRoute && targetRoute.legs.length > 0 ? targetRoute.legs[targetRoute.legs.length - 1] : null;

  // Seamless chain: default new leg's 'from' to previous leg's 'to' location
  const legToAdd: JourneyLeg = newLeg || {
    ...createEmptyLeg(),
    from: lastLeg?.to || "",
    fromLocation: lastLeg?.toLocation,
    fromCoords: lastLeg?.toCoords,
  };

  return {
    ...journey,
    routes: journey.routes.map((route) => {
      if (route.id !== routeId) return route;
      return {
        ...route,
        legs: [...route.legs, legToAdd],
      };
    }),
    updatedAt: new Date().toISOString(),
  };
}

export function updateLegInRoute(
  journey: Journey,
  routeId: string,
  legId: string,
  updates: Partial<JourneyLeg>
): Journey {
  return {
    ...journey,
    routes: journey.routes.map((route) => {
      if (route.id !== routeId) return route;

      const legIndex = route.legs.findIndex((l) => l.id === legId);
      if (legIndex === -1) return route;

      const currentLeg = route.legs[legIndex];
      const updatedLeg: JourneyLeg = { ...currentLeg, ...updates };

      // Recalculate auto fare when mode or distance changes if not manually set by user
      const modeChanged = updates.mode && updates.mode !== currentLeg.mode;
      const distanceChanged = updates.distanceKm !== undefined && updates.distanceKm !== currentLeg.distanceKm;

      if ((modeChanged || distanceChanged) && updatedLeg.fare.source !== "user") {
        const fareResult = estimateLegFare(updatedLeg.mode, updatedLeg.distanceKm);
        updatedLeg.fare = {
          value: fareResult.fare,
          source: fareResult.source,
          fareStatus: fareResult.fareStatus,
          note: fareResult.note,
          isCalculated: true,
        };
      }

      if (updates.mode === "walking" && currentLeg.mode !== "walking") {
        updatedLeg.fare = {
          value: 0,
          source: "curated",
          fareStatus: "verified_tariff",
          note: "Walking leg — Free",
          isCalculated: true,
        };
      }

      // Logical connectivity check:
      // If `to` of this leg changes, update the starting point of the immediate next leg if it was matching
      const newLegs = [...route.legs];
      newLegs[legIndex] = updatedLeg;

      if (updates.toLocation && legIndex < newLegs.length - 1) {
        const nextLeg = newLegs[legIndex + 1];
        // If next leg was empty or previously matching, chain the new stop
        if (!nextLeg.from || nextLeg.from === currentLeg.to) {
          newLegs[legIndex + 1] = {
            ...nextLeg,
            from: updates.to || updates.toLocation.name,
            fromLocation: updates.toLocation,
            fromCoords: `${updates.toLocation.lat.toFixed(6)}, ${updates.toLocation.lng.toFixed(6)}`,
            // Clear invalid geometry for next leg so it re-routes
            geometry: undefined,
            distanceKm: null,
          };
        }
      }

      return {
        ...route,
        legs: newLegs,
      };
    }),
    updatedAt: new Date().toISOString(),
  };
}

export function duplicateLegInRoute(
  journey: Journey,
  routeId: string,
  legId: string
): Journey {
  return {
    ...journey,
    routes: journey.routes.map((route) => {
      if (route.id !== routeId) return route;
      const index = route.legs.findIndex((l) => l.id === legId);
      if (index === -1) return route;

      const legToDup = route.legs[index];
      const duplicated: JourneyLeg = {
        ...legToDup,
        id: `leg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      };

      const newLegs = [...route.legs];
      newLegs.splice(index + 1, 0, duplicated);

      return {
        ...route,
        legs: newLegs,
      };
    }),
    updatedAt: new Date().toISOString(),
  };
}

export function deleteLegFromRoute(journey: Journey, routeId: string, legId: string): Journey {
  return {
    ...journey,
    routes: journey.routes.map((route) => {
      if (route.id !== routeId) return route;
      return {
        ...route,
        legs: route.legs.filter((leg) => leg.id !== legId),
      };
    }),
    updatedAt: new Date().toISOString(),
  };
}

export function moveLegInRoute(
  journey: Journey,
  routeId: string,
  legId: string,
  direction: "up" | "down"
): Journey {
  return {
    ...journey,
    routes: journey.routes.map((route) => {
      if (route.id !== routeId) return route;
      const index = route.legs.findIndex((l) => l.id === legId);
      if (index === -1) return route;

      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= route.legs.length) return route;

      const newLegs = [...route.legs];
      const [movedLeg] = newLegs.splice(index, 1);
      newLegs.splice(targetIndex, 0, movedLeg);

      return {
        ...route,
        legs: newLegs,
      };
    }),
    updatedAt: new Date().toISOString(),
  };
}

export function addRouteToJourney(journey: Journey, routeName?: string): Journey {
  const newRoute = createEmptyRoute(routeName || `Route ${String.fromCharCode(65 + journey.routes.length)}`);
  return {
    ...journey,
    routes: [...journey.routes, newRoute],
    activeRouteId: newRoute.id,
    updatedAt: new Date().toISOString(),
  };
}

export function deleteRouteFromJourney(journey: Journey, routeId: string): Journey {
  if (journey.routes.length <= 1) return journey;
  const remainingRoutes = journey.routes.filter((r) => r.id !== routeId);
  const newActiveId = journey.activeRouteId === routeId ? remainingRoutes[0].id : journey.activeRouteId;

  return {
    ...journey,
    routes: remainingRoutes,
    activeRouteId: newActiveId,
    updatedAt: new Date().toISOString(),
  };
}

export function updateRouteDetails(
  journey: Journey,
  routeId: string,
  updates: { name?: string; description?: string }
): Journey {
  return {
    ...journey,
    routes: journey.routes.map((route) => {
      if (route.id !== routeId) return route;
      return { ...route, ...updates };
    }),
    updatedAt: new Date().toISOString(),
  };
}

export function updateJourneyHeader(
  journey: Journey,
  updates: {
    title?: string;
    originLabel?: string;
    destinationLabel?: string;
    originLocation?: GeoLocation;
    destinationLocation?: GeoLocation;
  }
): Journey {
  return {
    ...journey,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
}
