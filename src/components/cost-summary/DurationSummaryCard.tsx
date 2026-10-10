import React from "react";
import type { DurationSummaryResult } from "../../features/journey/journeyTypes";
import { Clock, Footprints, AlertCircle } from "lucide-react";

interface DurationSummaryCardProps {
  summary: DurationSummaryResult;
}

export const DurationSummaryCard: React.FC<DurationSummaryCardProps> = ({ summary }) => {
  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-4 mb-4">
      <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 font-display">
          <Clock className="w-4 h-4 text-indigo-600" />
          <span>Duration & Travel Time</span>
        </h3>
        <span
          className={`text-[10px] font-semibold tracking-wide px-2.5 py-0.5 rounded-full border ${
            summary.isFullyTimed
              ? "bg-indigo-50 text-indigo-800 border-indigo-200/80"
              : "bg-slate-100 text-slate-700 border-slate-200/80"
          }`}
        >
          {summary.isFullyTimed ? "Complete Estimate" : "Partial Time"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80">
          <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
            Known Travel Time
          </span>
          <div className="text-xl font-bold font-display text-slate-900 tabular-nums">
            {summary.knownTotalMinutes} <span className="text-xs font-medium text-slate-500">Mins</span>
          </div>
        </div>

        <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200/80">
          <span className="text-[10px] uppercase font-bold text-emerald-800 block mb-1 flex items-center gap-1">
            <Footprints className="w-3.5 h-3.5 text-emerald-600" />
            <span>Walking Time</span>
          </span>
          <div className="text-xl font-bold font-display text-emerald-950 tabular-nums">
            {summary.walkingMinutes} <span className="text-xs font-medium text-emerald-700">Mins</span>
          </div>
        </div>
      </div>

      {summary.hasUnknownDurations && (
        <div className="text-[11px] text-slate-500 bg-slate-50/70 p-2.5 rounded-xl border border-slate-200/80 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>
            {summary.unknownDurationLegCount} leg{summary.unknownDurationLegCount > 1 ? "s" : ""} have variable durations dependent on local transit schedules.
          </span>
        </div>
      )}
    </div>
  );
};
