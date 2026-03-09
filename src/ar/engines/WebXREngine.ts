/**
 * WebXR Engine — Fully self-contained WebXR AR engine.
 *
 * Owns ALL WebXR logic:
 * - Three.js renderer, scene, camera
 * - XR session lifecycle
 * - Hit-test & surface detection
 * - Reticle rendering
 * - Model loading & placement
 * - Touch gestures (drag, pinch-to-scale, two-finger rotate)
 * - Cleanup & disposal
 *
 * This is a framework-agnostic class. No React imports.
 * The React layer communicates via onStateChange / onError callbacks.
 */

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { IAREngine, AREngineConfig, ARPlatform, AREngineState } from "../types";

interface GestureState {
  isDragging: boolean;
  initialPinchDistance: number | null;
  initialRotationAngle: number | null;
  lastRotationAngle: number | null;
}

export class WebXREngine implements IAREngine {
  readonly platform: ARPlatform = "webxr";

  private config: AREngineConfig | null = null;

  // Three.js core
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;

  // XR
  private session: XRSession | null = null;
  private hitTestSource: XRHitTestSource | null = null;
  private referenceSpace: XRReferenceSpace | null = null;

  // AR objects
  private reticle: THREE.Mesh | null = null;
  private placedModel: THREE.Group | null = null;
  private lastHitPose: { position: THREE.Vector3; quaternion: THREE.Quaternion } | null = null;

  // Gestures
  private gesture: GestureState = {
    isDragging: false,
    initialPinchDistance: null,
    initialRotationAngle: null,
    lastRotationAngle: null,
  };
  private raycaster = new THREE.Raycaster();

  // State
  private currentState: AREngineState = "idle";

  // Bound event handlers (for cleanup)
  private boundOnTouchStart: ((e: TouchEvent) => void) | null = null;
  private boundOnTouchMove: ((e: TouchEvent) => void) | null = null;
  private boundOnTouchEnd: ((e: TouchEvent) => void) | null = null;

  // Model preloading
  private preloadedModel: THREE.Group | null = null;

  // ─── IAREngine interface ───────────────────────────────

  async init(config: AREngineConfig): Promise<void> {
    this.config = config;

    // Check WebXR support
    if (!("xr" in navigator)) {
      throw new Error("WebXR is not available in this browser.");
    }

    const supported = await (navigator as any).xr.isSessionSupported("immersive-ar");
    if (!supported) {
      throw new Error("WebXR immersive-ar sessions are not supported on this device.");
    }

    // Pre-load GLB model during init so it's ready when user taps
    if (config.modelUrl) {
      try {
        console.log("[WebXR] Pre-loading model:", config.modelUrl);
        this.preloadedModel = await this.preloadModel(config.modelUrl);
        console.log("[WebXR] Model pre-loaded successfully");
      } catch (err) {
        console.warn("[WebXR] Model pre-load failed, will use placeholder:", err);
        this.preloadedModel = null;
      }
    }
  }

