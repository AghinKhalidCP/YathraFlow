import React from "react";
import type { CostSummaryResult } from "../../features/journey/journeyTypes";
import { IndianRupee, ShieldCheck, ShieldAlert } from "lucide-react";

interface CostBreakdownCardProps {
  summary: CostSummaryResult;
}

export const CostBreakdownCard: React.FC<CostBreakdownCardProps> = ({ summary }) => {
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
          <IndianRupee className="w-4 h-4 text-emerald-500" />
          <span>Fare & Cost Breakdown</span>
        </h3>

        <span
          className="text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1"
          style={{
            backgroundColor: summary.isFullyPriced ? "rgba(16, 185, 129, 0.1)" : "rgba(245, 158, 11, 0.1)",
            color: summary.isFullyPriced ? "#10b981" : "#f59e0b",
          }}
        >
          {summary.isFullyPriced ? (
            <>
              <ShieldCheck className="w-3 h-3" />
              <span>Fully Priced</span>
            </>
          ) : (
            <>
              <ShieldAlert className="w-3 h-3" />
              <span>Partial Subtotal</span>
            </>
          )}
        </span>
      </div>

      {/* Main Totals Card */}
      <div
        className="rounded-xl p-4 mb-3 text-white shadow-sm"
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {summary.isFullyPriced ? "Total Journey Fare" : "Known Fare Subtotal"}
            </span>
            <div className="text-2xl font-black font-display tracking-tight text-white tabular-nums">
              ₹{summary.knownSubtotal}
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-300 font-semibold tabular-nums">
              {summary.knownFareLegCount} of {summary.totalLegCount} Legs Priced
            </div>
            {summary.walkingLegCount > 0 && (
              <div className="text-[10px] text-teal-400 font-medium mt-0.5">
                ({summary.walkingLegCount} free walking leg{summary.walkingLegCount > 1 ? "s" : ""})
              </div>
            )}
          </div>
        </div>

        {/* Subtotal Categorization Pill Bar */}
        {(summary.verifiedSubtotal > 0 || summary.estimatedSubtotal > 0) && (
          <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-slate-300">Verified:</span>
              <span className="font-bold text-white tabular-nums">₹{summary.verifiedSubtotal}</span>
            </div>
            {summary.estimatedSubtotal > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span className="text-slate-300">Estimated:</span>
                <span className="font-bold text-amber-300 tabular-nums">₹{summary.estimatedSubtotal}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Transparent Pricing Disclaimer */}
      {summary.hasUnknownFares && (
        <div
          className="rounded-xl p-3 mb-3 text-xs leading-relaxed flex items-start space-x-2 border"
          style={{
            backgroundColor: "rgba(245, 158, 11, 0.08)",
            borderColor: "rgba(245, 158, 11, 0.25)",
            color: "var(--color-text)",
          }}
        >
          <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-600 dark:text-amber-400">Fare Transparency:</span>{" "}
            {summary.unknownFareLegCount} leg{summary.unknownFareLegCount > 1 ? "s" : ""} currently have unpriced or variable fares. The subtotal above does not silently treat unpriced transport as ₹0.
          </div>
        </div>
      )}

      {/* Itemized Fare Provenance */}
      {summary.estimates.length > 0 && (
        <div className="space-y-2 border-t pt-2.5" style={{ borderColor: "var(--color-border-subtle)" }}>
          <span className="text-[11px] font-semibold block" style={{ color: "var(--color-text-muted)" }}>
            Itemized Fare Provenance:
          </span>
          {summary.estimates.map((est, idx) => (
            <div
              key={idx}
              className="rounded-xl p-2.5 text-xs flex items-center justify-between border"
              style={{
                backgroundColor: "var(--color-bg-subtle)",
                borderColor: "var(--color-border)",
              }}
            >
              <div className="min-w-0 flex-1 pr-2">
                <span className="font-semibold truncate block" style={{ color: "var(--color-text)" }}>
                  {est.legDescription}
                </span>
                {est.note && (
                  <p className="text-[10px] truncate" style={{ color: "var(--color-text-muted)" }}>
                    {est.note}
                  </p>
                )}
              </div>
              <div className="text-right shrink-0">
                <span className="font-bold tabular-nums" style={{ color: "var(--color-text)" }}>
                  ₹{est.amount}
                </span>
                <span
                  className="block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full mt-0.5"
                  style={{
                    backgroundColor: "var(--color-accent-subtle)",
                    color: "var(--color-accent)",
                  }}
                >
                  {est.fareStatus.replace("_", " ")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
