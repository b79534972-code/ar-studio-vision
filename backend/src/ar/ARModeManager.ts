/**
 * ARModeManager — Platform detection & engine selection
 *
 * This is the ONLY place where platform conditionals exist.
 * Engines are selected via feature detection first, then UA fallback.
 *
 * Fallback chain: WebXR → QuickLook → Desktop
 */

import type { ARPlatform } from "./types";

export interface DetectionResult {
    platform: ARPlatform;
    reason: string;
}

let detectionPromise: Promise<DetectionResult> | null = null;

/**
 * Detect the best AR platform for the current device.
 * Uses feature detection first, then iOS fallback.
 */
export async function detectPlatform(): Promise<DetectionResult> {
    if (detectionPromise) {
        return detectionPromise;
    }

    detectionPromise = (async () => {
        // Try WebXR feature detection first.
        // Some newer iOS/WebKit builds can expose immersive-ar support.
        if ("xr" in navigator) {
            try {
                const xr = (navigator as Navigator & { xr: XRSystem }).xr;
                const supported = await xr.isSessionSupported("immersive-ar");
                if (supported) {
                    return { platform: "webxr", reason: "WebXR immersive-ar supported" };
                }
            } catch {
                // WebXR API exists but session not supported — continue
            }
        }

        // iOS fallback: use native Quick Look when immersive WebXR is unavailable.
        if (isIOS()) {
            return { platform: "quicklook", reason: "iOS fallback — using AR Quick Look" };
        }

        return { platform: "desktop", reason: "No AR support — using 3D viewer" };
    })();

    return detectionPromise;
}

/**
 * Lazily load the appropriate engine class.
 * Uses dynamic import so unused engines are never bundled for the client.
 */
export async function loadEngine(platform: ARPlatform) {
    switch (platform) {
        case "webxr": {
            const { WebXREngine } = await import("./engines/WebXREngine");
            return new WebXREngine();
        }
        case "quicklook": {
            const { QuickLookEngine } = await import("./engines/QuickLookEngine");
            return new QuickLookEngine();
        }
        case "desktop": {
            const { DesktopViewerEngine } = await import("./engines/DesktopViewerEngine");
            return new DesktopViewerEngine();
        }
        default:
            throw new Error(`Unknown AR platform: ${platform}`);
    }
}

function isIOS(): boolean {
    const ua = navigator.userAgent;
    return /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}
