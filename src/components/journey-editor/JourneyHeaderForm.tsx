import React, { useState } from "react";
import type { GeoLocation } from "../../features/journey/journeyTypes";
import { LocationSelector } from "../geo/LocationSelector";
import { MapPickerDialog } from "../geo/MapPickerDialog";
import { Compass, Route } from "lucide-react";

interface JourneyHeaderFormProps {
  title: string;
  originLabel: string;
  destinationLabel: string;
  originLocation?: GeoLocation;
  destinationLocation?: GeoLocation;
  onUpdate: (updates: {
    title?: string;
    originLabel?: string;
    destinationLabel?: string;
    originLocation?: GeoLocation;
    destinationLocation?: GeoLocation;
  }) => void;
}

export const JourneyHeaderForm: React.FC<JourneyHeaderFormProps> = ({
  title,
  originLabel,
  destinationLabel,
  originLocation,
  destinationLocation,
  onUpdate,
}) => {
  const [mapPickerTarget, setMapPickerTarget] = useState<"origin" | "destination" | null>(null);

  const handleOriginSelect = (loc: GeoLocation) => {
    onUpdate({
      originLabel: loc.name,
      originLocation: loc,
    });
  };

  const handleDestinationSelect = (loc: GeoLocation) => {
    onUpdate({
      destinationLabel: loc.name,
      destinationLocation: loc,
    });
  };

  return (
    <div
      className="rounded-2xl border p-4 sm:p-5 shadow-xs transition-all duration-200"
      style={{
        backgroundColor: "var(--color-bg-elevated)",
        borderColor: "var(--color-border)",
      }}
    >
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center space-x-2 text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
          <Route className="w-3.5 h-3.5" style={{ color: "var(--color-accent)" }} />
          <span>Journey Blueprint</span>
        </div>

        {originLocation && destinationLocation && (
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
            style={{
              backgroundColor: "var(--color-accent-subtle)",
              color: "var(--color-accent)",
            }}
          >
            <Compass className="w-3 h-3" />
            <span>Map-Backed Endpoints</span>
          </span>
        )}
      </div>

      <div className="space-y-3.5">
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: "var(--color-text)" }}>
            Journey Title / Event Guide Name
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="e.g. Kozhikode Station to FOSS Hackathon Venue"
            className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold font-display border transition-all duration-200 outline-none"
            style={{
              backgroundColor: "var(--color-bg-subtle)",
              borderColor: "var(--color-border)",
              color: "var(--color-text)",
            }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <LocationSelector
            label="Starting Origin (Required)"
            value={originLabel}
            selectedLocation={originLocation}
            placeholder="Search starting railway station, city or stop..."
            pinColor="emerald"
            onSelect={handleOriginSelect}
            onOpenMapPicker={() => setMapPickerTarget("origin")}
          />

          <LocationSelector
            label="Final Destination (Required)"
            value={destinationLabel}
            selectedLocation={destinationLocation}
            placeholder="Search venue, college, hotel or landmark..."
            pinColor="rose"
            onSelect={handleDestinationSelect}
            onOpenMapPicker={() => setMapPickerTarget("destination")}
          />
        </div>
      </div>

      {/* Map Picker Modal for visual pin picking */}
      <MapPickerDialog
        isOpen={mapPickerTarget !== null}
        title={mapPickerTarget === "origin" ? "Select Starting Origin on Map" : "Select Final Destination on Map"}
        initialLocation={mapPickerTarget === "origin" ? originLocation : destinationLocation}
        onConfirm={(loc) => {
          if (mapPickerTarget === "origin") {
            handleOriginSelect(loc);
          } else {
            handleDestinationSelect(loc);
          }
        }}
        onClose={() => setMapPickerTarget(null)}
      />
    </div>
  );
};
