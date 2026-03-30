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
  lastPinchDistance: number | null;
  initialRotationAngle: number | null;
  lastRotationAngle: number | null;
}

export class WebXREngine implements IAREngine {
  readonly platform: ARPlatform = "webxr";

  private static webXRSupportPromise: Promise<boolean> | null = null;

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
    lastPinchDistance: null,
    initialRotationAngle: null,
    lastRotationAngle: null,
  };
  private raycaster = new THREE.Raycaster();
  private dragPlane = new THREE.Plane();
  private dragOffset = new THREE.Vector3();
  private dragIntersection = new THREE.Vector3();
  private gestureTarget: HTMLElement | null = null;

  // Hit-test stability
  private smoothedHitPose: { position: THREE.Vector3; quaternion: THREE.Quaternion } | null = null;
  private lastSurfaceSeenAt = 0;
  private readonly hitSmoothingFactor = 0.35;
  private readonly hitGracePeriodMs = 450;

  // State
  private currentState: AREngineState = "idle";

  // Bound event handlers (for cleanup)
  private boundOnTouchStart: ((e: TouchEvent) => void) | null = null;
  private boundOnTouchMove: ((e: TouchEvent) => void) | null = null;
  private boundOnTouchEnd: ((e: TouchEvent) => void) | null = null;
  private boundOnTouchCancel: ((e: TouchEvent) => void) | null = null;

  // Model preloading
  private preloadedModel: THREE.Group | null = null;
  private preloadedModelPromise: Promise<THREE.Group | null> | null = null;

  // ─── IAREngine interface ───────────────────────────────

  async init(config: AREngineConfig): Promise<void> {
    this.config = config;

    // Check WebXR support
    if (!("xr" in navigator)) {
      throw new Error("WebXR is not available in this browser.");
    }

    const supported = await this.isImmersiveARSupported();
    if (!supported) {
      throw new Error("WebXR immersive-ar sessions are not supported on this device.");
    }

    // Start model preload in background so Start AR is not blocked by GLB download.
    if (config.modelUrl) {
      if (!this.preloadedModelPromise) {
        console.log("[WebXR] Pre-loading model in background:", config.modelUrl);
        this.preloadedModelPromise = this.preloadModel(config.modelUrl)
          .then((model) => {
            this.preloadedModel = model;
            console.log("[WebXR] Background model pre-load completed");
            return model;
          })
          .catch((err) => {
            console.warn("[WebXR] Background pre-load failed, will use live load/placeholder:", err);
            this.preloadedModel = null;
            return null;
          });
      }
    }
  }

  private async isImmersiveARSupported(): Promise<boolean> {
    if (!WebXREngine.webXRSupportPromise) {
      const xr = (navigator as Navigator & { xr: XRSystem }).xr;
      WebXREngine.webXRSupportPromise = xr.isSessionSupported("immersive-ar").catch(() => false);
    }
    return WebXREngine.webXRSupportPromise;
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
      renderer.domElement.style.touchAction = "none";
      renderer.domElement.style.webkitUserSelect = "none";
      container.appendChild(renderer.domElement);
      container.style.touchAction = "none";
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
      const session = await (navigator as Navigator & { xr: XRSystem }).xr.requestSession("immersive-ar", {
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
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to start AR session";
      console.error("[WebXR] AR session error:", err);
      onError?.(errorMessage);
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
    this.smoothedHitPose = null;
    this.lastSurfaceSeenAt = 0;
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
    const now = performance.now();

    if (results.length > 0) {
      const pose = results[0].getPose(referenceSpace);
      if (pose) {
        const rawPos = new THREE.Vector3();
        const rawQuat = new THREE.Quaternion();
        const scale = new THREE.Vector3();
        new THREE.Matrix4().fromArray(pose.transform.matrix).decompose(rawPos, rawQuat, scale);

        if (!this.smoothedHitPose) {
          this.smoothedHitPose = {
            position: rawPos.clone(),
            quaternion: rawQuat.clone(),
          };
        } else {
          this.smoothedHitPose.position.lerp(rawPos, this.hitSmoothingFactor);
          this.smoothedHitPose.quaternion.slerp(rawQuat, this.hitSmoothingFactor);
        }

        const hitMatrix = new THREE.Matrix4().compose(
          this.smoothedHitPose.position,
          this.smoothedHitPose.quaternion,
          new THREE.Vector3(1, 1, 1)
        );

        reticle.visible = this.currentState !== "placed" && !this.gesture.isDragging;
        reticle.matrix.copy(hitMatrix);

        this.lastHitPose = {
          position: this.smoothedHitPose.position.clone(),
          quaternion: this.smoothedHitPose.quaternion.clone(),
        };
        this.lastSurfaceSeenAt = now;

        if (this.currentState === "scanning") {
          console.log("[WebXR] Surface detected! Ready to place.");
          this.setState("ready");
        }
      }
    } else {
      const recentlyTracked = now - this.lastSurfaceSeenAt <= this.hitGracePeriodMs;
      if (recentlyTracked && this.lastHitPose) {
        const holdMatrix = new THREE.Matrix4().compose(
          this.lastHitPose.position,
          this.lastHitPose.quaternion,
          new THREE.Vector3(1, 1, 1)
        );
        reticle.visible = this.currentState !== "placed" && !this.gesture.isDragging;
        reticle.matrix.copy(holdMatrix);
      } else {
        reticle.visible = false;
        this.lastHitPose = null;
        this.smoothedHitPose = null;

        if (this.currentState === "ready") {
          this.setState("scanning");
        }
      }
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
    this.boundOnTouchCancel = (e) => this.onTouchEnd(e);

    const target = this.renderer?.domElement ?? container;
    this.gestureTarget = target;

    target.addEventListener("touchstart", this.boundOnTouchStart, { passive: false });
    target.addEventListener("touchmove", this.boundOnTouchMove, { passive: false });
    target.addEventListener("touchend", this.boundOnTouchEnd, { passive: true });
    target.addEventListener("touchcancel", this.boundOnTouchCancel, { passive: true });
  }

  private detachGestureListeners(): void {
    const target = this.gestureTarget;
    if (!target) return;

    if (this.boundOnTouchStart) target.removeEventListener("touchstart", this.boundOnTouchStart);
    if (this.boundOnTouchMove) target.removeEventListener("touchmove", this.boundOnTouchMove);
    if (this.boundOnTouchEnd) target.removeEventListener("touchend", this.boundOnTouchEnd);
    if (this.boundOnTouchCancel) target.removeEventListener("touchcancel", this.boundOnTouchCancel);

    this.boundOnTouchStart = null;
    this.boundOnTouchMove = null;
    this.boundOnTouchEnd = null;
    this.boundOnTouchCancel = null;
    this.gestureTarget = null;
  }

  private touchToNdc(touch: Touch): THREE.Vector2 {
    const rect = this.renderer?.domElement.getBoundingClientRect();
    const width = rect?.width ?? window.innerWidth;
    const height = rect?.height ?? window.innerHeight;
    const offsetX = rect?.left ?? 0;
    const offsetY = rect?.top ?? 0;

    return new THREE.Vector2(
      ((touch.clientX - offsetX) / Math.max(width, 1)) * 2 - 1,
      -((touch.clientY - offsetY) / Math.max(height, 1)) * 2 + 1
    );
  }

  private onTouchStart(e: TouchEvent): void {
    if (this.currentState !== "placed" || !this.placedModel) return;

    e.preventDefault();

    if (e.touches.length === 1) {
      const touch = e.touches[0];
      if (!this.camera || !this.renderer) return;

      const coords = this.touchToNdc(touch);
      this.raycaster.setFromCamera(coords, this.camera);

      // Move on a horizontal plane at the model's current height.
      this.dragPlane.setFromNormalAndCoplanarPoint(
        new THREE.Vector3(0, 1, 0),
        this.placedModel.position
      );

      if (this.raycaster.ray.intersectPlane(this.dragPlane, this.dragIntersection)) {
        this.dragOffset.copy(this.placedModel.position).sub(this.dragIntersection);
        this.gesture.isDragging = true;
      } else {
        this.gesture.isDragging = false;
      }
    } else if (e.touches.length === 2) {
      this.gesture.isDragging = false;
      this.gesture.initialPinchDistance = this.getTouchDistance(e.touches[0], e.touches[1]);
      this.gesture.lastPinchDistance = this.gesture.initialPinchDistance;
      this.gesture.initialRotationAngle = this.getTouchAngle(e.touches[0], e.touches[1]);
      this.gesture.lastRotationAngle = this.gesture.initialRotationAngle;
    }
  }

  private onTouchMove(e: TouchEvent): void {
    if (this.currentState !== "placed" || !this.placedModel) return;

    e.preventDefault();

    if (e.touches.length === 1 && this.gesture.isDragging) {
      if (!this.camera) return;

      const touch = e.touches[0];
      const coords = this.touchToNdc(touch);

      this.raycaster.setFromCamera(coords, this.camera);
      if (this.raycaster.ray.intersectPlane(this.dragPlane, this.dragIntersection)) {
        this.placedModel.position.copy(this.dragIntersection.add(this.dragOffset));
      }
    } else if (e.touches.length === 2) {
      const model = this.placedModel;

      // Pinch to scale (incremental ratio improves control on iOS touch screens)
      if (this.gesture.initialPinchDistance !== null && this.gesture.lastPinchDistance !== null) {
        const newDist = this.getTouchDistance(e.touches[0], e.touches[1]);
        const pinchDelta = newDist - this.gesture.lastPinchDistance;
        if (Math.abs(pinchDelta) > 2) {
          const scaleFactor = newDist / this.gesture.lastPinchDistance;
          const nextScale = model.scale.x * scaleFactor;
          model.scale.setScalar(Math.max(0.2, Math.min(4.5, nextScale)));
        }
        this.gesture.lastPinchDistance = newDist;
      }

      // Two-finger rotate — screen-rotation direction matches model-rotation direction
      if (this.gesture.lastRotationAngle !== null) {
        const newAngle = this.getTouchAngle(e.touches[0], e.touches[1]);
        const delta = this.normalizeAngleDelta(newAngle - this.gesture.lastRotationAngle);
        if (Math.abs(delta) > 0.01) {
          model.rotation.y -= delta; // Flip sign for intuitive screen→model mapping
        }
        this.gesture.lastRotationAngle = newAngle;
      }
    }
  }

  private onTouchEnd(e: TouchEvent): void {
    if (e.touches.length < 2) {
      this.gesture.initialPinchDistance = null;
      this.gesture.lastPinchDistance = null;
      this.gesture.initialRotationAngle = null;
      this.gesture.lastRotationAngle = null;
    }
    if (e.touches.length <= 1) {
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

  private normalizeAngleDelta(delta: number): number {
    if (delta > Math.PI) return delta - Math.PI * 2;
    if (delta < -Math.PI) return delta + Math.PI * 2;
    return delta;
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
