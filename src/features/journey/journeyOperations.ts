import type { Journey, JourneyLeg, JourneyRoute } from "./journeyTypes";

export function createEmptyLeg(): JourneyLeg {
  return {
    id: `leg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    mode: "bus",
    from: "",
    to: "",
    fare: {
      value: null,
      source: "unknown",
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

export function createEmptyRoute(name: string = "New Alternative Route"): JourneyRoute {
  return {
    id: `route-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name,
    description: "",
    legs: [createEmptyLeg()],
  };
}

export function addLegToRoute(journey: Journey, routeId: string, newLeg?: JourneyLeg): Journey {
  const legToAdd = newLeg || createEmptyLeg();
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
      return {
        ...route,
        legs: route.legs.map((leg) => {
          if (leg.id !== legId) return leg;
          const updatedLeg = { ...leg, ...updates };

          if (updates.mode === "walking" && leg.mode !== "walking" && leg.fare.value === null) {
            updatedLeg.fare = {
              ...updatedLeg.fare,
              value: 0,
              source: "curated",
              note: "Walking leg",
            };
          }

          return updatedLeg;
        }),
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
  updates: { title?: string; originLabel?: string; destinationLabel?: string }
): Journey {
  return {
    ...journey,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
}
