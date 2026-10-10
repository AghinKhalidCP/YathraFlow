import React, { useState } from "react";
import type {
  JourneyLeg,
  TransportMode,
  FareStatus,
  GeoLocation,
} from "../../features/journey/journeyTypes";
import { LocationSelector } from "../geo/LocationSelector";
import { MapPickerDialog } from "../geo/MapPickerDialog";
import { fetchLegRouteGeometry } from "../../features/geo/routingService";
import { estimateLegFare } from "../../features/fare/fareCalculator";
import { buildGoogleMapsLegUrl } from "../../features/journey/journeyMapLinks";
import {
  Train,
  Bus,
  Car,
  Footprints,
  Ship,
  Compass,
  ArrowDown,
  ArrowUp,
  Trash2,
  Copy,
  IndianRupee,
  Clock,
  Info,
  Navigation,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Calculator,
} from "lucide-react";

interface LegEditorCardProps {
  leg: JourneyLeg;
  index: number;
  totalLegs: number;
  onUpdate: (updates: Partial<JourneyLeg>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

const MODES: {
  mode: TransportMode;
  label: string;
  icon: React.FC<{ className?: string }>;
  accentColor: string;
}[] = [
  { mode: "train", label: "Train", icon: Train, accentColor: "#4f46e5" },
  { mode: "ksrtc_bus", label: "KSRTC Bus", icon: Bus, accentColor: "#ea580c" },
  { mode: "private_bus", label: "Private Bus", icon: Bus, accentColor: "#d97706" },
  { mode: "auto", label: "Auto-Rickshaw", icon: Car, accentColor: "#16a34a" },
  { mode: "taxi", label: "Taxi / Cab", icon: Car, accentColor: "#2563eb" },
  { mode: "car", label: "Private Car", icon: Car, accentColor: "#0284c7" },
  { mode: "walking", label: "Walking", icon: Footprints, accentColor: "#0d9488" },
  { mode: "ferry", label: "Ferry / Boat", icon: Ship, accentColor: "#9333ea" },
  { mode: "other", label: "Other", icon: Compass, accentColor: "#64748b" },
];

const FARE_STATUS_OPTIONS: { value: FareStatus; label: string }[] = [
  { value: "estimated_fare", label: "Configured Route Estimate" },
  { value: "verified_tariff", label: "Verified Govt Tariff" },
  { value: "organiser_provided", label: "Organiser Fixed Rate" },
  { value: "user_entered", label: "Manual User Fare" },
  { value: "unknown", label: "Unknown / Variable" },
];

export const LegEditorCard: React.FC<LegEditorCardProps> = ({
  leg,
  index,
  totalLegs,
  onUpdate,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
}) => {
  const [showMapSettings, setShowMapSettings] = useState(false);
  const [mapPickerTarget, setMapPickerTarget] = useState<"from" | "to" | null>(null);

  const calculateRouteAndFare = async (
    fromLoc?: GeoLocation,
    toLoc?: GeoLocation,
    modeToUse: TransportMode = leg.mode
  ) => {
    const origin = fromLoc || leg.fromLocation;
    const dest = toLoc || leg.toLocation;

    if (!origin || !dest) return;

    try {
      const geometry = await fetchLegRouteGeometry(
        origin.lat,
        origin.lng,
        dest.lat,
        dest.lng,
        modeToUse
      );

      const fareResult = estimateLegFare(modeToUse, geometry.distanceKm);

      onUpdate({
        geometry,
        distanceKm: geometry.distanceKm,
        durationMinutes: {
          value: geometry.durationMinutes,
          source: "external",
          note: geometry.isStraightLineFallback ? "Direct estimate" : "OSRM road estimate",
        },
        fare: {
          value: fareResult.fare,
          source: fareResult.source,
          fareStatus: fareResult.fareStatus,
          note: fareResult.note,
          isCalculated: true,
        },
      });
    } catch (err) {
      console.error("Failed to calculate route geometry", err);
    }
  };

  const handleModeChange = (mode: TransportMode) => {
    onUpdate({ mode });
    if (leg.fromLocation && leg.toLocation) {
      calculateRouteAndFare(leg.fromLocation, leg.toLocation, mode);
    }
  };

  const handleFromSelect = (loc: GeoLocation) => {
    onUpdate({
      from: loc.name,
      fromLocation: loc,
      fromCoords: `${loc.lat.toFixed(6)}, ${loc.lng.toFixed(6)}`,
    });
    if (leg.toLocation) {
      calculateRouteAndFare(loc, leg.toLocation);
    }
  };

  const handleToSelect = (loc: GeoLocation) => {
    onUpdate({
      to: loc.name,
      toLocation: loc,
      toCoords: `${loc.lat.toFixed(6)}, ${loc.lng.toFixed(6)}`,
    });
    if (leg.fromLocation) {
      calculateRouteAndFare(leg.fromLocation, loc);
    }
  };

  const handleFareChange = (valStr: string) => {
    const val = valStr === "" ? null : parseFloat(valStr);
    onUpdate({
      fare: {
        ...leg.fare,
        value: isNaN(val as number) ? null : val,
        fareStatus: val === null ? "unknown" : "user_entered",
        source: "user",
        isCalculated: false,
      },
    });
  };

  const handleDurationChange = (valStr: string) => {
    const val = valStr === "" ? null : parseInt(valStr, 10);
    onUpdate({
      durationMinutes: {
        ...leg.durationMinutes,
        value: isNaN(val as number) ? null : val,
        source: "user",
      },
    });
  };

  const currentModeObj = MODES.find((m) => m.mode === leg.mode) || MODES[0];

  return (
    <div
      className="rounded-2xl border p-4 mb-3.5 relative transition-all duration-200 shadow-xs"
      style={{
        backgroundColor: "var(--color-bg-elevated)",
        borderColor: "var(--color-border)",
      }}
    >
      {/* Leg Header */}
      <div
        className="flex items-center justify-between border-b pb-3 mb-3.5"
        style={{ borderColor: "var(--color-border-subtle)" }}
      >
        <div className="flex items-center space-x-2.5">
          <span
            className="w-6 h-6 rounded-lg text-white font-extrabold text-xs flex items-center justify-center font-display shadow-xs"
            style={{ backgroundColor: currentModeObj.accentColor }}
          >
            {index + 1}
          </span>
          <span
            className="text-xs font-bold font-display uppercase tracking-wider"
            style={{ color: "var(--color-text)" }}
          >
            Leg #{index + 1} • {currentModeObj.label}
          </span>

          {leg.distanceKm && (
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full font-mono tabular-nums"
              style={{
                backgroundColor: "var(--color-accent-subtle)",
                color: "var(--color-accent)",
              }}
            >
              {leg.distanceKm} km
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={onDuplicate}
            className="p-1 rounded-lg transition-colors hover:bg-slate-500/10 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            title="Duplicate this leg"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled={index === 0}
            onClick={onMoveUp}
            className="p-1 rounded-lg transition-colors hover:bg-slate-500/10 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-30"
            title="Move leg up"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled={index === totalLegs - 1}
            onClick={onMoveDown}
            className="p-1 rounded-lg transition-colors hover:bg-slate-500/10 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-30"
            title="Move leg down"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors ml-1"
            title="Delete leg"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Mode Selector Pill Buttons */}
      <div className="mb-3.5">
        <label
          className="block text-[11px] font-semibold uppercase tracking-wider mb-2"
          style={{ color: "var(--color-text-muted)" }}
        >
          Vehicle / Mode on this Leg
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
          {MODES.map((item) => {
            const Icon = item.icon;
            const isSelected = leg.mode === item.mode;
            return (
              <button
                key={item.mode}
                type="button"
                onClick={() => handleModeChange(item.mode)}
                className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border text-xs font-semibold transition-all duration-150 ${
                  isSelected ? "shadow-sm scale-[1.02]" : "opacity-80 hover:opacity-100"
                }`}
                style={{
                  backgroundColor: isSelected ? item.accentColor : "var(--color-bg-subtle)",
                  borderColor: isSelected ? item.accentColor : "var(--color-border)",
                  color: isSelected ? "#ffffff" : "var(--color-text)",
                }}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="text-[11px] truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Real Location Pickers for Leg Start & End */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-3.5">
        <LocationSelector
          label="Boarding / Origin Stop"
          value={leg.from}
          selectedLocation={leg.fromLocation}
          placeholder="e.g. Kozhikode Railway Station"
          pinColor="emerald"
          onSelect={handleFromSelect}
          onOpenMapPicker={() => setMapPickerTarget("from")}
        />

        <LocationSelector
          label="Alighting / Transfer Stop"
          value={leg.to}
          selectedLocation={leg.toLocation}
          placeholder="e.g. Chest Hospital Bus Stop"
          pinColor="rose"
          onSelect={handleToSelect}
          onOpenMapPicker={() => setMapPickerTarget("to")}
        />
      </div>

      {/* Transparent Fare & Duration Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3.5">
        <div
          className="p-3 rounded-xl border space-y-1.5"
          style={{
            backgroundColor: "var(--color-bg-subtle)",
            borderColor: "var(--color-border)",
          }}
        >
          <div className="flex items-center justify-between">
            <label
              className="text-xs font-semibold flex items-center gap-1"
              style={{ color: "var(--color-text)" }}
            >
              <IndianRupee className="w-3.5 h-3.5 text-emerald-500" />
              <span>Fare (₹ INR)</span>
            </label>

            <select
              value={leg.fare.fareStatus || "unknown"}
              onChange={(e) =>
                onUpdate({
                  fare: {
                    ...leg.fare,
                    fareStatus: e.target.value as FareStatus,
                    source: e.target.value === "user_entered" ? "user" : "curated",
                  },
                })
              }
              className="text-[10px] rounded-lg px-2 py-0.5 border outline-none font-medium"
              style={{
                backgroundColor: "var(--color-bg-elevated)",
                borderColor: "var(--color-border)",
                color: "var(--color-text-secondary)",
              }}
            >
              {FARE_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <input
              type="number"
              value={leg.fare.value === null ? "" : leg.fare.value}
              onChange={(e) => handleFareChange(e.target.value)}
              placeholder={leg.mode === "walking" ? "0 (Free walking)" : "Leave blank if unknown"}
              className="w-full px-3 py-1.5 rounded-lg border text-xs font-bold outline-none tabular-nums"
              style={{
                backgroundColor: "var(--color-bg-elevated)",
                borderColor: "var(--color-border)",
                color: "var(--color-text)",
              }}
            />
            {leg.fare.isCalculated && (
              <span
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold flex items-center gap-1"
                style={{ color: "var(--color-accent)" }}
                title="Calculated from real road distance & official Kerala tariff"
              >
                <Calculator className="w-3 h-3" />
                <span>Auto-tariff</span>
              </span>
            )}
          </div>

          {leg.fare.note && (
            <p className="text-[10px] leading-tight" style={{ color: "var(--color-text-muted)" }}>
              {leg.fare.note}
            </p>
          )}
        </div>

        <div
          className="p-3 rounded-xl border space-y-1.5"
          style={{
            backgroundColor: "var(--color-bg-subtle)",
            borderColor: "var(--color-border)",
          }}
        >
          <div className="flex items-center justify-between">
            <label
              className="text-xs font-semibold flex items-center gap-1"
              style={{ color: "var(--color-text)" }}
            >
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              <span>Duration (Minutes)</span>
            </label>

            <span className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>
              {leg.distanceKm ? `~${leg.distanceKm} km` : "Enter time"}
            </span>
          </div>

          <input
            type="number"
            value={leg.durationMinutes.value === null ? "" : leg.durationMinutes.value}
            onChange={(e) => handleDurationChange(e.target.value)}
            placeholder="Leave blank if unknown"
            className="w-full px-3 py-1.5 rounded-lg border text-xs font-bold outline-none tabular-nums"
            style={{
              backgroundColor: "var(--color-bg-elevated)",
              borderColor: "var(--color-border)",
              color: "var(--color-text)",
            }}
          />

          <p className="text-[10px] leading-tight" style={{ color: "var(--color-text-muted)" }}>
            {leg.durationMinutes.source === "external"
              ? "Calculated from OSRM road geometry"
              : "Estimated transfer & transit duration"}
          </p>
        </div>
      </div>

      {/* Boarding Instructions & Transfer Callouts */}
      <div className="mb-2">
        <label
          className="block text-xs font-medium mb-1 flex items-center gap-1"
          style={{ color: "var(--color-text-secondary)" }}
        >
          <Info className="w-3.5 h-3.5" style={{ color: "var(--color-accent)" }} />
          <span>Boarding & Transfer Instructions</span>
        </label>
        <input
          type="text"
          value={leg.instructions || ""}
          onChange={(e) => onUpdate({ instructions: e.target.value })}
          placeholder="e.g. Board bus towards Mukkam. Ask conductor for Chest Hospital stop."
          className="w-full px-3 py-1.5 rounded-xl border text-xs outline-none"
          style={{
            backgroundColor: "var(--color-bg-subtle)",
            borderColor: "var(--color-border)",
            color: "var(--color-text)",
          }}
        />
      </div>

      {/* Expandable Deep-Link & Waypoint Details */}
      <div className="pt-2 border-t" style={{ borderColor: "var(--color-border-subtle)" }}>
        <button
          type="button"
          onClick={() => setShowMapSettings((prev) => !prev)}
          className="flex items-center justify-between w-full text-[11px] font-semibold transition-colors py-0.5"
          style={{ color: "var(--color-text-secondary)" }}
        >
          <span className="flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5" style={{ color: "var(--color-accent)" }} />
            <span>Map Coordinates & Verified Deep-links</span>
            {leg.geometry && (
              <span
                className="text-[9px] px-1.5 py-0.2 rounded-full font-bold"
                style={{
                  backgroundColor: "var(--color-accent-subtle)",
                  color: "var(--color-accent)",
                }}
              >
                OSRM Geo Ready
              </span>
            )}
          </span>
          {showMapSettings ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showMapSettings && (
          <div
            className="mt-2.5 p-3 rounded-xl border space-y-2.5 text-xs animate-in fade-in duration-150"
            style={{
              backgroundColor: "var(--color-bg-subtle)",
              borderColor: "var(--color-border)",
            }}
          >
            <div>
              <label
                className="block text-[11px] font-medium mb-1"
                style={{ color: "var(--color-text-muted)" }}
              >
                Custom Map / Transit URL Override (Optional)
              </label>
              <input
                type="text"
                value={leg.customMapUrl || ""}
                onChange={(e) => onUpdate({ customMapUrl: e.target.value })}
                placeholder="e.g. https://maps.app.goo.gl/... or custom schedule link"
                className="w-full px-2.5 py-1 rounded-lg border text-xs font-mono outline-none"
                style={{
                  backgroundColor: "var(--color-bg-elevated)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)",
                }}
              />
            </div>

            <div className="flex items-center justify-between pt-1 text-[11px]">
              <span style={{ color: "var(--color-text-muted)" }}>Directions verify:</span>
              <a
                href={buildGoogleMapsLegUrl(leg.from, leg.to, leg.mode, "Kerala", {
                  customMapUrl: leg.customMapUrl,
                  fromCoords: leg.fromCoords,
                  toCoords: leg.toCoords,
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold hover:underline"
                style={{ color: "var(--color-accent)" }}
              >
                <Navigation className="w-3 h-3" />
                <span>Open in Google Maps</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Map Picker Modal for leg start/end */}
      <MapPickerDialog
        isOpen={mapPickerTarget !== null}
        title={mapPickerTarget === "from" ? `Select Stop ${index + 1} Origin on Map` : `Select Stop ${index + 1} Destination on Map`}
        initialLocation={mapPickerTarget === "from" ? leg.fromLocation : leg.toLocation}
        onConfirm={(loc) => {
          if (mapPickerTarget === "from") {
            handleFromSelect(loc);
          } else {
            handleToSelect(loc);
          }
        }}
        onClose={() => setMapPickerTarget(null)}
      />
    </div>
  );
};
