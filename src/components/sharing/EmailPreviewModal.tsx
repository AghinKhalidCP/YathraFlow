import React, { useState } from "react";
import type { Journey } from "../../features/journey/journeyTypes";
import { calculateRouteCostSummary, calculateRouteDurationSummary } from "../../features/journey/journeyCalculations";
import { generateShareableUrl } from "../../features/journey/journeyStorage";
import { buildFullRouteGoogleMapsUrl } from "../../features/journey/journeyMapLinks";
import { X, Copy, Check, Mail } from "lucide-react";

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

  let textSnippet = `📍 Travel Guide: ${journey.title || "Kerala Multimodal Journey"}\n`;
  textSnippet += `From: ${journey.originLabel}\nTo: ${journey.destinationLabel}\n\n`;
  textSnippet += `=== Route: ${activeRoute?.name || "Recommended Route"} ===\n`;

  if (activeRoute) {
    activeRoute.legs.forEach((leg, idx) => {
      textSnippet += `${idx + 1}. [${leg.mode.toUpperCase()}] ${leg.from} ➔ ${leg.to}\n`;
      if (leg.instructions) textSnippet += `   Instructions: ${leg.instructions}\n`;
      const fareStr = leg.mode === "walking" ? "Free (Walking)" : leg.fare.value !== null ? `₹${leg.fare.value}` : "Fare Unknown";
      const timeStr = leg.durationMinutes.value !== null ? `${leg.durationMinutes.value} Mins` : "Duration Unknown";
      const distStr = leg.distanceKm ? ` | ${leg.distanceKm} km` : "";
      textSnippet += `   (Fare: ${fareStr} | Est. Time: ${timeStr}${distStr})\n\n`;
    });
  }

  if (cost) {
    textSnippet += `💰 Known Fare Subtotal: ₹${cost.knownSubtotal}${cost.hasUnknownFares ? ` (${cost.unknownFareLegCount} leg(s) fare unknown)` : ""}\n`;
  }
  if (duration) {
    textSnippet += `⏱️ Known Travel Duration: ${duration.knownTotalMinutes} Mins (Walking: ${duration.walkingMinutes} Mins)\n\n`;
  }

  if (fullRouteMapUrl) {
    textSnippet += `🗺️ Multimodal Directions on Google Maps:\n${fullRouteMapUrl}\n\n`;
  }

  textSnippet += `🔗 View Live Interactive Map & Storyboard:\n${publicUrl}\n`;

  const handleCopy = () => {
    navigator.clipboard.writeText(textSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl rounded-2xl shadow-2xl border overflow-hidden animate-in zoom-in-95 duration-200"
        style={{
          backgroundColor: "var(--color-bg-elevated)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="px-5 py-4 flex items-center justify-between border-b" style={{ borderColor: "var(--color-border-subtle)" }}>
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--color-accent-subtle)" }}>
              <Mail className="w-4 h-4" style={{ color: "var(--color-accent)" }} />
            </div>
            <h3 className="text-base font-bold font-display" style={{ color: "var(--color-text)" }}>
              Email & Plain Text Summary
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg transition-colors hover:bg-slate-500/10 cursor-pointer"
            style={{ color: "var(--color-text-muted)" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          <p className="text-xs mb-3 leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
            Standard email clients restrict interactive scripts and iframes. Copy this formatted plain-text snippet for email broadcasts, messaging groups, or calendar descriptions.
          </p>

          <textarea
            readOnly
            rows={12}
            value={textSnippet}
            className="w-full p-3.5 rounded-xl text-xs font-mono border outline-none leading-relaxed"
            style={{
              backgroundColor: "var(--color-bg-subtle)",
              borderColor: "var(--color-border)",
              color: "var(--color-text)",
            }}
          />

          <div className="mt-4 flex items-center justify-between">
            <span className="text-[11px] italic" style={{ color: "var(--color-text-muted)" }}>
              Includes verified web link and map parameters.
            </span>
            <button
              onClick={handleCopy}
              className="px-4 py-2 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 hover:scale-[1.02] cursor-pointer"
              style={{ backgroundColor: "var(--color-accent)" }}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
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

        <div className="px-5 py-3 border-t flex justify-end" style={{ borderColor: "var(--color-border-subtle)", backgroundColor: "var(--color-bg-subtle)" }}>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-xl border transition-colors hover:bg-slate-500/10 cursor-pointer"
            style={{
              borderColor: "var(--color-border)",
              color: "var(--color-text)",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
