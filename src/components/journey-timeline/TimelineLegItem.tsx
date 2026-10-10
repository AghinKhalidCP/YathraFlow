import React from "react";
import type { JourneyLeg, TransportMode } from "../../features/journey/journeyTypes";
import { buildGoogleMapsLegUrl, buildGoogleMapsSearchUrl } from "../../features/journey/journeyMapLinks";
import {
  Train,
  Bus,
  Car,
  Footprints,
  Ship,
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

const MODE_META: Record<
  TransportMode,
  {
    label: string;
    icon: React.FC<{ className?: string }>;
    accentColor: string;
  }
> = {
  train: { label: "Train", icon: Train, accentColor: "#4f46e5" },
  ksrtc_bus: { label: "KSRTC Bus", icon: Bus, accentColor: "#ea580c" },
  private_bus: { label: "Private Bus", icon: Bus, accentColor: "#d97706" },
  auto: { label: "Auto-Rickshaw", icon: Car, accentColor: "#16a34a" },
  taxi: { label: "Taxi / Cab", icon: Car, accentColor: "#2563eb" },
  car: { label: "Private Car", icon: Car, accentColor: "#0284c7" },
  walking: { label: "Walking Leg", icon: Footprints, accentColor: "#0d9488" },
  ferry: { label: "Ferry / Boat", icon: Ship, accentColor: "#9333ea" },
  other: { label: "Other Transit", icon: Compass, accentColor: "#64748b" },
};

export const TimelineLegItem: React.FC<TimelineLegItemProps> = ({
  leg,
  index,
  totalLegs,
  isActiveStep,
  onSelectStep,
  nextLegMode,
}) => {
  const meta = MODE_META[leg.mode] || MODE_META.other;
  const Icon = meta.icon;
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
      className={`relative cursor-pointer transition-all duration-200 mb-4 group ${
        isActiveStep ? "scale-[1.01]" : "hover:opacity-95"
      }`}
    >
      {/* Connecting Vertical Line to next leg */}
      {index < totalLegs - 1 && (
        <div
          className={`absolute left-5 top-12 bottom-0 w-0.5 -ml-px z-0 ${
            isWalking ? "border-l-2 border-dashed border-teal-500" : ""
          }`}
          style={{
            backgroundColor: isWalking ? "transparent" : "var(--color-border)",
            height: "calc(100% + 1.25rem)",
          }}
        />
      )}

      <div
        className="relative z-10 rounded-2xl border p-4 shadow-xs transition-all duration-200"
        style={{
          backgroundColor: isActiveStep ? "var(--color-bg-elevated)" : "var(--color-bg-subtle)",
          borderColor: isActiveStep ? "var(--color-accent)" : "var(--color-border)",
          boxShadow: isActiveStep ? "0 4px 12px rgba(13, 148, 136, 0.12)" : "none",
        }}
      >
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-xs shrink-0 text-white"
              style={{ backgroundColor: meta.accentColor }}
            >
              <Icon className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
                  Leg {index + 1}
                </span>
                <span className="text-xs font-bold" style={{ color: meta.accentColor }}>
                  • {meta.label}
                </span>
                {leg.distanceKm && (
                  <span
                    className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full font-mono tabular-nums"
                    style={{
                      backgroundColor: "var(--color-accent-subtle)",
                      color: "var(--color-accent)",
                    }}
                  >
                    {leg.distanceKm} km
                  </span>
                )}
              </div>

              <h4 className="text-sm font-bold leading-tight flex flex-wrap items-center gap-1.5 mt-0.5" style={{ color: "var(--color-text)" }}>
                <span className="inline-flex items-center gap-1">
                  {leg.from || "Start Stop"}
                  {fromSearchUrl && (
                    <a
                      href={fromSearchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="opacity-50 hover:opacity-100 transition-opacity"
                      title={`View "${leg.from}" on Google Maps`}
                    >
                      <MapPin className="w-3 h-3 text-emerald-500" />
                    </a>
                  )}
                </span>
                <ArrowRight className="inline w-3.5 h-3.5 opacity-40 shrink-0" />
                <span className="inline-flex items-center gap-1">
                  {leg.to || "Destination Stop"}
                  {toSearchUrl && (
                    <a
                      href={toSearchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="opacity-50 hover:opacity-100 transition-opacity"
                      title={`View "${leg.to}" on Google Maps`}
                    >
                      <MapPin className="w-3 h-3 text-rose-500" />
                    </a>
                  )}
                </span>
              </h4>
            </div>
          </div>

          {isActiveStep && (
            <span
              className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs"
              style={{
                backgroundColor: "var(--color-accent)",
                color: "#ffffff",
              }}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Active</span>
            </span>
          )}
        </div>

        {/* Boarding instructions note */}
        {leg.instructions && (
          <div
            className="rounded-xl p-2.5 my-2.5 text-xs font-medium border leading-relaxed"
            style={{
              backgroundColor: "var(--color-bg)",
              borderColor: "var(--color-border-subtle)",
              color: "var(--color-text)",
            }}
          >
            {leg.instructions}
          </div>
        )}

        {/* Fare, Duration & Deep-link Badges */}
        <div
          className="flex flex-wrap items-center justify-between gap-2 mt-2.5 pt-2.5 border-t text-xs"
          style={{ borderColor: "var(--color-border-subtle)" }}
        >
          <div className="flex flex-wrap items-center gap-2">
            {/* Fare Tag */}
            <div className="flex items-center space-x-1 font-semibold">
              <IndianRupee className="w-3.5 h-3.5 text-emerald-500" />
              {isWalking ? (
                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  Free (Walking)
                </span>
              ) : leg.fare.value !== null ? (
                <span
                  className="px-2 py-0.5 rounded-lg border text-[11px] font-mono tabular-nums font-bold"
                  style={{
                    backgroundColor: "var(--color-bg-elevated)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-text)",
                  }}
                >
                  ₹{leg.fare.value}
                  {leg.fare.fareStatus === "estimated_fare" && (
                    <span className="ml-1 text-[9px] font-normal" style={{ color: "var(--color-text-muted)" }}>
                      (Tariff Est.)
                    </span>
                  )}
                </span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400 text-[11px] font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Fare Unknown
                </span>
              )}
            </div>

            {/* Duration Tag */}
            <div className="flex items-center space-x-1 font-semibold">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              {leg.durationMinutes.value !== null ? (
                <span
                  className="px-2 py-0.5 rounded-lg border text-[11px] font-mono tabular-nums"
                  style={{
                    backgroundColor: "var(--color-bg-elevated)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-text)",
                  }}
                >
                  {leg.durationMinutes.value} Mins
                </span>
              ) : (
                <span className="text-[11px] italic" style={{ color: "var(--color-text-muted)" }}>
                  Duration unpriced
                </span>
              )}
            </div>
          </div>

          {mapUrl && (
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all hover:scale-[1.02] shadow-2xs"
              style={{
                backgroundColor: "var(--color-bg-elevated)",
                borderColor: "var(--color-border)",
                color: "var(--color-text)",
              }}
              title="Verify directions in Google Maps"
            >
              <Navigation className="w-3 h-3" style={{ color: "var(--color-accent)" }} />
              <span>Navigate</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
            </a>
          )}
        </div>

        {/* Transfer guidance banner if switching modes */}
        {nextLegMode && nextLegMode !== leg.mode && (
          <div
            className="mt-2.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold flex items-center justify-between border"
            style={{
              backgroundColor: "var(--color-accent-subtle)",
              borderColor: "var(--color-border)",
              color: "var(--color-text)",
            }}
          >
            <span>Transfer Point: {leg.to || "Interchange Stop"}</span>
            <span
              className="text-[10px] font-bold uppercase tracking-wide"
              style={{ color: "var(--color-accent)" }}
            >
              Switch to {nextLegMode.replace("_", " ").toUpperCase()} →
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
