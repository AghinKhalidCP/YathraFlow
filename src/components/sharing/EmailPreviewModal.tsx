import React, { useState } from "react";
import type { Journey } from "../../features/journey/journeyTypes";
import { calculateRouteCostSummary, calculateRouteDurationSummary } from "../../features/journey/journeyCalculations";
import { generateShareableUrl } from "../../features/journey/journeyStorage";
import { buildFullRouteGoogleMapsUrl } from "../../features/journey/journeyMapLinks";
import { X, Copy, Check, Sparkles } from "lucide-react";

interface EmailPreviewModalProps {
  journey: Journey;
  isOpen: boolean;
  onClose: () => void;
}

export const EmailPreviewModal: React.FC<EmailPreviewModalProps> = ({ journey, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const activeRoute = journey.routes.find((r) => r.id === journey.activeRouteId) || journey.routes[0];
  const cost = activeRoute ? calculateRouteCostSummary(activeRoute.legs) : null;
  const duration = activeRoute ? calculateRouteDurationSummary(activeRoute.legs) : null;
  const publicUrl = generateShareableUrl(journey);
  const fullRouteMapUrl = buildFullRouteGoogleMapsUrl(
    journey.originLabel,
    journey.destinationLabel,
    activeRoute?.legs || [],
    "Kerala"
  );

  let textSnippet = `📍 Travel Guide: ${journey.title}\n`;
  textSnippet += `From: ${journey.originLabel}\nTo: ${journey.destinationLabel}\n\n`;
  textSnippet += `=== Route: ${activeRoute?.name || "Recommended Route"} ===\n`;

  if (activeRoute) {
    activeRoute.legs.forEach((leg, idx) => {
      textSnippet += `${idx + 1}. [${leg.mode.toUpperCase()}] ${leg.from} ➔ ${leg.to}\n`;
      if (leg.instructions) textSnippet += `   Note: ${leg.instructions}\n`;
      const fareStr = leg.mode === "walking" ? "Free (Walking)" : leg.fare.value !== null ? `₹${leg.fare.value}` : "Fare Unknown";
      const timeStr = leg.durationMinutes.value !== null ? `${leg.durationMinutes.value} Mins` : "Duration Unknown";
      textSnippet += `   (Fare: ${fareStr} | Est. Time: ${timeStr})\n\n`;
    });
  }

  if (cost) {
    textSnippet += `💰 Known Fare Subtotal: ₹${cost.knownSubtotal}${cost.hasUnknownFares ? ` (${cost.unknownFareLegCount} leg(s) fare unknown)` : ""}\n`;
  }
  if (duration) {
    textSnippet += `⏱️ Known Travel Duration: ${duration.knownTotalMinutes} Mins (Walking: ${duration.walkingMinutes} Mins)\n\n`;
  }

  if (fullRouteMapUrl) {
    textSnippet += `🗺️ Open Multimodal Route in Google Maps:\n${fullRouteMapUrl}\n\n`;
  }

  textSnippet += `🔗 View Interactive Journey Storyboard:\n${publicUrl}\n`;

  const handleCopy = () => {
    navigator.clipboard.writeText(textSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden">
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold">Email & Message Preview Snippet</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          <p className="text-xs text-slate-600 mb-3">
            Email clients restrict interactive components. Copy this plain-text journey summary to include directly in event emails or messaging announcements.
          </p>

          <textarea
            readOnly
            rows={12}
            value={textSnippet}
            className="w-full p-3.5 bg-slate-900 text-amber-100 rounded-xl text-xs font-mono border border-slate-800 focus:outline-none leading-relaxed"
          />

          <div className="mt-4 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 italic">
              Includes full interactive guide URL link.
            </span>
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow transition flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-slate-950" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Text Snippet</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
