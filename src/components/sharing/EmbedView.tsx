import React from "react";
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
  const activeRoute = journey.routes.find((r) => r.id === journey.activeRouteId) || journey.routes[0];
  const costSummary = activeRoute ? calculateRouteCostSummary(activeRoute.legs) : null;
  const durationSummary = activeRoute ? calculateRouteDurationSummary(activeRoute.legs) : null;

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-4 text-slate-900 font-sans">
      <div className="max-w-xl mx-auto space-y-3">
        <div className="bg-slate-900 text-white rounded-xl p-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xs font-bold text-amber-300 tracking-tight">{journey.title}</h1>
              <p className="text-[10px] text-slate-300">
                {journey.originLabel} ➔ {journey.destinationLabel}
              </p>
            </div>
          </div>
          <span className="text-[9px] bg-teal-500/20 text-teal-300 border border-teal-500/40 px-1.5 py-0.5 rounded font-bold uppercase">
            YathraFlow Embed
          </span>
        </div>

        {activeRoute && (
          <StoryboardTimeline
            legs={activeRoute.legs}
            originLabel={journey.originLabel}
            destinationLabel={journey.destinationLabel}
            routeName={activeRoute.name}
          />
        )}

        {costSummary && <CostBreakdownCard summary={costSummary} />}
        {durationSummary && <DurationSummaryCard summary={durationSummary} />}
      </div>
    </div>
  );
};