  async start(): Promise<void> {
    if (!this.config) throw new Error("WebXREngine not initialized");

    const { container, onStateChange, onError } = this.config;

    try {
      // Renderer — use lower pixel ratio on mobile for performance
      const renderer = new THREE.WebGLRenderer({
        antialias: false, // disable on mobile for perf
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.xr.enabled = true;
      container.appendChild(renderer.domElement);
      this.renderer = renderer;

      // Scene
      const scene = new THREE.Scene();
      this.scene = scene;

      // Camera
      const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
      this.camera = camera;

      // Lighting — keep it simple for mobile perf
      scene.add(new THREE.AmbientLight(0xffffff, 1.2));
      const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
      dirLight.position.set(0, 5, 5);
      scene.add(dirLight);

      // Reticle
      const reticle = this.createReticle();
      scene.add(reticle);
      this.reticle = reticle;

      // Request XR session
      console.log("[WebXR] Requesting immersive-ar session...");
      const session = await (navigator as any).xr.requestSession("immersive-ar", {
        requiredFeatures: ["hit-test"],
        optionalFeatures: ["dom-overlay", "local-floor"],
        domOverlay: { root: container },
      });
      this.session = session;
      console.log("[WebXR] Session obtained");

      // Try local-floor first (better surface detection on Android), fallback to local
      let refSpaceType: XRReferenceSpaceType = "local-floor";
      try {
        renderer.xr.setReferenceSpaceType("local-floor");
        await renderer.xr.setSession(session);
        const refSpace = await session.requestReferenceSpace("local-floor");
        this.referenceSpace = refSpace;
        console.log("[WebXR] Using local-floor reference space");
      } catch {
        console.log("[WebXR] local-floor not available, falling back to local");
        refSpaceType = "local";
        renderer.xr.setReferenceSpaceType("local");
        await renderer.xr.setSession(session);
        const refSpace = await session.requestReferenceSpace("local");
        this.referenceSpace = refSpace;
      }

      // Hit-test source
      try {
        const viewerSpace = await session.requestReferenceSpace("viewer");
        const hitTestSource = await session.requestHitTestSource!({ space: viewerSpace });
        this.hitTestSource = hitTestSource;
        console.log("[WebXR] Hit-test source created");
      } catch (err) {
        console.error("[WebXR] Failed to create hit-test source:", err);
        onError?.("Hit-test is not supported on this device. Try updating Chrome.");
        this.setState("error");
        return;
      }

      // Tap-to-place
      session.addEventListener("select", () => this.onSelect());

      // Session end
      session.addEventListener("end", () => this.cleanup());

      // Touch gestures
      this.attachGestureListeners(container);

      this.setState("scanning");
      console.log("[WebXR] AR session started, scanning for surfaces...");

      // Render loop
      renderer.setAnimationLoop((_timestamp: number, frame?: XRFrame) => {
        if (!frame) return;
        this.onFrame(frame);
        renderer.render(scene, camera);
      });
    } catch (err: any) {
      console.error("[WebXR] AR session error:", err);
      onError?.(err.message || "Failed to start AR session");
      this.setState("error");
    }
  }

  dispose(): void {
    if (this.session) {
      try { this.session.end(); } catch { /* already ended */ }
    }
    this.cleanup();
  }

  resetPlacement(): void {
    if (!this.scene || !this.placedModel) return;

    this.scene.remove(this.placedModel);
    this.placedModel.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) {
        const mat = mesh.material;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else mat.dispose();
      }
    });
    this.placedModel = null;

