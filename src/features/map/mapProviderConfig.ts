/**
 * Zero-cost Vector Map Provider Configuration.
 * Powered by OpenFreeMap vector styles (100% free, zero keys, zero billing, zero rate-limits).
 * Reference: https://openfreemap.org/quick_start/
 */

export interface MapProviderConfig {
  id: string;
  name: string;
  lightStyleUrl: string;
  darkStyleUrl: string;
  attribution: string;
  maxZoom: number;
}

export const OPENFREEMAP_CONFIG: MapProviderConfig = {
  id: "openfreemap",
  name: "OpenFreeMap Vector Tiles",
  lightStyleUrl: "https://tiles.openfreemap.org/styles/liberty",
  darkStyleUrl: "https://tiles.openfreemap.org/styles/dark",
  attribution:
    '© <a href="https://openfreemap.org" target="_blank" rel="noopener">OpenFreeMap</a> © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
  maxZoom: 19,
};

// Default center on Kerala [lng, lat]
export const KERALA_MAP_CENTER: [number, number] = [76.2711, 10.8505];
export const KERALA_INITIAL_ZOOM = 8;

/**
 * Checks if WebGL is supported by the current browser environment.
 */
export function isWebGLSupported(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}
