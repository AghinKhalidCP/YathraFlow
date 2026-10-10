import React, { useState } from "react";
import type { Journey } from "../../features/journey/journeyTypes";
import { StoryboardTimeline } from "../journey-timeline/StoryboardTimeline";
import { CostBreakdownCard } from "../cost-summary/CostBreakdownCard";
import { DurationSummaryCard } from "../cost-summary/DurationSummaryCard";
import { calculateRouteCostSummary, calculateRouteDurationSummary } from "../../features/journey/journeyCalculations";
import { Compass } from "lucide-react";

interface EmbedViewProps {
  journey: Journey;
}

export const EmbedView: React.FC<EmbedViewProps> = ({ journey }) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const activeRoute = journey.routes.find((r) => r.id === journey.activeRouteId) || journey.routes[0];
  const costSummary = activeRoute ? calculateRouteCostSummary(activeRoute.legs) : null;
  const durationSummary = activeRoute ? calculateRouteDurationSummary(activeRoute.legs) : null;

  return (
    <div
      className="min-h-screen p-3 sm:p-5 font-sans transition-colors duration-300"
      style={{
        backgroundColor: "var(--color-bg)",
        color: "var(--color-text)",
      }}
    >
      <div className="max-w-2xl mx-auto space-y-4">
        <div
          className="rounded-2xl p-4 flex items-center justify-between border shadow-sm"
          style={{
            backgroundColor: "var(--color-bg-elevated)",
            borderColor: "var(--color-border)",
          }}
        >
          <div className="flex items-center space-x-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white shadow-xs"
              style={{ backgroundColor: "var(--color-accent)" }}
            >
              <Compass className="w-4.5 h-4.5" />
            </div>
            <div>
              <h1 className="text-sm font-bold font-display" style={{ color: "var(--color-text)" }}>
                {journey.title || "Kerala Journey Guide"}
              </h1>
              <p className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>
                {journey.originLabel} ➔ {journey.destinationLabel}
              </p>
            </div>
          </div>
          <span
            className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider"
            style={{
              backgroundColor: "var(--color-accent-subtle)",
              color: "var(--color-accent)",
            }}
          >
            YathraFlow Guide
          </span>
        </div>

        {activeRoute && (
          <StoryboardTimeline
            legs={activeRoute.legs}
            originLabel={journey.originLabel}
            destinationLabel={journey.destinationLabel}
            originLocation={journey.originLocation}
            destinationLocation={journey.destinationLocation}
            routeName={activeRoute.name}
            activeStepIndex={activeStepIndex}
            onSelectStepIndex={setActiveStepIndex}
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {costSummary && <CostBreakdownCard summary={costSummary} />}
          {durationSummary && <DurationSummaryCard summary={durationSummary} />}
        </div>
      </div>
    </div>
  );
};
