import React, { useState } from "react";
import type { JourneyLeg } from "../../features/journey/journeyTypes";
import { TimelineLegItem } from "./TimelineLegItem";
import { buildFullRouteGoogleMapsUrl, buildGoogleMapsSearchUrl } from "../../features/journey/journeyMapLinks";
import { ChevronLeft, ChevronRight, Flag, MapPin, Navigation, ExternalLink } from "lucide-react";

interface StoryboardTimelineProps {
  legs: JourneyLeg[];
  originLabel: string;
  destinationLabel: string;
  routeName: string;
}

export const StoryboardTimeline: React.FC<StoryboardTimelineProps> = ({
  legs,
  originLabel,
  destinationLabel,
  routeName,
}) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const fullRouteMapUrl = buildFullRouteGoogleMapsUrl(originLabel, destinationLabel, legs, "Kerala");
  const originMapUrl = originLabel ? buildGoogleMapsSearchUrl(originLabel, "Kerala") : "";
  const destinationMapUrl = destinationLabel ? buildGoogleMapsSearchUrl(destinationLabel, "Kerala") : "";

  const handlePrev = () => {
    setActiveStepIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setActiveStepIndex((prev) => Math.min(legs.length - 1, prev + 1));
  };

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5 mb-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-800 bg-amber-50/80 px-2.5 py-0.5 rounded-full border border-amber-200/80">
            Journey Storyboard
          </span>
          <h3 className="text-base font-bold font-display text-slate-900 mt-1">{routeName}</h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {fullRouteMapUrl && (
            <a
              href={fullRouteMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-2xs transition"
              title="Open full multimodal route in Google Maps"
            >
              <Navigation className="w-3.5 h-3.5 text-emerald-400" />
              <span>Full Route on Maps</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          )}

          {legs.length > 0 && (
            <div className="flex items-center space-x-2 bg-slate-100/80 p-1 rounded-xl">
              <button
                disabled={activeStepIndex === 0}
                onClick={handlePrev}
                className="p-1 rounded bg-white text-slate-700 shadow-2xs hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white"
                title="Previous Step"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-slate-700 px-2">
                Step {activeStepIndex + 1} of {legs.length}
              </span>
              <button
                disabled={activeStepIndex === legs.length - 1}
                onClick={handleNext}
                className="p-1 rounded bg-white text-slate-700 shadow-2xs hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white"
                title="Next Step"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              Trip Origin
            </span>
            <p className="text-xs font-bold text-emerald-950">{originLabel || "Start Location"}</p>
          </div>
        </div>

        {originMapUrl && (
          <a
            href={originMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 bg-white/90 hover:bg-white px-2 py-1 rounded border border-emerald-200 shadow-2xs transition shrink-0"
            title={`View "${originLabel}" pin on Google Maps`}
          >
            <MapPin className="w-3 h-3 text-emerald-600" />
            <span>View Pin</span>
            <ExternalLink className="w-2.5 h-2.5 text-emerald-500" />
          </a>
        )}
      </div>

      {legs.length === 0 ? (
        <div className="p-8 text-center text-slate-400 text-xs">
          No legs in this route. Add legs in the editor to visualize the storyboard timeline.
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
                onSelectStep={() => setActiveStepIndex(index)}
                nextLegMode={nextLeg?.mode}
              />
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between mt-2 p-2.5 bg-rose-50/80 border border-rose-200 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0">
            <Flag className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
              Final Destination
            </span>
            <p className="text-xs font-bold text-rose-950">{destinationLabel || "Destination"}</p>
          </div>
        </div>

        {destinationMapUrl && (
          <a
            href={destinationMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-800 hover:text-rose-950 bg-white/90 hover:bg-white px-2 py-1 rounded border border-rose-200 shadow-2xs transition shrink-0"
            title={`View "${destinationLabel}" pin on Google Maps`}
          >
            <MapPin className="w-3 h-3 text-rose-600" />
            <span>View Pin</span>
            <ExternalLink className="w-2.5 h-2.5 text-rose-500" />
          </a>
        )}
      </div>
    </div>
  );
};
