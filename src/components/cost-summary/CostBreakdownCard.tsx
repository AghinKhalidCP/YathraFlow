import React from "react";
import type { CostSummaryResult } from "../../features/journey/journeyTypes";
import { IndianRupee, ShieldAlert } from "lucide-react";

interface CostBreakdownCardProps {
  summary: CostSummaryResult;
}

export const CostBreakdownCard: React.FC<CostBreakdownCardProps> = ({ summary }) => {
  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-4 mb-4">
      <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 font-display">
          <IndianRupee className="w-4 h-4 text-emerald-600" />
          <span>Fare & Cost Breakdown</span>
        </h3>
        <span
          className={`text-[10px] font-semibold tracking-wide px-2.5 py-0.5 rounded-full border ${
            summary.isFullyPriced
              ? "bg-emerald-50 text-emerald-800 border-emerald-200/80"
              : "bg-amber-50 text-amber-900 border-amber-200/80"
          }`}
        >
          {summary.isFullyPriced ? "Fully Priced" : "Partial Subtotal"}
        </span>
      </div>

      <div className="bg-slate-900 text-white rounded-xl p-4 mb-3 flex items-center justify-between shadow-xs">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            {summary.isFullyPriced ? "Total Journey Cost" : "Known Fare Subtotal"}
          </span>
          <div className="text-2xl font-extrabold font-display text-white tabular-nums">
            ₹{summary.knownSubtotal}
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-300 font-medium tabular-nums">
            {summary.knownFareLegCount} of {summary.totalLegCount} Legs Priced
          </div>
          {summary.walkingLegCount > 0 && (
            <div className="text-[11px] text-emerald-400 font-medium">
              ({summary.walkingLegCount} free walking leg{summary.walkingLegCount > 1 ? "s" : ""})
            </div>
          )}
        </div>
      </div>

      {summary.hasUnknownFares && (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 mb-3 text-xs text-amber-900 leading-relaxed flex items-start space-x-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Honest Pricing Guarantee:</span>{" "}
            {summary.unknownFareLegCount} leg{summary.unknownFareLegCount > 1 ? "s" : ""} have unpriced or variable fares (e.g. local bus ticket). The subtotal above only includes verified fares and does not silently treat unknown fares as ₹0.
          </div>
        </div>
      )}

      {summary.estimates.length > 0 && (
        <div className="space-y-2 border-t border-slate-100 pt-2.5">
          <span className="text-[11px] font-semibold text-slate-500 block">
            Fare Estimates & Provenance:
          </span>
          {summary.estimates.map((est, idx) => (
            <div
              key={idx}
              className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-2.5 text-xs flex items-center justify-between"
            >
              <div>
                <span className="font-semibold text-slate-800">{est.legDescription}</span>
                {est.note && <p className="text-[11px] text-slate-500 italic">{est.note}</p>}
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-900 tabular-nums">₹{est.amount}</span>
                <span className="block text-[9px] text-amber-800 bg-amber-100/90 px-1.5 py-0.2 rounded-full font-semibold uppercase">
                  {est.source}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
