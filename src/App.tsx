import { useState } from "react";
import { useJourneyState } from "./hooks/useJourneyState";
import { Header } from "./components/layout/Header";
import { JourneyHeaderForm } from "./components/journey-editor/JourneyHeaderForm";
import { RouteTabSelector } from "./components/journey-editor/RouteTabSelector";
import { LegListEditor } from "./components/journey-editor/LegListEditor";
import { StoryboardTimeline } from "./components/journey-timeline/StoryboardTimeline";
import { CostBreakdownCard } from "./components/cost-summary/CostBreakdownCard";
import { DurationSummaryCard } from "./components/cost-summary/DurationSummaryCard";
import { ShareModal } from "./components/sharing/ShareModal";
import { EmailPreviewModal } from "./components/sharing/EmailPreviewModal";
import { PrintView } from "./components/sharing/PrintView";
import { EmbedView } from "./components/sharing/EmbedView";
import { calculateRouteCostSummary, calculateRouteDurationSummary } from "./features/journey/journeyCalculations";
import { Edit3, Eye, Compass, Info } from "lucide-react";

export function App() {
  const {
    journey,
    activeRoute,
    isEmbed,
    handleSelectRoute,
    handleAddLeg,
    handleUpdateLeg,
    handleDeleteLeg,
    handleMoveLeg,
    handleAddRoute,
    handleDeleteRoute,
    handleUpdateRoute,
    handleUpdateHeader,
    handleResetVenueDemo,
    handleLoadKochiDemo,
  } = useJourneyState();

  const [mobileTab, setMobileTab] = useState<"editor" | "preview">("preview");
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isEmailOpen, setIsEmailOpen] = useState(false);

  if (isEmbed) {
    return <EmbedView journey={journey} />;
  }

  const costSummary = activeRoute ? calculateRouteCostSummary(activeRoute.legs) : null;
  const durationSummary = activeRoute ? calculateRouteDurationSummary(activeRoute.legs) : null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col font-sans text-slate-900 selection:bg-slate-900 selection:text-white">
      <Header
        onOpenShareModal={() => setIsShareOpen(true)}
        onOpenEmailModal={() => setIsEmailOpen(true)}
        onPrint={handlePrint}
        onResetDemo={handleResetVenueDemo}
        onLoadKochiDemo={handleLoadKochiDemo}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 no-print">
        {/* Mobile Tab Switcher */}
        <div className="flex md:hidden bg-slate-200/80 p-1 rounded-full mb-4 text-xs font-semibold shadow-xs">
          <button
            onClick={() => setMobileTab("editor")}
            className={`flex-1 py-2 rounded-full flex items-center justify-center gap-1.5 transition ${
              mobileTab === "editor" ? "bg-white text-slate-950 shadow-xs font-bold" : "text-slate-600"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-500" />
            <span>Journey Editor</span>
          </button>
          <button
            onClick={() => setMobileTab("preview")}
            className={`flex-1 py-2 rounded-full flex items-center justify-center gap-1.5 transition ${
              mobileTab === "preview" ? "bg-white text-slate-950 shadow-xs font-bold" : "text-slate-600"
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-emerald-600" />
            <span>Storyboard Timeline</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left Column: Editor & Leg List */}
          <div
            className={`md:col-span-6 lg:col-span-5 space-y-4 ${
              mobileTab === "editor" ? "block" : "hidden md:block"
            }`}
          >
            <JourneyHeaderForm
              title={journey.title}
              originLabel={journey.originLabel}
              destinationLabel={journey.destinationLabel}
              onUpdate={handleUpdateHeader}
            />

            <RouteTabSelector
              routes={journey.routes}
              activeRouteId={journey.activeRouteId}
              onSelectRoute={handleSelectRoute}
              onAddRoute={handleAddRoute}
              onDeleteRoute={handleDeleteRoute}
              onUpdateRoute={handleUpdateRoute}
            />

            {activeRoute && (
              <LegListEditor
                legs={activeRoute.legs}
                onUpdateLeg={handleUpdateLeg}
                onDeleteLeg={handleDeleteLeg}
                onMoveLeg={handleMoveLeg}
                onAddLeg={handleAddLeg}
              />
            )}
          </div>

          {/* Right Column: Visual Storyboard Timeline */}
          <div
            className={`md:col-span-6 lg:col-span-7 space-y-4 ${
              mobileTab === "preview" ? "block" : "hidden md:block"
            }`}
          >
            {activeRoute && activeRoute.description && (
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 text-xs text-amber-900 flex items-start space-x-2.5 shadow-2xs">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">{activeRoute.name}:</span> {activeRoute.description}
                </div>
              </div>
            )}

            {activeRoute && (
              <StoryboardTimeline
                legs={activeRoute.legs}
                originLabel={journey.originLabel}
                destinationLabel={journey.destinationLabel}
                routeName={activeRoute.name}
              />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {costSummary && <CostBreakdownCard summary={costSummary} />}
              {durationSummary && <DurationSummaryCard summary={durationSummary} />}
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-slate-900 border-t border-slate-800 py-6 text-slate-400 text-xs no-print mt-10">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
          <div className="flex items-center justify-center space-x-2 text-slate-300 font-semibold font-display">
            <Compass className="w-4 h-4 text-amber-400" />
            <span>YathraFlow — Kerala Multimodal Journey Visualizer</span>
          </div>
          <p className="text-slate-500 text-[11px]">
            Designed with Stitch MCP • Independent per-leg vehicle selection • Verified Google Maps deep-links
          </p>
        </div>
      </footer>

      <ShareModal journey={journey} isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />
      <EmailPreviewModal journey={journey} isOpen={isEmailOpen} onClose={() => setIsEmailOpen(false)} />
      <PrintView journey={journey} />
    </div>
  );
}

export default App;
