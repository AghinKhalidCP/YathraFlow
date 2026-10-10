import React, { useState, useEffect, useRef } from "react";
import type { GeoLocation } from "../../features/journey/journeyTypes";
import { searchLocations, getCurrentBrowserLocation, reverseGeocode, GEOCODING_CONFIG } from "../../features/geo/geocodingService";
import { MapPin, Search, Loader2, Navigation, AlertCircle, Check, Compass } from "lucide-react";

interface LocationSelectorProps {
  label: string;
  value: string;
  selectedLocation?: GeoLocation;
  placeholder?: string;
  required?: boolean;
  pinColor?: "emerald" | "rose" | "teal" | "amber";
  onSelect: (location: GeoLocation) => void;
  onOpenMapPicker?: () => void;
  showMapPinAction?: boolean;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  label,
  value,
  selectedLocation,
  placeholder = "Search place, station, airport or address...",
  pinColor = "emerald",
  onSelect,
  onOpenMapPicker,
  showMapPinAction = true,
}) => {
  const [query, setQuery] = useState(value || "");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<GeoLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setQuery(text);
    setErrorMessage(null);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (abortControllerRef.current) abortControllerRef.current.abort();

    if (text.trim().length < GEOCODING_CONFIG.MIN_QUERY_LENGTH) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    setIsOpen(true);

    searchTimeoutRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const data = await searchLocations(text, controller.signal);
        setResults(data);
        if (data.length === 0) {
          setErrorMessage("No matching places found. Try a nearby junction, city, or landmark, or use 'Map Pin'.");
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setErrorMessage(err.message || "Location search timed out. Check connection or choose 'Map Pin'.");
        }
      } finally {
        setIsLoading(false);
      }
    }, GEOCODING_CONFIG.DEBOUNCE_MS);
  };

  const handleSelectResult = (loc: GeoLocation) => {
    setQuery(loc.name);
    setIsOpen(false);
    setErrorMessage(null);
    onSelect(loc);
  };

  const handleUseMyLocation = async () => {
    setIsLocating(true);
    setErrorMessage(null);
    try {
      const coords = await getCurrentBrowserLocation();
      const resolved = await reverseGeocode(coords.lat, coords.lng);
      const locWithGps: GeoLocation = {
        ...resolved,
        verificationStatus: "browser_gps",
      };
      setQuery(locWithGps.name);
      onSelect(locWithGps);
      setIsOpen(false);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to retrieve current location.");
    } finally {
      setIsLocating(false);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-semibold flex items-center gap-1.5" style={{ color: "var(--color-text)" }}>
          <span className={`w-2 h-2 rounded-full ${pinColor === "emerald" ? "bg-emerald-500" : pinColor === "rose" ? "bg-rose-500" : pinColor === "teal" ? "bg-teal-500" : "bg-amber-500"}`} />
          <span>{label}</span>
        </label>

        <div className="flex items-center gap-2">
          {onOpenMapPicker && showMapPinAction && (
            <button
              type="button"
              onClick={onOpenMapPicker}
              className="text-[11px] font-medium flex items-center gap-1 transition-colors hover:underline cursor-pointer"
              style={{ color: "var(--color-accent)" }}
              title="Pick exact point on interactive map"
            >
              <Compass className="w-3 h-3" />
              <span>Pick on Map</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={isLocating}
            className="text-[11px] font-medium flex items-center gap-1 transition-colors hover:underline disabled:opacity-50 cursor-pointer"
            style={{ color: "var(--color-accent)" }}
            title="Use current GPS position"
          >
            {isLocating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Navigation className="w-3 h-3" />}
            <span>GPS</span>
          </button>
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="w-3.5 h-3.5" style={{ color: "var(--color-text-muted)" }} />
        </div>

        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border transition-all duration-200 outline-none font-medium"
          style={{
            backgroundColor: "var(--color-bg-subtle)",
            borderColor: selectedLocation ? "var(--color-accent)" : "var(--color-border)",
            color: "var(--color-text)",
          }}
        />

        {selectedLocation && (
          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center">
            <span
              className="w-4 h-4 rounded-full flex items-center justify-center text-white shadow-2xs"
              style={{ backgroundColor: "var(--color-accent)" }}
              title={`Location: ${selectedLocation.verificationStatus.replace("_", " ")}`}
            >
              <Check className="w-2.5 h-2.5" />
            </span>
          </div>
        )}
      </div>

      {selectedLocation && (
        <div className="mt-1 flex items-center justify-between text-[10px]" style={{ color: "var(--color-text-muted)" }}>
          <span className="truncate max-w-[260px] font-sans flex items-center gap-1">
            {selectedLocation.verificationStatus === "verified_search" && (
              <span className="text-emerald-500 font-semibold">• Verified OSM</span>
            )}
            {selectedLocation.verificationStatus === "user_placed_pin" && (
              <span className="text-amber-500 font-semibold">• User Pin</span>
            )}
            {selectedLocation.verificationStatus === "browser_gps" && (
              <span className="text-teal-500 font-semibold">• Current GPS</span>
            )}
            <span className="truncate">
              {selectedLocation.displayName.split(",").slice(1, 3).join(",").trim()}
            </span>
          </span>
          <span className="font-mono tabular-nums shrink-0">
            {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
          </span>
        </div>
      )}

      {/* Autocomplete Results Dropdown */}
      {isOpen && (
        <div
          className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl shadow-xl border overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150"
          style={{
            backgroundColor: "var(--color-bg-elevated)",
            borderColor: "var(--color-border)",
            maxHeight: "280px",
          }}
        >
          {isLoading && (
            <div className="p-3 text-center text-xs flex items-center justify-center gap-2" style={{ color: "var(--color-text-muted)" }}>
              <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: "var(--color-accent)" }} />
              <span>Searching real places in Kerala...</span>
            </div>
          )}

          {errorMessage && !isLoading && (
            <div className="p-3 text-xs space-y-2" style={{ color: "var(--color-text-muted)" }}>
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
              {onOpenMapPicker && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenMapPicker();
                  }}
                  className="w-full py-1.5 px-2 rounded-lg text-xs font-semibold text-center border flex items-center justify-center gap-1.5 cursor-pointer hover:bg-slate-500/10"
                  style={{
                    borderColor: "var(--color-border)",
                    color: "var(--color-accent)",
                  }}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Place Pin on Interactive Map</span>
                </button>
              )}
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <div className="overflow-y-auto max-h-[240px] divide-y" style={{ borderColor: "var(--color-border-subtle)" }}>
              {results.map((item, idx) => (
                <button
                  key={`${item.lat}-${item.lng}-${idx}`}
                  type="button"
                  onClick={() => handleSelectResult(item)}
                  className="w-full text-left px-3.5 py-2.5 text-xs transition-colors hover:bg-slate-500/10 flex items-start gap-2.5 cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "var(--color-accent)" }} />
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold truncate flex items-center justify-between" style={{ color: "var(--color-text)" }}>
                      <span>{item.name}</span>
                      {item.type && (
                        <span className="text-[9px] uppercase px-1.5 py-0.2 rounded-full font-mono font-bold" style={{ backgroundColor: "var(--color-accent-subtle)", color: "var(--color-accent)" }}>
                          {item.type}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] truncate mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                      {item.displayName}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
