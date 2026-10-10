import React, { useState } from "react";
import type { GeoLocation } from "../../features/journey/journeyTypes";
import { LocationSelector } from "../geo/LocationSelector";
import { MapPickerDialog } from "../geo/MapPickerDialog";
import { Compass, Plus, BookOpen, ArrowRight, MapPin, Sparkles } from "lucide-react";

interface WelcomeScreenProps {
  onCreateJourney: (originLoc?: GeoLocation, destLoc?: GeoLocation) => void;
  onOpenDemoGallery: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onCreateJourney,
  onOpenDemoGallery,
}) => {
  const [originLocation, setOriginLocation] = useState<GeoLocation | undefined>();
  const [destinationLocation, setDestinationLocation] = useState<GeoLocation | undefined>();
  const [mapPickerTarget, setMapPickerTarget] = useState<"origin" | "destination" | null>(null);

  const handleStartCreation = () => {
    onCreateJourney(originLocation, destinationLocation);
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12 sm:py-16">
      <div className="max-w-xl w-full text-center space-y-8 animate-in fade-in zoom-in-95 duration-300">
        {/* Brand Icon */}
        <div className="flex justify-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-md transition-transform hover:scale-105 duration-200"
            style={{ backgroundColor: "var(--color-accent-subtle)" }}
          >
            <Compass
              className="w-8 h-8"
              style={{ color: "var(--color-accent)" }}
            />
          </div>
        </div>

        {/* Heading & Introduction */}
        <div className="space-y-2.5">
          <h1
            className="text-3xl sm:text-4xl font-black font-display tracking-tight"
            style={{ color: "var(--color-text)" }}
          >
            YathraFlow
          </h1>
          <p
            className="text-sm sm:text-base leading-relaxed max-w-md mx-auto"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Kerala Multimodal Journey Visualizer. Create clean, map-backed travel guides with real OpenStreetMap coordinates, transparent tariffs, and step-by-step directions.
          </p>
        </div>

        {/* Real Location Quick Setup Card */}
        <div
          className="rounded-2xl border p-5 shadow-sm text-left space-y-4"
          style={{
            backgroundColor: "var(--color-bg-elevated)",
            borderColor: "var(--color-border)",
          }}
        >
          <div className="flex items-center space-x-2 border-b pb-2.5" style={{ borderColor: "var(--color-border-subtle)" }}>
            <Sparkles className="w-3.5 h-3.5" style={{ color: "var(--color-accent)" }} />
            <span className="text-xs font-bold font-display uppercase tracking-wider" style={{ color: "var(--color-text)" }}>
              Plan Your Journey
            </span>
          </div>

          <div className="space-y-3">
            <LocationSelector
              label="Starting Origin"
              value={originLocation?.name || ""}
              selectedLocation={originLocation}
              placeholder="Search origin railway station, bus stop or city..."
              pinColor="emerald"
              onSelect={(loc) => setOriginLocation(loc)}
              onOpenMapPicker={() => setMapPickerTarget("origin")}
            />

            <LocationSelector
              label="Destination"
              value={destinationLocation?.name || ""}
              selectedLocation={destinationLocation}
              placeholder="Search destination venue, landmark or town..."
              pinColor="rose"
              onSelect={(loc) => setDestinationLocation(loc)}
              onOpenMapPicker={() => setMapPickerTarget("destination")}
            />
          </div>

          <div className="pt-2">
            <button
              onClick={handleStartCreation}
              className="w-full py-3 rounded-xl text-xs sm:text-sm font-bold text-white transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              style={{ backgroundColor: "var(--color-accent)" }}
            >
              <Plus className="w-4 h-4" />
              <span>Create Journey Blueprint</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Explore Demo Journeys Section */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-center gap-4">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
              or explore pre-configured routes
            </span>
          </div>

          <button
            onClick={onOpenDemoGallery}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border cursor-pointer hover:scale-[1.02]"
            style={{
              color: "var(--color-text-secondary)",
              borderColor: "var(--color-border)",
              backgroundColor: "var(--color-bg-elevated)",
            }}
          >
            <BookOpen className="w-3.5 h-3.5" style={{ color: "var(--color-accent)" }} />
            <span>Explore Demo Journeys (Kozhikode & Kochi)</span>
          </button>
        </div>

        {/* Feature Highlights */}
        <div
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2 text-xs font-medium"
          style={{ color: "var(--color-text-muted)" }}
        >
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-500" />
            Real OpenStreetMap Routing
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            KSRTC & Auto Fare Estimates
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
            Multimodal Storyboard
          </span>
        </div>
      </div>

      {/* Map Picker Modal */}
      <MapPickerDialog
        isOpen={mapPickerTarget !== null}
        title={mapPickerTarget === "origin" ? "Select Journey Origin on Map" : "Select Journey Destination on Map"}
        initialLocation={mapPickerTarget === "origin" ? originLocation : destinationLocation}
        onConfirm={(loc) => {
          if (mapPickerTarget === "origin") {
            setOriginLocation(loc);
          } else {
            setDestinationLocation(loc);
          }
        }}
        onClose={() => setMapPickerTarget(null)}
      />
    </div>
  );
};
