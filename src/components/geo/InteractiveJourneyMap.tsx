import React, { useEffect, useRef } from "react";
import L from "leaflet";
import type { JourneyLeg, GeoLocation, TransportMode } from "../../features/journey/journeyTypes";
import { Maximize2 } from "lucide-react";

interface InteractiveJourneyMapProps {
  originLocation?: GeoLocation;
  destinationLocation?: GeoLocation;
  originLabel?: string;
  destinationLabel?: string;
  legs: JourneyLeg[];
  activeStepIndex?: number;
  onSelectLeg?: (index: number) => void;
  className?: string;
}

const MODE_COLORS: Record<TransportMode, string> = {
  train: "#4f46e5", // Indigo
  ksrtc_bus: "#ea580c", // Orange / KSRTC Fast
  private_bus: "#d97706", // Amber
  auto: "#16a34a", // Emerald Green
  taxi: "#2563eb", // Blue
  car: "#0284c7", // Sky blue
  walking: "#0d9488", // Teal
  ferry: "#9333ea", // Purple
  other: "#64748b", // Slate
};

export const InteractiveJourneyMap: React.FC<InteractiveJourneyMapProps> = ({
  originLocation,
  destinationLocation,
  legs,
  activeStepIndex,
  onSelectLeg,
  className = "h-[340px] md:h-[420px]",
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [10.8505, 76.2711], // Kerala center
        zoom: 8,
        zoomControl: false,
      });

      // Add zoom control in top right
      L.control.zoom({ position: "topright" }).addTo(map);

      // OpenStreetMap Standard Tiles with proper attribution
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | OSRM routing',
        maxZoom: 19,
      }).addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();
    const bounds = L.latLngBounds([]);

    // 1. Plot Origin Pin
    if (originLocation) {
      const originIcon = L.divIcon({
        className: "origin-marker",
        html: `<div style="background-color: #10b981; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2.5px solid #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.3); display: flex; items-center; justify-content: center;"><span style="transform: rotate(45deg); font-size: 13px; font-weight: 900; color: white;">A</span></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      const originMarker = L.marker([originLocation.lat, originLocation.lng], {
        icon: originIcon,
      }).addTo(layerGroup);

      originMarker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px;">
          <strong style="color: #059669; text-transform: uppercase; font-size: 10px;">Journey Origin</strong>
          <div style="font-weight: 700; color: #1e293b; margin-top: 2px;">${originLocation.name}</div>
          <div style="color: #64748b; font-size: 10px; margin-top: 2px;">${originLocation.displayName}</div>
        </div>
      `);

      bounds.extend([originLocation.lat, originLocation.lng]);
    }

    // 2. Plot Destination Pin
    if (destinationLocation) {
      const destIcon = L.divIcon({
        className: "dest-marker",
        html: `<div style="background-color: #f43f5e; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2.5px solid #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.3); display: flex; items-center; justify-content: center;"><span style="transform: rotate(45deg); font-size: 13px; font-weight: 900; color: white;">B</span></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      const destMarker = L.marker([destinationLocation.lat, destinationLocation.lng], {
        icon: destIcon,
      }).addTo(layerGroup);

      destMarker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px;">
          <strong style="color: #e11d48; text-transform: uppercase; font-size: 10px;">Final Destination</strong>
          <div style="font-weight: 700; color: #1e293b; margin-top: 2px;">${destinationLocation.name}</div>
          <div style="color: #64748b; font-size: 10px; margin-top: 2px;">${destinationLocation.displayName}</div>
        </div>
      `);

      bounds.extend([destinationLocation.lat, destinationLocation.lng]);
    }

    // 3. Plot Legs Geometry and Intermediate Stop Markers
    legs.forEach((leg, index) => {
      const isSelected = activeStepIndex === index;
      const legColor = MODE_COLORS[leg.mode] || "#0d9488";
      const isWalking = leg.mode === "walking";

      // Intermediate stop marker
      if (leg.fromLocation) {
        bounds.extend([leg.fromLocation.lat, leg.fromLocation.lng]);

        if (index > 0) {
          const stopIcon = L.divIcon({
            className: "transfer-stop-marker",
            html: `<div style="background-color: ${isSelected ? "#0f172a" : "#ffffff"}; color: ${isSelected ? "#ffffff" : "#0f172a"}; border: 2px solid ${legColor}; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; box-shadow: 0 2px 6px rgba(0,0,0,0.2);">${index + 1}</div>`,
            iconSize: [22, 22],
            iconAnchor: [11, 11],
          });

          const stopMarker = L.marker([leg.fromLocation.lat, leg.fromLocation.lng], {
            icon: stopIcon,
          }).addTo(layerGroup);

          stopMarker.bindPopup(`
            <div style="font-family: sans-serif; font-size: 12px;">
              <strong style="color: ${legColor}; text-transform: uppercase; font-size: 10px;">Transfer Stop ${index}</strong>
              <div style="font-weight: 700; color: #1e293b;">${leg.from}</div>
              <div style="font-size: 11px; color: #475569; margin-top: 4px;">Next: ${leg.mode.toUpperCase()}</div>
            </div>
          `);

          stopMarker.on("click", () => onSelectLeg?.(index));
        }
      }

      if (leg.toLocation) {
        bounds.extend([leg.toLocation.lat, leg.toLocation.lng]);
      }

      // Route Geometry Polyline
      if (leg.geometry && leg.geometry.coordinates.length > 0) {
        leg.geometry.coordinates.forEach((coord) => bounds.extend(coord));

        // Outer halo / glow for active step
        if (isSelected) {
          L.polyline(leg.geometry.coordinates, {
            color: "#0f172a",
            weight: 8,
            opacity: 0.5,
            lineCap: "round",
            lineJoin: "round",
          }).addTo(layerGroup);
        }

        const polyline = L.polyline(leg.geometry.coordinates, {
          color: legColor,
          weight: isSelected ? 5 : 4,
          opacity: isSelected ? 1.0 : 0.85,
          dashArray: isWalking ? "6, 8" : undefined,
          lineCap: "round",
          lineJoin: "round",
        }).addTo(layerGroup);

        polyline.on("click", () => {
          onSelectLeg?.(index);
        });

        polyline.bindTooltip(
          `Leg ${index + 1}: ${leg.mode.toUpperCase()} (${leg.distanceKm ? `${leg.distanceKm} km` : ""})`,
          { sticky: true }
        );
      } else if (leg.fromLocation && leg.toLocation) {
        // Direct fallback line if geometry not yet calculated
        const fallbackLine = [
          [leg.fromLocation.lat, leg.fromLocation.lng],
          [leg.toLocation.lat, leg.toLocation.lng],
        ] as [number, number][];

        L.polyline(fallbackLine, {
          color: legColor,
          weight: 3,
          opacity: 0.6,
          dashArray: "4, 6",
        }).addTo(layerGroup);
      }
    });

    // Auto fit bounds if coordinates exist
    if (bounds.isValid()) {
      map.fitBounds(bounds, {
        padding: [45, 45],
        maxZoom: 15,
        animate: true,
      });
    }
  }, [
    originLocation,
    destinationLocation,
    legs,
    activeStepIndex,
    onSelectLeg,
  ]);

  const handleFitJourney = () => {
    if (!mapInstanceRef.current) return;
    const bounds = L.latLngBounds([]);
    if (originLocation) bounds.extend([originLocation.lat, originLocation.lng]);
    if (destinationLocation) bounds.extend([destinationLocation.lat, destinationLocation.lng]);
    legs.forEach((l) => {
      if (l.fromLocation) bounds.extend([l.fromLocation.lat, l.fromLocation.lng]);
      if (l.toLocation) bounds.extend([l.toLocation.lat, l.toLocation.lng]);
      l.geometry?.coordinates.forEach((c) => bounds.extend(c));
    });
    if (bounds.isValid()) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  };

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border shadow-sm group transition-all duration-300 ${className}`}
      style={{
        backgroundColor: "var(--color-bg-elevated)",
        borderColor: "var(--color-border)",
      }}
    >
      <div ref={mapContainerRef} className="w-full h-full" style={{ zIndex: 1 }} />

      {/* Floating Map Controls & Legends */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-sm text-xs font-semibold">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span style={{ color: "var(--color-text)" }}>OpenStreetMap Live Route</span>
      </div>

      <button
        onClick={handleFitJourney}
        className="absolute bottom-3 right-3 z-10 bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-800 backdrop-blur-md p-2 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-md transition text-xs font-semibold flex items-center gap-1.5"
        style={{ color: "var(--color-text)" }}
        title="Fit whole journey in map view"
      >
        <Maximize2 className="w-3.5 h-3.5" style={{ color: "var(--color-accent)" }} />
        <span className="hidden sm:inline">Fit Route</span>
      </button>

      {/* Legend Badge Bar */}
      <div className="absolute bottom-3 left-3 z-10 hidden sm:flex items-center gap-2 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-800 shadow-xs text-[10px] font-semibold">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> KSRTC
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Auto
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" /> Train
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-600" /> Walk
        </span>
      </div>
    </div>
  );
};
