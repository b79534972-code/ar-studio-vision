/**
 * QuickLook Engine — iOS AR Quick Look via USDZ / <model-viewer>
 *
 * On iOS Safari, WebXR is not available.
 * This engine uses Apple's AR Quick Look by creating an <a rel="ar"> link
 * or falling back to <model-viewer> for inline 3D preview.
 *
 * No custom hit-test. No WebXR session. Apple handles placement natively.
 */

import type { IAREngine, AREngineConfig, ARPlatform, AREngineState } from "../types";

export class QuickLookEngine implements IAREngine {
  readonly platform: ARPlatform = "quicklook";

  private config: AREngineConfig | null = null;
  private modelViewer: HTMLElement | null = null;
  private arLink: HTMLAnchorElement | null = null;

  async init(config: AREngineConfig): Promise<void> {
    this.config = config;
  }

  async start(): Promise<void> {
    if (!this.config) throw new Error("QuickLookEngine not initialized");

    const { container, usdzUrl, modelUrl, onStateChange, onError } = this.config;

    // Prefer USDZ for native AR Quick Look
    if (usdzUrl) {
      this.launchQuickLook(usdzUrl);
      onStateChange?.("placed");
      return;
    }

    // Fallback: use <model-viewer> for inline 3D with AR button
    if (modelUrl) {
      await this.createModelViewer(container, modelUrl);
      onStateChange?.("ready");
      return;
    }

    onError?.("No USDZ or GLB model URL provided for iOS AR.");
  }

  dispose(): void {
    if (this.modelViewer && this.modelViewer.parentElement) {
      this.modelViewer.parentElement.removeChild(this.modelViewer);
    }
    if (this.arLink && this.arLink.parentElement) {
      this.arLink.parentElement.removeChild(this.arLink);
    }
    this.modelViewer = null;
    this.arLink = null;
    this.config = null;
  }

  /**
   * Launch native AR Quick Look by programmatically clicking
   * an <a rel="ar"> element pointing to a .usdz file.
   */
  private launchQuickLook(usdzUrl: string): void {
    const a = document.createElement("a");
    a.rel = "ar";
    a.href = usdzUrl;
    a.style.display = "none";

    // iOS requires an <img> child inside the anchor
    const img = document.createElement("img");
    img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    a.appendChild(img);

    document.body.appendChild(a);
    this.arLink = a;

    a.click();
  }

  /**
   * Create a <model-viewer> element for inline 3D preview with
   * AR button on supported iOS devices.
   */
  private async createModelViewer(container: HTMLElement, modelUrl: string): Promise<void> {
    // Dynamically load model-viewer if not already available
    if (!customElements.get("model-viewer")) {
      try {
        // @ts-ignore — model-viewer is an optional runtime dependency
        await import(/* @vite-ignore */ "https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js");
      } catch {
        // model-viewer not installed — create basic fallback
        this.config?.onError?.(
          "model-viewer library not available. Install @google/model-viewer for iOS 3D preview."
        );
        return;
      }
    }

    const mv = document.createElement("model-viewer") as any;
    mv.setAttribute("src", modelUrl);
    mv.setAttribute("ar", "");
    mv.setAttribute("ar-modes", "scene-viewer quick-look");
    mv.setAttribute("camera-controls", "");
    mv.setAttribute("auto-rotate", "");
    mv.setAttribute("shadow-intensity", "1");
    mv.style.width = "100%";
    mv.style.height = "100%";
    mv.style.position = "absolute";
    mv.style.inset = "0";

    container.appendChild(mv);
    this.modelViewer = mv;
  }
}
