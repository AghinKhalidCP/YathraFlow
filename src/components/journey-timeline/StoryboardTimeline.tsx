import React from "react";
import type { JourneyLeg, GeoLocation } from "../../features/journey/journeyTypes";
import { TimelineLegItem } from "./TimelineLegItem";
import { InteractiveJourneyMap } from "../geo/InteractiveJourneyMap";
import { buildFullRouteGoogleMapsUrl } from "../../features/journey/journeyMapLinks";
import { ChevronLeft, ChevronRight, Flag, MapPin, Navigation, ExternalLink, Compass } from "lucide-react";

interface StoryboardTimelineProps {
  legs: JourneyLeg[];
  originLabel: string;
  destinationLabel: string;
  originLocation?: GeoLocation;
  destinationLocation?: GeoLocation;
  routeName: string;
  activeStepIndex: number;
  onSelectStepIndex: (index: number) => void;
}

export const StoryboardTimeline: React.FC<StoryboardTimelineProps> = ({
  legs,
  originLabel,
  destinationLabel,
  originLocation,
  destinationLocation,
  routeName,
  activeStepIndex,
  onSelectStepIndex,
}) => {
  const fullRouteMapUrl = buildFullRouteGoogleMapsUrl(originLabel, destinationLabel, legs, "Kerala");

  const handlePrev = () => {
    onSelectStepIndex(Math.max(0, activeStepIndex - 1));
  };

  const handleNext = () => {
    onSelectStepIndex(Math.min(legs.length - 1, activeStepIndex + 1));
  };

  return (
    <div className="space-y-4">
      {/* 1. Real Interactive Map View */}
      <InteractiveJourneyMap
        originLocation={originLocation}
        destinationLocation={destinationLocation}
        originLabel={originLabel}
        destinationLabel={destinationLabel}
        legs={legs}
        activeStepIndex={activeStepIndex}
        onSelectLeg={onSelectStepIndex}
      />

      {/* 2. Connected Journey Storyboard Timeline */}
      <div
        className="rounded-2xl border p-4 sm:p-5 shadow-xs transition-all duration-200"
        style={{
          backgroundColor: "var(--color-bg-elevated)",
          borderColor: "var(--color-border)",
        }}
      >
        <div
          className="flex flex-wrap items-center justify-between gap-3 border-b pb-3.5 mb-4"
          style={{ borderColor: "var(--color-border-subtle)" }}
        >
          <div>
            <div className="flex items-center gap-1.5">
              <span
                className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: "var(--color-accent-subtle)",
                  color: "var(--color-accent)",
                }}
              >
                Journey Storyboard
              </span>
            </div>
            <h3 className="text-base font-bold font-display mt-1" style={{ color: "var(--color-text)" }}>
              {routeName}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {fullRouteMapUrl && (
              <a
                href={fullRouteMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all hover:scale-[1.02] shadow-2xs"
                style={{
                  backgroundColor: "var(--color-bg-subtle)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)",
                }}
                title="Open full multimodal route in Google Maps"
              >
                <Navigation className="w-3.5 h-3.5 text-emerald-500" />
                <span>Full Route (Maps)</span>
                <ExternalLink className="w-3 h-3 opacity-50" />
              </a>
            )}

            {legs.length > 0 && (
              <div
                className="flex items-center space-x-1 p-1 rounded-xl border"
                style={{
                  backgroundColor: "var(--color-bg-subtle)",
                  borderColor: "var(--color-border)",
                }}
              >
                <button
                  type="button"
                  disabled={activeStepIndex === 0}
                  onClick={handlePrev}
                  className="p-1 rounded-lg transition-colors hover:bg-slate-500/10 disabled:opacity-30 cursor-pointer"
                  title="Previous Step"
                >
                  <ChevronLeft className="w-4 h-4" style={{ color: "var(--color-text)" }} />
                </button>
                <span className="text-xs font-bold px-2 tabular-nums" style={{ color: "var(--color-text)" }}>
                  Step {activeStepIndex + 1} of {legs.length}
                </span>
                <button
                  type="button"
                  disabled={activeStepIndex === legs.length - 1}
                  onClick={handleNext}
                  className="p-1 rounded-lg transition-colors hover:bg-slate-500/10 disabled:opacity-30 cursor-pointer"
                  title="Next Step"
                >
                  <ChevronRight className="w-4 h-4" style={{ color: "var(--color-text)" }} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Origin Hub Card */}
        <div
          className="flex items-center justify-between mb-4 p-3 rounded-xl border"
          style={{
            backgroundColor: "rgba(16, 185, 129, 0.08)",
            borderColor: "rgba(16, 185, 129, 0.25)",
          }}
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Starting Origin
              </span>
              <p className="text-xs font-bold" style={{ color: "var(--color-text)" }}>
                {originLabel || "Select Origin"}
              </p>
              {originLocation && (
                <p className="text-[10px] truncate max-w-[280px]" style={{ color: "var(--color-text-muted)" }}>
                  {originLocation.displayName}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Storyboard Step Items */}
        {legs.length === 0 ? (
          <div className="py-12 text-center text-xs" style={{ color: "var(--color-text-muted)" }}>
            <Compass className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p>No legs added in this route yet.</p>
          </div>
        ) : (
          <div className="py-2">
            {legs.map((leg, index) => {
              const nextLeg = legs[index + 1];
              return (
                <TimelineLegItem
                  key={leg.id}
                  leg={leg}
                  index={index}
                  totalLegs={legs.length}
                  isActiveStep={index === activeStepIndex}
                  onSelectStep={() => onSelectStepIndex(index)}
                  nextLegMode={nextLeg?.mode}
                />
              );
            })}
          </div>
        )}

        {/* Destination Hub Card */}
        <div
          className="flex items-center justify-between mt-2 p-3 rounded-xl border"
          style={{
            backgroundColor: "rgba(244, 63, 94, 0.08)",
            borderColor: "rgba(244, 63, 94, 0.25)",
          }}
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
              <Flag className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Final Destination
              </span>
              <p className="text-xs font-bold" style={{ color: "var(--color-text)" }}>
                {destinationLabel || "Select Destination"}
              </p>
              {destinationLocation && (
                <p className="text-[10px] truncate max-w-[280px]" style={{ color: "var(--color-text-muted)" }}>
                  {destinationLocation.displayName}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
