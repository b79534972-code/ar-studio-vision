/**
 * AR Engine Architecture — Shared Types & Interface
 *
 * All platform-specific engines implement IAREngine.
 * ARModeManager is the sole selector — no platform conditionals inside engines.
 */

export type ARPlatform = "webxr" | "quicklook" | "desktop";

export type AREngineState = "idle" | "scanning" | "ready" | "placed" | "error";

export interface AREngineConfig {
  /** Container element for rendering */
  container: HTMLElement;
  /** URL to a GLB/GLTF model (optional — engines may use placeholder) */
  modelUrl?: string;
  /** URL to a USDZ model (required for QuickLook engine) */
  usdzUrl?: string;
  /** Callback when engine state changes */
  onStateChange?: (state: AREngineState) => void;
  /** Callback on error */
  onError?: (error: string) => void;
}

export interface IAREngine {
  /** The platform this engine targets */
  readonly platform: ARPlatform;
  /** Initialize the engine with config */
  init(config: AREngineConfig): Promise<void>;
  /** Start the AR/3D experience */
  start(): Promise<void>;
  /** Clean up all resources */
  dispose(): void;
  /** Reset placed objects (return to placement mode) */
  resetPlacement?(): void;
}
