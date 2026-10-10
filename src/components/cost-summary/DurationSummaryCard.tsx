import React from "react";
import type { DurationSummaryResult } from "../../features/journey/journeyTypes";
import { Clock, Footprints, AlertCircle } from "lucide-react";

interface DurationSummaryCardProps {
  summary: DurationSummaryResult;
}

export const DurationSummaryCard: React.FC<DurationSummaryCardProps> = ({ summary }) => {
  return (
    <div
      className="rounded-2xl border p-4 sm:p-5 shadow-xs transition-all duration-200"
      style={{
        backgroundColor: "var(--color-bg-elevated)",
        borderColor: "var(--color-border)",
      }}
    >
      <div
        className="flex items-center justify-between mb-3 border-b pb-2.5"
        style={{ borderColor: "var(--color-border-subtle)" }}
      >
        <h3
          className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 font-display"
          style={{ color: "var(--color-text)" }}
        >
          <Clock className="w-4 h-4 text-blue-500" />
          <span>Duration & Travel Metrics</span>
        </h3>

        <span
          className="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
          style={{
            backgroundColor: summary.isFullyTimed ? "rgba(59, 130, 246, 0.1)" : "rgba(148, 163, 184, 0.15)",
            color: summary.isFullyTimed ? "#3b82f6" : "var(--color-text-muted)",
          }}
        >
          {summary.isFullyTimed ? "Complete Estimate" : "Partial Metrics"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div
          className="p-3.5 rounded-xl border"
          style={{
            backgroundColor: "var(--color-bg-subtle)",
            borderColor: "var(--color-border)",
          }}
        >
          <span className="text-[10px] uppercase font-bold block mb-1" style={{ color: "var(--color-text-muted)" }}>
            Total Est. Time
          </span>
          <div className="text-xl font-bold font-display tabular-nums" style={{ color: "var(--color-text)" }}>
            {summary.knownTotalMinutes}{" "}
            <span className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>
              Mins
            </span>
          </div>
          {summary.totalDistanceKm > 0 && (
            <div className="text-[10px] font-mono mt-0.5" style={{ color: "var(--color-accent)" }}>
              ~{summary.totalDistanceKm} km total
            </div>
          )}
        </div>

        <div
          className="p-3.5 rounded-xl border"
          style={{
            backgroundColor: "rgba(13, 148, 136, 0.08)",
            borderColor: "rgba(13, 148, 136, 0.2)",
          }}
        >
          <span className="text-[10px] uppercase font-bold block mb-1 flex items-center gap-1 text-teal-600 dark:text-teal-400">
            <Footprints className="w-3.5 h-3.5" />
            <span>Walking Legs</span>
          </span>
          <div className="text-xl font-bold font-display tabular-nums text-teal-700 dark:text-teal-300">
            {summary.walkingMinutes}{" "}
            <span className="text-xs font-medium text-teal-600 dark:text-teal-400">Mins</span>
          </div>
          {summary.walkingDistanceKm > 0 && (
            <div className="text-[10px] font-mono mt-0.5 text-teal-600 dark:text-teal-400">
              {summary.walkingDistanceKm} km walk
            </div>
          )}
        </div>
      </div>

      {summary.hasUnknownDurations && (
        <div
          className="text-[11px] p-2.5 rounded-xl border flex items-center gap-2 leading-tight"
          style={{
            backgroundColor: "var(--color-bg-subtle)",
            borderColor: "var(--color-border-subtle)",
            color: "var(--color-text-muted)",
          }}
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--color-accent)" }} />
          <span>
            {summary.unknownDurationLegCount} leg{summary.unknownDurationLegCount > 1 ? "s" : ""} have variable transit durations dependent on traffic and departure intervals.
          </span>
        </div>
      )}
    </div>
  );
};
