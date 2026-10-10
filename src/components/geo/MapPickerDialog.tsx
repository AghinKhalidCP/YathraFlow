import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import type { GeoLocation } from "../../features/journey/journeyTypes";
import { reverseGeocode, searchLocations } from "../../features/geo/geocodingService";
import { Check, X, Search, Loader2, Navigation, Compass, AlertCircle } from "lucide-react";

interface MapPickerDialogProps {
  isOpen: boolean;
  title?: string;
  initialLocation?: GeoLocation;
  onConfirm: (location: GeoLocation) => void;
  onClose: () => void;
}

export const MapPickerDialog: React.FC<MapPickerDialogProps> = ({
  isOpen,
  title = "Pin Exact Location on Map",
  initialLocation,
  onConfirm,
  onClose,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Default Kerala center (approx Thrissur/Ernakulam)
  const defaultLat = initialLocation?.lat || 10.8505;
  const defaultLng = initialLocation?.lng || 76.2711;

  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({
    lat: defaultLat,
    lng: defaultLng,
  });
  const [resolvedLocation, setResolvedLocation] = useState<GeoLocation | null>(initialLocation || null);
  const [customLabel, setCustomLabel] = useState(initialLocation?.name || "");
  const [isResolving, setIsResolving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Small delay to ensure modal DOM is mounted
    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      const map = L.map(mapContainerRef.current, {
        center: [defaultLat, defaultLng],
        zoom: initialLocation ? 14 : 9,
        zoomControl: false,
      });

      L.control.zoom({ position: "topright" }).addTo(map);

      // OpenStreetMap Tiles with attribution
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Custom pulse pin icon
      const customPinIcon = L.divIcon({
        className: "custom-leaflet-marker",
        html: `<div style="background-color: #0d9488; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2.5px solid #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><div style="width: 10px; height: 10px; background: white; border-radius: 50%; transform: rotate(45deg); margin: auto;"></div></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      const marker = L.marker([defaultLat, defaultLng], {
        draggable: true,
        icon: customPinIcon,
      }).addTo(map);

      const updateCoordinates = async (lat: number, lng: number) => {
        setCurrentCoords({ lat, lng });
        setIsResolving(true);
        try {
          const loc = await reverseGeocode(lat, lng);
          setResolvedLocation(loc);
          if (!customLabel) setCustomLabel(loc.name);
        } catch {
          const fallbackLoc: GeoLocation = {
            id: `pin-${lat.toFixed(5)}-${lng.toFixed(5)}`,
            name: customLabel || `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
            displayName: `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`,
            lat,
            lng,
            verificationStatus: "user_placed_pin",
          };
          setResolvedLocation(fallbackLoc);
        } finally {
          setIsResolving(false);
        }
      };

      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        updateCoordinates(pos.lat, pos.lng);
      });

      map.on("click", (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        updateCoordinates(lat, lng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen, defaultLat, defaultLng, initialLocation]);

  const handleSearchOnMap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !mapInstanceRef.current || !markerRef.current) return;
    setIsSearching(true);
    setSearchError(null);
    try {
      const results = await searchLocations(searchQuery);
      if (results.length > 0) {
        const first = results[0];
        mapInstanceRef.current.setView([first.lat, first.lng], 15);
        markerRef.current.setLatLng([first.lat, first.lng]);
        setCurrentCoords({ lat: first.lat, lng: first.lng });
        setResolvedLocation(first);
        setCustomLabel(first.name);
      } else {
        setSearchError("No results found. Click anywhere on the map to drop the pin manually.");
      }
    } catch {
      setSearchError("Search timed out. You can still pan and click the map to place the pin.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleConfirm = () => {
    const finalName = customLabel.trim() || resolvedLocation?.name || `Location (${currentCoords.lat.toFixed(4)}, ${currentCoords.lng.toFixed(4)})`;
    const locationToSave: GeoLocation = {
      id: resolvedLocation?.id || `user-pin-${Date.now()}`,
      name: finalName,
      displayName: resolvedLocation?.displayName || `Lat: ${currentCoords.lat.toFixed(6)}, Lng: ${currentCoords.lng.toFixed(6)}`,
      lat: currentCoords.lat,
      lng: currentCoords.lng,
      verificationStatus: "user_placed_pin",
    };
    onConfirm(locationToSave);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col"
        style={{
          backgroundColor: "var(--color-bg-elevated)",
          borderColor: "var(--color-border)",
          height: "88vh",
          maxHeight: "720px",
        }}
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b flex items-center justify-between" style={{ borderColor: "var(--color-border)" }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: "var(--color-accent-subtle)" }}>
              <Compass className="w-4 h-4" style={{ color: "var(--color-accent)" }} />
            </div>
            <div>
              <h3 className="text-sm font-bold font-display" style={{ color: "var(--color-text)" }}>{title}</h3>
              <p className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>Drag marker or click map anywhere to set exact coordinates</p>
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

        {/* Search Landmark Bar */}
        <div className="p-3 border-b space-y-1.5" style={{ borderColor: "var(--color-border-subtle)", backgroundColor: "var(--color-bg)" }}>
          <form onSubmit={handleSearchOnMap} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-muted)" }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search junction, hospital, or station to jump map..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border outline-none font-medium"
                style={{
                  backgroundColor: "var(--color-bg-elevated)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)",
                }}
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-xl text-white flex items-center gap-1.5 shrink-0 cursor-pointer hover:scale-[1.02]"
              style={{ backgroundColor: "var(--color-accent)" }}
            >
              {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
              <span>Jump</span>
            </button>
          </form>
          {searchError && (
            <p className="text-[10px] text-amber-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              <span>{searchError}</span>
            </p>
          )}
        </div>

        {/* Map Container */}
        <div className="flex-1 relative w-full h-full min-h-[280px]">
          <div ref={mapContainerRef} className="w-full h-full" style={{ zIndex: 1 }} />
        </div>

        {/* Footer Details, Custom Label & Confirm Action */}
        <div className="p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-subtle)" }}>
          <div className="min-w-0 flex-1 w-full space-y-1 text-left">
            <label className="text-[10px] uppercase font-bold tracking-wider block" style={{ color: "var(--color-accent)" }}>
              Custom Place Name / Label:
            </label>
            <input
              type="text"
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              placeholder="e.g. Main Gate, Station Entrance, Auto Stand"
              className="w-full px-2.5 py-1 rounded-lg border text-xs font-semibold outline-none"
              style={{
                backgroundColor: "var(--color-bg-elevated)",
                borderColor: "var(--color-border)",
                color: "var(--color-text)",
              }}
            />
            <div className="text-[10px] truncate font-mono mt-0.5" style={{ color: "var(--color-text-muted)" }}>
              {isResolving ? "Resolving coordinates..." : `GPS: ${currentCoords.lat.toFixed(6)}, ${currentCoords.lng.toFixed(6)}`}
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 pt-2 sm:pt-0">
            <button
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium rounded-xl border transition-colors cursor-pointer hover:bg-slate-500/10"
              style={{
                borderColor: "var(--color-border)",
                color: "var(--color-text-secondary)",
                backgroundColor: "transparent",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-white flex items-center gap-1.5 shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              style={{ backgroundColor: "var(--color-accent)" }}
            >
              <Check className="w-3.5 h-3.5" />
              <span>Confirm Location</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
