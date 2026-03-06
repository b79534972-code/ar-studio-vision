/**
 * Desktop Viewer Engine — Three.js 3D orbit viewer (no AR session)
 *
 * Used on desktop browsers where WebXR AR is not available.
 * Renders a 3D model with OrbitControls for inspection.
 */

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { IAREngine, AREngineConfig, ARPlatform } from "../types";

export class DesktopViewerEngine implements IAREngine {
  readonly platform: ARPlatform = "desktop";

  private config: AREngineConfig | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private controls: OrbitControls | null = null;
  private animationId: number | null = null;
  private resizeHandler: (() => void) | null = null;

  async init(config: AREngineConfig): Promise<void> {
    this.config = config;
  }

  async start(): Promise<void> {
    if (!this.config) throw new Error("DesktopViewerEngine not initialized");

    const { container, modelUrl, onStateChange, onError } = this.config;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);
    this.renderer = renderer;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    this.scene = scene;

    // Camera
    const aspect = container.clientWidth / container.clientHeight;
    const camera = new THREE.PerspectiveCamera(50, aspect, 0.01, 100);
    camera.position.set(2, 1.5, 3);
    this.camera = camera;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 0.3, 0);
    controls.update();
    this.controls = controls;

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(3, 5, 4);
    scene.add(dirLight);

    // Ground plane
    const gridHelper = new THREE.GridHelper(
      100,   // rộng 100m
      200,   // subdivisions
      0xcccccc,
      0xe0e0e0
    );
    scene.add(gridHelper);

    // Load model
    if (modelUrl) {
      const loader = new GLTFLoader();
      loader.load(
        modelUrl,
        (gltf) => {
          scene.add(gltf.scene);
          onStateChange?.("ready");
        },
        undefined,
        () => {
          this.addPlaceholder(scene);
          onStateChange?.("ready");
        }
      );
    } else {
      this.addPlaceholder(scene);
      onStateChange?.("ready");
    }

    // Resize
    this.resizeHandler = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", this.resizeHandler);

    // Render loop
    const animate = () => {
      this.animationId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();
  }

  dispose(): void {
    if (this.animationId !== null) cancelAnimationFrame(this.animationId);
    if (this.resizeHandler) window.removeEventListener("resize", this.resizeHandler);
    if (this.controls) this.controls.dispose();
    if (this.renderer) {
      this.renderer.domElement.remove();
      this.renderer.dispose();
    }
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.controls = null;
    this.config = null;
  }

  private addPlaceholder(scene: THREE.Scene): void {
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

    scene.add(group);
  }
}
