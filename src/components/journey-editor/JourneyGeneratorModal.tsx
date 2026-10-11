import React, { useState } from "react";
import type { GeoLocation, JourneyRoute } from "../../features/journey/journeyTypes";
import { planMultimodalJourney, type AIPlanningStepProgress } from "../../features/ai/geminiJourneyService";
import { Sparkles, Loader2, Key, AlertCircle } from "lucide-react";

interface JourneyGeneratorModalProps {
  isOpen: boolean;
  origin?: GeoLocation;
  destination?: GeoLocation;
  onRoutesGenerated: (routes: JourneyRoute[], title: string) => void;
  onClose: () => void;
}

export const JourneyGeneratorModal: React.FC<JourneyGeneratorModalProps> = ({
  isOpen,
  origin,
  destination,
  onRoutesGenerated,
  onClose,
}) => {
  const [preference, setPreference] = useState<
    "cheapest" | "fastest" | "fewest_transfers" | "balanced" | "accessible"
  >("balanced");
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem("yathraflow_gemini_api_key") || "";
  });
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentProgress, setCurrentProgress] = useState<AIPlanningStepProgress | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !origin || !destination) return null;

  const handleSaveKey = (key: string) => {
    setApiKey(key);
    if (key.trim()) {
      localStorage.setItem("yathraflow_gemini_api_key", key.trim());
    } else {
      localStorage.removeItem("yathraflow_gemini_api_key");
    }
  };

  const handleStartGeneration = async () => {
    setIsGenerating(true);
    setErrorMessage(null);
    setCurrentProgress({
      step: "resolving_points",
      message: "Initiating transit route discovery...",
    });

    try {
      const generatedRoutes = await planMultimodalJourney(
        origin,
        destination,
        {
          preference,
          userApiKey: apiKey.trim() || undefined,
        },
        (prog) => setCurrentProgress(prog)
      );

      const title = `${origin.name} to ${destination.name}`;
      onRoutesGenerated(generatedRoutes, title);
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to generate multimodal journey");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg rounded-2xl border p-5 sm:p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200"
        style={{
          backgroundColor: "var(--color-bg-elevated)",
          borderColor: "var(--color-border)",
          color: "var(--color-text)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "var(--color-border-subtle)" }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: "var(--color-accent-subtle)" }}>
              <Sparkles className="w-4 h-4" style={{ color: "var(--color-accent)" }} />
            </div>
            <div>
              <h3 className="text-sm font-bold font-display" style={{ color: "var(--color-text)" }}>
                AI & Deterministic Route Planner
              </h3>
              <p className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>
                Authentic Kerala multimodal journey synthesis
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isGenerating}
            className="text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors hover:bg-slate-500/10"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
          >
            Cancel
          </button>
        </div>

        {/* Selected Locations Summary */}
        <div
          className="rounded-xl p-3 text-xs space-y-1.5 border"
          style={{
            backgroundColor: "var(--color-bg-subtle)",
            borderColor: "var(--color-border)",
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Origin</span>
            <span className="font-semibold truncate max-w-[280px]">{origin.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400">Destination</span>
            <span className="font-semibold truncate max-w-[280px]">{destination.name}</span>
          </div>
        </div>

        {/* Routing Preferences Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold font-display block" style={{ color: "var(--color-text)" }}>
            Traveler Routing Preference:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            {[
              { id: "balanced", label: "⚖️ Balanced", desc: "Best mix of speed & cost" },
              { id: "cheapest", label: "🏷️ Cheapest", desc: "Ordinary bus & unreserved rail" },
              { id: "fastest", label: "⚡ Fastest", desc: "Direct express corridors" },
              { id: "fewest_transfers", label: "🔀 Min Transfers", desc: "Single-boarding legs" },
              { id: "accessible", label: "♿ Accessible", desc: "Low-barrier transit links" },
            ].map((pref) => (
              <button
                key={pref.id}
                type="button"
                onClick={() => setPreference(pref.id as any)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  preference === pref.id ? "ring-2 ring-emerald-500 font-bold" : "opacity-80 hover:opacity-100"
                }`}
                style={{
                  backgroundColor: preference === pref.id ? "var(--color-accent-subtle)" : "var(--color-bg-subtle)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)",
                }}
              >
                <div className="text-xs font-bold">{pref.label}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">{pref.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Optional Gemini API Key Section */}
        <div className="border-t pt-3 space-y-2" style={{ borderColor: "var(--color-border-subtle)" }}>
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowKeyInput(!showKeyInput)}
              className="text-[11px] font-semibold flex items-center gap-1.5 transition-colors hover:underline cursor-pointer"
              style={{ color: "var(--color-accent)" }}
            >
              <Key className="w-3.5 h-3.5" />
              <span>{showKeyInput ? "Hide Gemini API Key" : "Add Optional Gemini API Key (Free Tier)"}</span>
            </button>
            <span className="text-[10px] text-slate-400">
              {apiKey ? "Key configured" : "Using offline deterministic engine"}
            </span>
          </div>

          {showKeyInput && (
            <div className="space-y-1.5">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => handleSaveKey(e.target.value)}
                placeholder="AI Studio API key (stored locally, never committed)"
                className="w-full px-3 py-2 text-xs rounded-xl border outline-none font-mono"
                style={{
                  backgroundColor: "var(--color-bg-subtle)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)",
                }}
              />
              <p className="text-[10px] text-slate-500">
                If left blank, YathraFlow uses its verified deterministic Kerala transit corridor engine with zero billing.
              </p>
            </div>
          )}
        </div>

        {/* Progress Tracker / Error Box */}
        {isGenerating && currentProgress && (
          <div
            className="rounded-xl p-3 border space-y-2 animate-in fade-in"
            style={{
              backgroundColor: "var(--color-accent-subtle)",
              borderColor: "var(--color-border)",
            }}
          >
            <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: "var(--color-accent)" }}>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{currentProgress.message}</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{
                  width:
                    currentProgress.step === "resolving_points"
                      ? "25%"
                      : currentProgress.step === "discovering_corridors"
                      ? "50%"
                      : currentProgress.step === "calculating_tariffs"
                      ? "75%"
                      : "100%",
                }}
              />
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="rounded-xl p-3 border text-xs flex items-start gap-2 bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleStartGeneration}
            disabled={isGenerating}
            className="w-full py-3 rounded-xl text-xs sm:text-sm font-bold text-white transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            style={{ backgroundColor: "var(--color-accent)" }}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Synthesizing Kerala Multimodal Route...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Route Alternatives</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
