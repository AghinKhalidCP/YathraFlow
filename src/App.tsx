import { useState } from "react";
import { useJourneyState } from "./hooks/useJourneyState";
import { Header } from "./components/layout/Header";
import { WelcomeScreen } from "./components/layout/WelcomeScreen";
import { DemoGallery } from "./components/layout/DemoGallery";
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
import { Edit3, Eye, Info, Compass } from "lucide-react";

export function App() {
  const {
    journey,
    activeRoute,
    isEmbed,
    handleSelectRoute,
    handleAddLeg,
    handleUpdateLeg,
    handleDuplicateLeg,
    handleDeleteLeg,
    handleMoveLeg,
    handleAddRoute,
    handleDeleteRoute,
    handleUpdateRoute,
    handleUpdateHeader,
    handleCreateNewJourney,
    handleLoadDemo,
    handleClearJourney,
  } = useJourneyState();

  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [mobileTab, setMobileTab] = useState<"editor" | "preview">("preview");
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isEmailOpen, setIsEmailOpen] = useState(false);
  const [isDemoGalleryOpen, setIsDemoGalleryOpen] = useState(false);

  if (isEmbed && journey) {
    return <EmbedView journey={journey} />;
  }

  const hasJourney = journey !== null;
  const costSummary = activeRoute ? calculateRouteCostSummary(activeRoute.legs) : null;
  const durationSummary = activeRoute ? calculateRouteDurationSummary(activeRoute.legs) : null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="min-h-screen flex flex-col font-sans transition-colors duration-300"
      style={{
        backgroundColor: "var(--color-bg)",
        color: "var(--color-text)",
      }}
    >
      <Header
        hasJourney={hasJourney}
        onOpenShareModal={() => setIsShareOpen(true)}
        onOpenEmailModal={() => setIsEmailOpen(true)}
        onPrint={handlePrint}
        onCreateNew={handleClearJourney}
      />

      {/* ── Zero‑state: Welcome Screen ────────────────── */}
      {!hasJourney && (
        <WelcomeScreen
          onCreateJourney={handleCreateNewJourney}
          onOpenDemoGallery={() => setIsDemoGalleryOpen(true)}
        />
      )}

      {/* ── Journey Workspace ─────────────────────────── */}
      {hasJourney && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 no-print">
          {/* Mobile Tab Switcher */}
          <div
            className="flex md:hidden p-1 rounded-2xl mb-4 text-xs font-semibold border"
            style={{
              backgroundColor: "var(--color-bg-inset)",
              borderColor: "var(--color-border)",
            }}
          >
            <button
              type="button"
              onClick={() => setMobileTab("editor")}
              className="flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer"
              style={{
                backgroundColor:
                  mobileTab === "editor"
                    ? "var(--color-bg-elevated)"
                    : "transparent",
                color:
                  mobileTab === "editor"
                    ? "var(--color-text)"
                    : "var(--color-text-muted)",
                boxShadow:
                  mobileTab === "editor"
                    ? "0 2px 4px rgba(0,0,0,0.06)"
                    : "none",
              }}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Journey Editor</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileTab("preview")}
              className="flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer"
              style={{
                backgroundColor:
                  mobileTab === "preview"
                    ? "var(--color-bg-elevated)"
                    : "transparent",
                color:
                  mobileTab === "preview"
                    ? "var(--color-text)"
                    : "var(--color-text-muted)",
                boxShadow:
                  mobileTab === "preview"
                    ? "0 2px 4px rgba(0,0,0,0.06)"
                    : "none",
              }}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Map & Storyboard</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left Column: Editor & Leg List */}
            <div
              className={`md:col-span-5 lg:col-span-5 space-y-4 ${
                mobileTab === "editor" ? "block" : "hidden md:block"
              }`}
            >
              <JourneyHeaderForm
                title={journey.title}
                originLabel={journey.originLabel}
                destinationLabel={journey.destinationLabel}
                originLocation={journey.originLocation}
                destinationLocation={journey.destinationLocation}
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
                  onDuplicateLeg={handleDuplicateLeg}
                  onMoveLeg={handleMoveLeg}
                  onAddLeg={handleAddLeg}
                />
              )}
            </div>

            {/* Right Column: Visual Storyboard Timeline & Real Map */}
            <div
              className={`md:col-span-7 lg:col-span-7 space-y-4 ${
                mobileTab === "preview" ? "block" : "hidden md:block"
              }`}
            >
              {activeRoute && activeRoute.description && (
                <div
                  className="rounded-2xl p-3.5 text-xs flex items-start space-x-2.5 border"
                  style={{
                    backgroundColor: "var(--color-accent-subtle)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  <Info
                    className="w-4 h-4 shrink-0 mt-0.5"
                    style={{ color: "var(--color-accent)" }}
                  />
                  <div>
                    <span className="font-bold">{activeRoute.name}:</span>{" "}
                    {activeRoute.description}
                  </div>
                </div>
              )}

              {activeRoute && (
                <StoryboardTimeline
                  legs={activeRoute.legs}
                  originLabel={journey.originLabel}
                  destinationLabel={journey.destinationLabel}
                  originLocation={journey.originLocation}
                  destinationLocation={journey.destinationLocation}
                  routeName={activeRoute.name}
                  activeStepIndex={activeStepIndex}
                  onSelectStepIndex={setActiveStepIndex}
                />
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {costSummary && <CostBreakdownCard summary={costSummary} />}
                {durationSummary && (
                  <DurationSummaryCard summary={durationSummary} />
                )}
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ── Footer ────────────────────────────────────── */}
      <footer
        className="border-t py-6 text-xs no-print mt-auto"
        style={{
          backgroundColor: "var(--color-bg-subtle)",
          borderColor: "var(--color-border)",
          color: "var(--color-text-muted)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
          <div
            className="flex items-center justify-center space-x-2 font-semibold font-display"
            style={{ color: "var(--color-text-secondary)" }}
          >
            <Compass
              className="w-4 h-4"
              style={{ color: "var(--color-accent)" }}
            />
            <span>YathraFlow — Kerala Multimodal Journey Visualizer</span>
          </div>
          <p style={{ color: "var(--color-text-muted)" }} className="text-[11px]">
            OpenStreetMap Tiles & Nominatim Geocoding • OSRM Routing • Transparent Kerala Transit Tariffs
          </p>
        </div>
      </footer>

      {/* ── Modals ────────────────────────────────────── */}
      <DemoGallery
        isOpen={isDemoGalleryOpen}
        onClose={() => setIsDemoGalleryOpen(false)}
        onLoadDemo={handleLoadDemo}
      />

      {journey && (
        <>
          <ShareModal
            journey={journey}
            isOpen={isShareOpen}
            onClose={() => setIsShareOpen(false)}
          />
          <EmailPreviewModal
            journey={journey}
            isOpen={isEmailOpen}
            onClose={() => setIsEmailOpen(false)}
          />
          <PrintView journey={journey} />
        </>
      )}
    </div>
  );
}

export default App;
