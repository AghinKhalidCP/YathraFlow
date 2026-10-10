import React from "react";
import type { JourneyLeg, TransportMode } from "../../features/journey/journeyTypes";
import { buildGoogleMapsLegUrl, buildGoogleMapsSearchUrl } from "../../features/journey/journeyMapLinks";
import {
  Train,
  Bus,
  Car,
  Footprints,
  Compass,
  Clock,
  IndianRupee,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Navigation,
  MapPin,
  ExternalLink,
} from "lucide-react";

interface TimelineLegItemProps {
  leg: JourneyLeg;
  index: number;
  totalLegs: number;
  isActiveStep: boolean;
  onSelectStep: () => void;
  nextLegMode?: TransportMode;
}

const MODE_CONFIG: Record<
  TransportMode,
  {
    label: string;
    icon: React.FC<{ className?: string }>;
    bgColor: string;
    borderColor: string;
    textColor: string;
    badgeBg: string;
  }
> = {
  train: {
    label: "Train",
    icon: Train,
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-300",
    textColor: "text-indigo-700",
    badgeBg: "bg-indigo-600 text-white",
  },
  bus: {
    label: "Bus",
    icon: Bus,
    bgColor: "bg-amber-50",
    borderColor: "border-amber-300",
    textColor: "text-amber-800",
    badgeBg: "bg-amber-500 text-slate-950 font-bold",
  },
  auto: {
    label: "Auto-Rickshaw",
    icon: Car,
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-300",
    textColor: "text-emerald-800",
    badgeBg: "bg-emerald-600 text-white",
  },
  taxi: {
    label: "Taxi / Car",
    icon: Car,
    bgColor: "bg-blue-50",
    borderColor: "border-blue-300",
    textColor: "text-blue-800",
    badgeBg: "bg-blue-600 text-white",
  },
  walking: {
    label: "Walking Leg",
    icon: Footprints,
    bgColor: "bg-teal-50/60",
    borderColor: "border-teal-200",
    textColor: "text-teal-800",
    badgeBg: "bg-teal-600 text-white",
  },
  other: {
    label: "Ferry / Transit",
    icon: Compass,
    bgColor: "bg-purple-50",
    borderColor: "border-purple-300",
    textColor: "text-purple-800",
    badgeBg: "bg-purple-600 text-white",
  },
};

export const TimelineLegItem: React.FC<TimelineLegItemProps> = ({
  leg,
  index,
  totalLegs,
  isActiveStep,
  onSelectStep,
  nextLegMode,
}) => {
  const config = MODE_CONFIG[leg.mode] || MODE_CONFIG.other;
  const Icon = config.icon;
  const isWalking = leg.mode === "walking";

  const mapUrl = buildGoogleMapsLegUrl(leg.from, leg.to, leg.mode, "Kerala", {
    customMapUrl: leg.customMapUrl,
    fromCoords: leg.fromCoords,
    toCoords: leg.toCoords,
  });
  const fromSearchUrl = leg.from ? buildGoogleMapsSearchUrl(leg.fromCoords || leg.from, "Kerala") : "";
  const toSearchUrl = leg.to ? buildGoogleMapsSearchUrl(leg.toCoords || leg.to, "Kerala") : "";

  return (
    <div
      onClick={onSelectStep}
      className={`relative cursor-pointer transition-all duration-200 mb-6 group ${
        isActiveStep ? "scale-[1.02]" : "hover:scale-[1.01]"
      }`}
    >
      {index < totalLegs - 1 && (
        <div
          className={`absolute left-6 top-12 bottom-0 w-1 -ml-0.5 z-0 ${
            isWalking ? "border-l-2 border-dashed border-teal-400 bg-transparent" : "bg-slate-300"
          }`}
          style={{ height: "calc(100% + 1.5rem)" }}
        />
      )}

      <div
        className={`relative z-10 rounded-xl border p-4 shadow-sm transition ${config.bgColor} ${
          isActiveStep
            ? `ring-2 ring-slate-900 ${config.borderColor} shadow-md`
            : `${config.borderColor} hover:shadow`
        }`}
      >
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center space-x-2">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shadow-sm ${config.badgeBg}`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Leg {index + 1}
                </span>
                <span className={`text-xs font-bold ${config.textColor}`}>• {config.label}</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 leading-tight flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1">
                  {leg.from || "Start Location"}
                  {fromSearchUrl && (
                    <a
                      href={fromSearchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-slate-400 hover:text-emerald-700 transition p-0.5 rounded hover:bg-white/80"
                      title={`View "${leg.from}" pin on Google Maps`}
                    >
                      <MapPin className="w-3 h-3" />
                    </a>
                  )}
                </span>
                <ArrowRight className="inline w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="inline-flex items-center gap-1">
                  {leg.to || "End Location"}
                  {toSearchUrl && (
                    <a
                      href={toSearchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-slate-400 hover:text-emerald-700 transition p-0.5 rounded hover:bg-white/80"
                      title={`View "${leg.to}" pin on Google Maps`}
                    >
                      <MapPin className="w-3 h-3" />
                    </a>
                  )}
                </span>
              </h4>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            {isActiveStep && (
              <span className="bg-slate-900 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                <CheckCircle2 className="w-3 h-3 text-amber-400" />
                Active Step
              </span>
            )}
          </div>
        </div>

        {leg.instructions && (
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-2.5 my-2 border border-slate-200/80 text-xs text-slate-800 leading-relaxed font-medium">
            {leg.instructions}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-200/60 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-1 font-semibold">
              <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
              {isWalking ? (
                <span className="text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full text-[11px]">
                  Free (Walking)
                </span>
              ) : leg.fare.value !== null ? (
                <span className="text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 text-[11px] shadow-2xs">
                  ₹{leg.fare.value}
                  {leg.fare.source === "organiser" && (
                    <span className="ml-1 text-[10px] text-amber-700 font-normal">
                      (Organiser Estimate)
                    </span>
                  )}
                </span>
              ) : (
                <span className="text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-full text-[11px] font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-amber-600" />
                  Fare Unknown
                </span>
              )}
            </div>

            <div className="flex items-center space-x-1 font-semibold">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              {leg.durationMinutes.value !== null ? (
                <span className="text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 text-[11px] shadow-2xs">
                  {leg.durationMinutes.value} Mins
                </span>
              ) : (
                <span className="text-slate-500 italic text-[11px]">Duration not specified</span>
              )}
            </div>
          </div>

          {mapUrl && (
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-md border border-white/30 text-slate-800 hover:bg-white/40 transition-shadow shadow-sm hover:shadow-md text-[11px] font-medium"
              title="Open Navigation in Google Maps"
            >
              <Navigation className="w-3 h-3 text-emerald-600" />
              <span>Navigate Leg</span>
              <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
            </a>
          )}
        </div>

        {(leg.fromCoords || leg.toCoords || leg.customMapUrl) && (
          <div className="mt-2 text-[10px] text-slate-500 bg-white/60 px-2 py-1 rounded border border-slate-200/60 font-mono flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-teal-600 shrink-0" />
            <span className="truncate">
              GPS Waypoints: {leg.fromCoords || "Auto Search"} ➔ {leg.toCoords || "Auto Search"}
            </span>
          </div>
        )}

        {nextLegMode && nextLegMode !== leg.mode && (
          <div className="mt-3 bg-slate-900 text-amber-300 text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center justify-between shadow-sm">
            <span>Transfer Point at {leg.to || "Stop"}</span>
            <span className="uppercase text-[10px] tracking-wider text-slate-300">
              Change to {nextLegMode} →
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
