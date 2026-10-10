import React, { useState } from "react";
import type { JourneyLeg, TransportMode, ValueSource } from "../../features/journey/journeyTypes";
import { buildGoogleMapsSearchUrl, buildGoogleMapsLegUrl } from "../../features/journey/journeyMapLinks";
import {
  Train,
  Bus,
  Car,
  Footprints,
  Compass,
  ArrowDown,
  ArrowUp,
  Trash2,
  IndianRupee,
  Clock,
  Info,
  MapPin,
  Navigation,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface LegEditorCardProps {
  leg: JourneyLeg;
  index: number;
  totalLegs: number;
  onUpdate: (updates: Partial<JourneyLeg>) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

const MODES: { mode: TransportMode; label: string; icon: React.FC<{ className?: string }> }[] = [
  { mode: "train", label: "Train", icon: Train },
  { mode: "bus", label: "Bus", icon: Bus },
  { mode: "auto", label: "Auto-Rickshaw", icon: Car },
  { mode: "taxi", label: "Taxi / Car", icon: Car },
  { mode: "walking", label: "Walking", icon: Footprints },
  { mode: "other", label: "Ferry / Other", icon: Compass },
];

const SOURCES: { value: ValueSource; label: string }[] = [
  { value: "unknown", label: "Unknown / Unpriced" },
  { value: "organiser", label: "Organiser Estimate" },
  { value: "user", label: "User Entered" },
  { value: "curated", label: "Verified Data" },
];

export const LegEditorCard: React.FC<LegEditorCardProps> = ({
  leg,
  index,
  totalLegs,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
}) => {
  const [showMapSettings, setShowMapSettings] = useState(false);

  const handleModeChange = (mode: TransportMode) => {
    onUpdate({ mode });
  };

  const handleFareChange = (valStr: string) => {
    const val = valStr === "" ? null : parseFloat(valStr);
    onUpdate({
      fare: {
        ...leg.fare,
        value: isNaN(val as number) ? null : val,
        source: leg.fare.source === "unknown" && val !== null ? "user" : leg.fare.source,
      },
    });
  };

  const handleDurationChange = (valStr: string) => {
    const val = valStr === "" ? null : parseInt(valStr, 10);
    onUpdate({
      durationMinutes: {
        ...leg.durationMinutes,
        value: isNaN(val as number) ? null : val,
      },
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-4 mb-3 relative transition hover:border-slate-300/80">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
        <div className="flex items-center space-x-2">
          <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center font-display">
            {index + 1}
          </span>
          <span className="text-xs font-bold font-display text-slate-800 uppercase tracking-wide">
            Transport Leg #{index + 1}
          </span>
        </div>

        <div className="flex items-center space-x-1">
          <button
            disabled={index === 0}
            onClick={onMoveUp}
            className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:text-slate-400"
            title="Move leg up"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <button
            disabled={index === totalLegs - 1}
            onClick={onMoveDown}
            className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:text-slate-400"
            title="Move leg down"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 rounded text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition ml-1"
            title="Delete leg"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-xs font-semibold text-slate-500 mb-1.5">
          Transport Vehicle / Mode (Selection on every leg)
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
          {MODES.map((item) => {
            const Icon = item.icon;
            const isSelected = leg.mode === item.mode;
            return (
              <button
                key={item.mode}
                type="button"
                onClick={() => handleModeChange(item.mode)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs transition ${
                  isSelected
                    ? "bg-amber-500 text-slate-950 border-amber-500 font-bold shadow-sm"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 font-medium"
                }`}
              >
                <Icon className="w-4 h-4 mb-1" />
                <span className="text-[11px] truncate w-full text-center">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-slate-500">
              Boarding / Start Point
            </label>
            {leg.from && (
              <a
                href={buildGoogleMapsSearchUrl(leg.fromCoords || leg.from, "Kerala")}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-emerald-600 hover:text-emerald-800 flex items-center gap-0.5 font-medium"
                title="Test boarding location in Google Maps"
              >
                <MapPin className="w-2.5 h-2.5" />
                <span>Test Pin</span>
              </a>
            )}
          </div>
          <input
            type="text"
            value={leg.from}
            onChange={(e) => onUpdate({ from: e.target.value })}
            placeholder="e.g. Kozhikode Railway Station"
            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-slate-500">
              Alighting / Transfer Point
            </label>
            {leg.to && (
              <a
                href={buildGoogleMapsSearchUrl(leg.toCoords || leg.to, "Kerala")}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-emerald-600 hover:text-emerald-800 flex items-center gap-0.5 font-medium"
                title="Test alighting location in Google Maps"
              >
                <MapPin className="w-2.5 h-2.5" />
                <span>Test Pin</span>
              </a>
            )}
          </div>
          <input
            type="text"
            value={leg.to}
            onChange={(e) => onUpdate({ to: e.target.value })}
            placeholder="e.g. Chest Hospital Bus Stop"
            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
              <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
              <span>Fare (₹ INR)</span>
            </label>
            <select
              value={leg.fare.source}
              onChange={(e) =>
                onUpdate({
                  fare: { ...leg.fare, source: e.target.value as ValueSource },
                })
              }
              className="text-[11px] bg-white border border-slate-300 rounded px-1.5 py-0.5 text-slate-700 focus:outline-none"
            >
              {SOURCES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <input
            type="number"
            value={leg.fare.value === null ? "" : leg.fare.value}
            onChange={(e) => handleFareChange(e.target.value)}
            placeholder={leg.mode === "walking" ? "0 (Free walking)" : "Leave blank if unknown"}
            className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>Duration (Minutes)</span>
            </label>
            <select
              value={leg.durationMinutes.source}
              onChange={(e) =>
                onUpdate({
                  durationMinutes: {
                    ...leg.durationMinutes,
                    source: e.target.value as ValueSource,
                  },
                })
              }
              className="text-[11px] bg-white border border-slate-300 rounded px-1.5 py-0.5 text-slate-700 focus:outline-none"
            >
              {SOURCES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <input
            type="number"
            value={leg.durationMinutes.value === null ? "" : leg.durationMinutes.value}
            onChange={(e) => handleDurationChange(e.target.value)}
            placeholder="Leave blank if unknown"
            className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="mb-2">
        <label className="block text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-amber-600" />
          <span>Instructions & Transfer Callout</span>
        </label>
        <input
          type="text"
          value={leg.instructions || ""}
          onChange={(e) => onUpdate({ instructions: e.target.value })}
          placeholder="e.g. Board bus towards Mukkam. Ask conductor for Chest Hospital stop."
          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
        />
      </div>

      {/* Expandable Precise Map & Waypoint Settings */}
      <div className="mt-3 pt-2.5 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setShowMapSettings((prev) => !prev)}
          className="flex items-center justify-between w-full text-[11px] font-semibold text-slate-600 hover:text-slate-900 transition py-1"
        >
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-teal-600" />
            <span>Map Navigation & GPS Waypoints (Optional)</span>
            {(leg.fromCoords || leg.toCoords || leg.customMapUrl) && (
              <span className="bg-teal-100 text-teal-800 text-[9px] px-1.5 py-0.2 rounded font-bold">
                Configured
              </span>
            )}
          </span>
          {showMapSettings ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showMapSettings && (
          <div className="mt-2.5 p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2.5 text-xs animate-in fade-in duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Boarding GPS / Landmark Anchor
                </label>
                <input
                  type="text"
                  value={leg.fromCoords || ""}
                  onChange={(e) => onUpdate({ fromCoords: e.target.value })}
                  placeholder="e.g. 11.2588, 75.7804 or Station Gate 2"
                  className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded text-xs text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Alighting GPS / Landmark Anchor
                </label>
                <input
                  type="text"
                  value={leg.toCoords || ""}
                  onChange={(e) => onUpdate({ toCoords: e.target.value })}
                  placeholder="e.g. 11.2650, 75.7950 or Main Auto Stand"
                  className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded text-xs text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Custom Direct Map URL (Overrides Auto Directions)
              </label>
              <input
                type="text"
                value={leg.customMapUrl || ""}
                onChange={(e) => onUpdate({ customMapUrl: e.target.value })}
                placeholder="e.g. https://maps.app.goo.gl/... or custom OpenStreetMap link"
                className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded text-xs text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
              <span>Preview leg link:</span>
              <a
                href={buildGoogleMapsLegUrl(leg.from, leg.to, leg.mode, "Kerala", {
                  customMapUrl: leg.customMapUrl,
                  fromCoords: leg.fromCoords,
                  toCoords: leg.toCoords,
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-emerald-600 hover:text-emerald-700"
              >
                <Navigation className="w-3 h-3" />
                <span>Test Directions in Google Maps</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