    if (this.reticle) this.reticle.visible = false;
    this.lastHitPose = null;
    this.setState("scanning");
  }

  // ─── Internal ──────────────────────────────────────────

  private setState(state: AREngineState): void {
    this.currentState = state;
    this.config?.onStateChange?.(state);
  }

  private createReticle(): THREE.Mesh {
    const geo = new THREE.RingGeometry(0.28, 0.35, 64)
      .rotateX(-Math.PI / 2);

    const mat = new THREE.MeshBasicMaterial({
      color: 0x4355db,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
      depthTest: false
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.matrixAutoUpdate = false;
    mesh.visible = false;

    return mesh;
  }

  private onFrame(frame: XRFrame): void {
    const { hitTestSource, referenceSpace, reticle } = this;
    if (!hitTestSource || !referenceSpace || !reticle) return;

    const results = frame.getHitTestResults(hitTestSource);

    if (results.length > 0) {
      const pose = results[0].getPose(referenceSpace);
      if (pose) {
        reticle.visible = true;
        reticle.matrix.fromArray(pose.transform.matrix);

        // Decompose for placement
        const pos = new THREE.Vector3();
        const quat = new THREE.Quaternion();
        const scale = new THREE.Vector3();
        new THREE.Matrix4().fromArray(pose.transform.matrix).decompose(pos, quat, scale);
        this.lastHitPose = { position: pos, quaternion: quat };

        if (this.currentState === "scanning") {
          console.log("[WebXR] Surface detected! Ready to place.");
          this.setState("ready");
        }
      }
    } else {
      reticle.visible = false;
      if (this.currentState === "ready") {
        this.setState("scanning");
      }
      this.lastHitPose = null;
    }
  }

  private onSelect(): void {
    if (this.currentState !== "ready" || !this.lastHitPose) return;

    console.log("[WebXR] Tap detected — placing model at:", this.lastHitPose.position.toArray());
    if (this.reticle) this.reticle.visible = false;
    this.placeModel(this.lastHitPose);
    this.setState("placed");
  }

  /** Place model using pre-loaded GLB or fallback to placeholder */
  private placeModel(pose: { position: THREE.Vector3; quaternion: THREE.Quaternion }): void {
    if (!this.scene) return;

    if (this.preloadedModel) {
      console.log("[WebXR] Using pre-loaded model");
      const model = this.preloadedModel.clone();
      model.position.copy(pose.position);
      model.quaternion.copy(pose.quaternion);
      this.scene.add(model);
      this.placedModel = model;
    } else {
      console.log("[WebXR] No pre-loaded model, trying live load...");
      this.loadModelLive(pose);
    }
  }

  /** Pre-load a GLB model and return the scene group */
  private preloadModel(url: string): Promise<THREE.Group> {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();
      loader.load(
        url,
        (gltf) => resolve(gltf.scene as unknown as THREE.Group),
        (progress) => {
          if (progress.total > 0) {
            console.log(`[WebXR] Model loading: ${Math.round((progress.loaded / progress.total) * 100)}%`);
          }
        },
        (err) => reject(err)
      );
    });
  }

  /** Live-load model (fallback if pre-load failed) */
  private loadModelLive(pose: { position: THREE.Vector3; quaternion: THREE.Quaternion }): void {
    if (!this.scene) return;
    const modelUrl = this.config?.modelUrl;

    if (modelUrl) {
      const loader = new GLTFLoader();
      loader.load(
        modelUrl,
        (gltf) => {
          console.log("[WebXR] Live model loaded successfully");
          const model = gltf.scene;
          model.position.copy(pose.position);
          model.quaternion.copy(pose.quaternion);
          this.scene!.add(model);
          this.placedModel = model as unknown as THREE.Group;
        },
        undefined,
        (err) => {
          console.warn("[WebXR] GLB load failed, using placeholder:", err);
          this.placePlaceholder(pose);
        }
      );
    } else {
      console.log("[WebXR] No model URL, using placeholder");
      this.placePlaceholder(pose);
    }
  }

  private placePlaceholder(pose: { position: THREE.Vector3; quaternion: THREE.Quaternion }): void {
    if (!this.scene) return;

    const mat = new THREE.MeshStandardMaterial({ color: 0x4355db, roughness: 0.6 });
    const group = new THREE.Group();

    const base = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.4, 0.8), mat);
    base.position.y = 0.2;
    group.add(base);

    const back = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.4, 0.15), mat);
    back.position.set(0, 0.5, -0.325);
    group.add(back);

    const armGeo = new THREE.BoxGeometry(0.15, 0.3, 0.8);
    const armL = new THREE.Mesh(armGeo, mat);
    armL.position.set(-0.825, 0.35, 0);
    group.add(armL);
    const armR = new THREE.Mesh(armGeo, mat);
    armR.position.set(0.825, 0.35, 0);
    group.add(armR);

    group.position.copy(pose.position);
    group.quaternion.copy(pose.quaternion);
    this.scene.add(group);
    this.placedModel = group;
  }

  // ─── Gesture handling ──────────────────────────────────

  private attachGestureListeners(container: HTMLElement): void {
    this.boundOnTouchStart = (e) => this.onTouchStart(e);
    this.boundOnTouchMove = (e) => this.onTouchMove(e);
    this.boundOnTouchEnd = (e) => this.onTouchEnd(e);

    container.addEventListener("touchstart", this.boundOnTouchStart, { passive: true });
    container.addEventListener("touchmove", this.boundOnTouchMove, { passive: true });
    container.addEventListener("touchend", this.boundOnTouchEnd, { passive: true });
  }

  private detachGestureListeners(): void {
    const container = this.config?.container;
    if (!container) return;

    if (this.boundOnTouchStart) container.removeEventListener("touchstart", this.boundOnTouchStart);
    if (this.boundOnTouchMove) container.removeEventListener("touchmove", this.boundOnTouchMove);
    if (this.boundOnTouchEnd) container.removeEventListener("touchend", this.boundOnTouchEnd);

    this.boundOnTouchStart = null;
    this.boundOnTouchMove = null;
    this.boundOnTouchEnd = null;
  }

  private onTouchStart(e: TouchEvent): void {
    if (this.currentState !== "placed" || !this.placedModel) return;

    if (e.touches.length === 1) {
      const touch = e.touches[0];
      if (!this.camera || !this.renderer) return;

      const coords = new THREE.Vector2(
        (touch.clientX / window.innerWidth) * 2 - 1,
        -(touch.clientY / window.innerHeight) * 2 + 1
      );
      this.raycaster.setFromCamera(coords, this.camera);
      const intersects = this.raycaster.intersectObject(this.placedModel, true);
      if (intersects.length > 0) {
        this.gesture.isDragging = true;
      }
    } else if (e.touches.length === 2) {
      this.gesture.isDragging = false;
      this.gesture.initialPinchDistance = this.getTouchDistance(e.touches[0], e.touches[1]);
      this.gesture.initialRotationAngle = this.getTouchAngle(e.touches[0], e.touches[1]);
      this.gesture.lastRotationAngle = this.gesture.initialRotationAngle;
    }
  }

  private onTouchMove(e: TouchEvent): void {
    if (this.currentState !== "placed" || !this.placedModel) return;

    if (e.touches.length === 1 && this.gesture.isDragging) {
      if (this.lastHitPose) {
        this.placedModel.position.copy(this.lastHitPose.position);
      }
    } else if (e.touches.length === 2) {
      const model = this.placedModel;

      // Pinch to scale
      if (this.gesture.initialPinchDistance !== null) {
        const newDist = this.getTouchDistance(e.touches[0], e.touches[1]);
        const scaleFactor = newDist / this.gesture.initialPinchDistance;
        model.scale.setScalar(Math.max(0.3, Math.min(3.0, scaleFactor)));
      }

      // Two-finger rotate
      if (this.gesture.lastRotationAngle !== null) {
        const newAngle = this.getTouchAngle(e.touches[0], e.touches[1]);
        const delta = newAngle - this.gesture.lastRotationAngle;
        model.rotation.y += delta;
        this.gesture.lastRotationAngle = newAngle;
      }
    }
  }

  private onTouchEnd(e: TouchEvent): void {
    if (e.touches.length < 2) {
      this.gesture.initialPinchDistance = null;
      this.gesture.initialRotationAngle = null;
      this.gesture.lastRotationAngle = null;
    }
    if (e.touches.length === 0) {
      this.gesture.isDragging = false;
    }
  }

  private getTouchDistance(t1: Touch, t2: Touch): number {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private getTouchAngle(t1: Touch, t2: Touch): number {
    return Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX);
  }

  // ─── Cleanup ───────────────────────────────────────────

  private cleanup(): void {
    this.detachGestureListeners();

    if (this.hitTestSource) {
      this.hitTestSource.cancel();
      this.hitTestSource = null;
    }
    if (this.renderer) {
      this.renderer.setAnimationLoop(null);
      this.renderer.domElement.remove();
      this.renderer.dispose();
      this.renderer = null;
    }

    // Dispose pre-loaded model
    if (this.preloadedModel) {
      this.preloadedModel.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) {
          const mat = mesh.material;
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
          else mat.dispose();
        }
      });
      this.preloadedModel = null;
    }

    this.scene = null;
    this.camera = null;
    this.session = null;
    this.referenceSpace = null;
    this.reticle = null;
    this.placedModel = null;
    this.lastHitPose = null;
    this.setState("idle");
  }
}
