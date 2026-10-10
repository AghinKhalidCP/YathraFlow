import React from "react";
import type { Journey } from "../../features/journey/journeyTypes";
import { calculateRouteCostSummary, calculateRouteDurationSummary } from "../../features/journey/journeyCalculations";
import { Compass } from "lucide-react";

interface PrintViewProps {
  journey: Journey;
}

export const PrintView: React.FC<PrintViewProps> = ({ journey }) => {
  const [generatedDate] = React.useState(() => new Date().toLocaleDateString());
  const activeRoute = journey.routes.find((r) => r.id === journey.activeRouteId) || journey.routes[0];
  const cost = activeRoute ? calculateRouteCostSummary(activeRoute.legs) : null;
  const duration = activeRoute ? calculateRouteDurationSummary(activeRoute.legs) : null;

  if (!activeRoute) return null;

  return (
    <div className="hidden print-only p-8 max-w-4xl mx-auto bg-white text-slate-900 font-sans">
      <div className="border-b-2 border-slate-900 pb-4 mb-6 flex justify-between items-end">
        <div>
          <div className="flex items-center space-x-2">
            <Compass className="w-8 h-8 text-slate-900" />
            <h1 className="text-3xl font-black tracking-tight text-slate-900">YathraFlow</h1>
          </div>
          <p className="text-sm font-semibold text-slate-600">Kerala Multimodal Travel Guide</p>
        </div>
        <div className="text-right text-xs text-slate-500">
          <div>Generated on: {generatedDate}</div>
          <div className="font-mono text-[10px]">yathraflow.app</div>
        </div>
      </div>

      <div className="bg-slate-100 p-4 rounded-xl border border-slate-300 mb-6">
        <h2 className="text-xl font-bold text-slate-900 mb-2">{journey.title || "Kerala Journey"}</h2>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="font-bold text-slate-500 uppercase">From:</span>{" "}
            <span className="font-bold text-slate-900">{journey.originLabel}</span>
          </div>
          <div>
            <span className="font-bold text-slate-500 uppercase">To:</span>{" "}
            <span className="font-bold text-slate-900">{journey.destinationLabel}</span>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="bg-slate-900 text-white px-4 py-2 rounded-t-lg text-sm font-bold">
          {activeRoute.name}
        </div>
        {activeRoute.description && (
          <p className="text-xs text-slate-600 p-2 bg-slate-50 border-x border-b border-slate-200">
            {activeRoute.description}
          </p>
        )}

        <table className="w-full text-left text-xs border-collapse border border-slate-300 mt-4">
          <thead>
            <tr className="bg-slate-200 text-slate-900 font-bold uppercase text-[10px]">
              <th className="p-2.5 border border-slate-300">#</th>
              <th className="p-2.5 border border-slate-300">Mode</th>
              <th className="p-2.5 border border-slate-300">From ➔ To</th>
              <th className="p-2.5 border border-slate-300">Instructions</th>
              <th className="p-2.5 border border-slate-300">Est. Fare</th>
              <th className="p-2.5 border border-slate-300">Duration</th>
            </tr>
          </thead>
          <tbody>
            {activeRoute.legs.map((leg, idx) => (
              <tr key={leg.id} className="border border-slate-300 print-break-inside-avoid">
                <td className="p-2.5 border border-slate-300 font-bold">{idx + 1}</td>
                <td className="p-2.5 border border-slate-300 font-bold uppercase text-[11px]">
                  {leg.mode.replace("_", " ")}
                </td>
                <td className="p-2.5 border border-slate-300 font-medium">
                  <div>{leg.from} ➔ {leg.to}</div>
                  {leg.distanceKm && (
                    <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                      Distance: {leg.distanceKm} km
                    </div>
                  )}
                </td>
                <td className="p-2.5 border border-slate-300">{leg.instructions || "-"}</td>
                <td className="p-2.5 border border-slate-300 font-bold">
                  {leg.mode === "walking" ? "Free" : leg.fare.value !== null ? `₹${leg.fare.value}` : "Unknown"}
                </td>
                <td className="p-2.5 border border-slate-300">
                  {leg.durationMinutes.value !== null ? `${leg.durationMinutes.value} Mins` : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t-2 border-slate-900 pt-4 text-xs font-semibold">
        {cost && (
          <div>
            <span className="font-bold uppercase text-slate-500 block mb-1">Fare Summary:</span>
            <div className="text-base font-bold text-slate-900">
              Known Subtotal: ₹{cost.knownSubtotal}
            </div>
            {cost.hasUnknownFares && (
              <p className="text-[11px] text-slate-600 italic">
                *Includes verified fares only ({cost.unknownFareLegCount} leg(s) unpriced).
              </p>
            )}
          </div>
        )}
        {duration && (
          <div>
            <span className="font-bold uppercase text-slate-500 block mb-1">Time & Distance:</span>
            <div className="text-base font-bold text-slate-900">
              Known Duration: {duration.knownTotalMinutes} Mins
            </div>
            <p className="text-[11px] text-slate-600">
              Total Distance: ~{duration.totalDistanceKm} km (Walking: {duration.walkingMinutes} Mins / {duration.walkingDistanceKm} km)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
