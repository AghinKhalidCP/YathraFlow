import React from "react";
import type { Journey } from "../../features/journey/journeyTypes";
import { SAMPLE_VENUE_JOURNEY, SAMPLE_KOCHI_JOURNEY } from "../../data/sampleJourneys";
import { MapPin, ArrowRight, X, BookOpen } from "lucide-react";

interface DemoGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadDemo: (journey: Journey) => void;
}

const DEMOS = [
  {
    journey: SAMPLE_VENUE_JOURNEY,
    subtitle: "Calicut Railway Station to Medical College / Hackathon Venue",
    tags: ["Walking", "KSRTC Bus", "Auto-Rickshaw"],
  },
  {
    journey: SAMPLE_KOCHI_JOURNEY,
    subtitle: "Cochin Airport to Fort Kochi Heritage Area via Metro & Ferry",
    tags: ["Airport Feeder", "Kochi Metro", "SWTD Ferry", "Auto"],
  },
];

export const DemoGallery: React.FC<DemoGalleryProps> = ({
  isOpen,
  onClose,
  onLoadDemo,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Panel */}
      <div
        className="relative z-10 w-full max-w-lg rounded-2xl p-5 sm:p-6 shadow-2xl border animate-in zoom-in-95 duration-200"
        style={{
          backgroundColor: "var(--color-bg-elevated)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="flex items-center justify-between mb-4 border-b pb-3" style={{ borderColor: "var(--color-border-subtle)" }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: "var(--color-accent-subtle)" }}>
              <BookOpen className="w-4 h-4" style={{ color: "var(--color-accent)" }} />
            </div>
            <div>
              <h2
                className="text-base font-bold font-display"
                style={{ color: "var(--color-text)" }}
              >
                Explore Demo Journeys
              </h2>
              <p
                className="text-xs"
                style={{ color: "var(--color-text-muted)" }}
              >
                Curated multimodal travel scenarios across Kerala
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors hover:bg-slate-500/10 cursor-pointer"
            style={{ color: "var(--color-text-muted)" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {DEMOS.map((demo) => (
            <button
              key={demo.journey.id}
              onClick={() => {
                onLoadDemo(demo.journey);
                onClose();
              }}
              className="w-full text-left p-4 rounded-xl border transition-all duration-200 hover:scale-[1.01] group cursor-pointer"
              style={{
                borderColor: "var(--color-border)",
                backgroundColor: "var(--color-bg-subtle)",
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3
                    className="text-sm font-bold truncate font-display"
                    style={{ color: "var(--color-text)" }}
                  >
                    {demo.journey.title}
                  </h3>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {demo.subtitle}
                  </p>

                  <div className="flex items-center gap-1.5 mt-2">
                    <span
                      className="text-[11px] flex items-center gap-1 font-medium truncate"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                      {demo.journey.originLabel}
                    </span>
                    <ArrowRight
                      className="w-3 h-3 shrink-0"
                      style={{ color: "var(--color-text-muted)" }}
                    />
                    <span
                      className="text-[11px] flex items-center gap-1 font-medium truncate"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                      {demo.journey.destinationLabel}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {demo.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                        style={{
                          backgroundColor: "var(--color-accent-subtle)",
                          color: "var(--color-accent)",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center border opacity-60 group-hover:opacity-100 transition-opacity"
                  style={{
                    backgroundColor: "var(--color-bg-elevated)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-accent)",
                  }}
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </button>
          ))}
        </div>

        <p
          className="text-[10px] mt-4 text-center leading-relaxed"
          style={{ color: "var(--color-text-muted)" }}
        >
          Loading a demo replaces the workspace state. Real GPS coordinates and OSRM road geometry will render automatically.
        </p>
      </div>
    </div>
  );
};
