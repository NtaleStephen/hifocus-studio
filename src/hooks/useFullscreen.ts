import { useCallback } from "react";

// Cross-browser fullscreen element/refs (Safari/older WebKit use webkit-prefixed APIs).
interface FullscreenDocument extends Document {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
}
interface FullscreenElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void> | void;
}

/**
 * Returns a stable `toggleFullscreen` callback that enters/exits fullscreen on
 * the document element, with a WebKit fallback so it works in Safari too.
 * Safe to call during SSR (no-ops when `document` is unavailable).
 */
export function useFullscreen() {
  return useCallback(() => {
    if (typeof document === "undefined") return;
    const doc = document as FullscreenDocument;
    const el = document.documentElement as FullscreenElement;

    const isFullscreen = doc.fullscreenElement ?? doc.webkitFullscreenElement;

    try {
      if (!isFullscreen) {
        if (el.requestFullscreen) {
          void el.requestFullscreen();
        } else if (el.webkitRequestFullscreen) {
          void el.webkitRequestFullscreen();
        }
      } else {
        if (doc.exitFullscreen) {
          void doc.exitFullscreen();
        } else if (doc.webkitExitFullscreen) {
          void doc.webkitExitFullscreen();
        }
      }
    } catch {
      // Fullscreen can be blocked by browser policy — fail quietly.
    }
  }, []);
}
