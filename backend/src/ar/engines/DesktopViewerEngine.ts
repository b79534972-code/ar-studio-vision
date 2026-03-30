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
  private static readonly TARGET_MODEL_MAX_DIM = 2.2;

  private config: AREngineConfig | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private controls: OrbitControls | null = null;
  private animationId: number | null = null;
  private resizeHandler: (() => void) | null = null;
  private floor: THREE.Mesh | null = null;
  private grid: THREE.GridHelper | null = null;

  async init(config: AREngineConfig): Promise<void> {
    this.config = config;
  }

  async start(): Promise<void> {
    if (!this.config) throw new Error("DesktopViewerEngine not initialized");

    const { container, modelUrl, onStateChange, onError } = this.config;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    this.renderer = renderer;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf6f3ee);
    this.scene = scene;

    // Camera
    const aspect = container.clientWidth / container.clientHeight;
    const camera = new THREE.PerspectiveCamera(50, aspect, 0.01, 100);
    camera.position.set(2.8, 1.8, 3.8);
    this.camera = camera;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = true;
    controls.screenSpacePanning = true;
    controls.minPolarAngle = 0.2;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.target.set(0, 0.3, 0);
    controls.update();
    this.controls = controls;

    // Lighting
    scene.add(new THREE.HemisphereLight(0xfffaf2, 0xd7d2c7, 1.1));

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(4, 7, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 30;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xfff4dd, 0.55);
    fillLight.position.set(-3, 3, -2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xe6f0ff, 0.35);
    rimLight.position.set(-2, 4, 6);
    scene.add(rimLight);

    // Ground plane and grid scale dynamically once the model bounds are known.
    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(1, 64),
      new THREE.ShadowMaterial({ color: 0x000000, opacity: 0.14 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.001;
    floor.receiveShadow = true;
    floor.scale.setScalar(4);
    scene.add(floor);
    this.floor = floor;

    const gridHelper = new THREE.GridHelper(1, 12, 0xd2cbc0, 0xe7e0d4);
    const gridMaterial = Array.isArray(gridHelper.material) ? gridHelper.material : [gridHelper.material];
    gridMaterial.forEach((material) => {
      material.transparent = true;
      material.opacity = 0.4;
    });
    gridHelper.position.y = 0;
    gridHelper.scale.setScalar(4);
    scene.add(gridHelper);
    this.grid = gridHelper;

    // Load model
    onStateChange?.("scanning");
    if (modelUrl) {
      const loader = new GLTFLoader();
      loader.load(
        modelUrl,
        (gltf) => {
          const prepared = this.prepareModel(gltf.scene);
          scene.add(prepared);
          this.frameObject(prepared);
          onStateChange?.("ready");
        },
        undefined,
        () => {
          const placeholder = this.addPlaceholder(scene);
          this.frameObject(placeholder);
          onStateChange?.("ready");
        }
      );
    } else {
      const placeholder = this.addPlaceholder(scene);
      this.frameObject(placeholder);
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
    if (this.scene) {
      this.scene.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (mesh.geometry) {
          mesh.geometry.dispose();
        }
        const material = mesh.material;
        if (Array.isArray(material)) {
          material.forEach((entry) => entry.dispose());
        } else {
          material?.dispose();
        }
      });
    }
    if (this.renderer) {
      this.renderer.domElement.remove();
      this.renderer.dispose();
    }
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.controls = null;
    this.floor = null;
    this.grid = null;
    this.config = null;
  }

  private prepareModel(model: THREE.Object3D): THREE.Group {
    const wrapper = new THREE.Group();
    wrapper.add(model);

    model.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    });

    let bounds = new THREE.Box3().setFromObject(model);
    const size = bounds.getSize(new THREE.Vector3());
    const longest = Math.max(size.x, size.y, size.z);

    if (Number.isFinite(longest) && longest > 0) {
      const scaleFactor = DesktopViewerEngine.TARGET_MODEL_MAX_DIM / longest;
      model.scale.multiplyScalar(scaleFactor);
      model.updateMatrixWorld(true);
      bounds = new THREE.Box3().setFromObject(model);
    }

    const center = bounds.getCenter(new THREE.Vector3());
    if (Number.isFinite(center.x) && Number.isFinite(center.y) && Number.isFinite(center.z)) {
      model.position.x -= center.x;
      model.position.y -= bounds.min.y;
      model.position.z -= center.z;
    }

    return wrapper;
  }

  private frameObject(object: THREE.Object3D): void {
    if (!this.camera || !this.controls) return;

    const bounds = new THREE.Box3().setFromObject(object);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());

    const validBounds = [size.x, size.y, size.z, center.x, center.y, center.z].every((v) => Number.isFinite(v));
    if (!validBounds) {
      this.camera.position.set(2.8, 1.8, 3.8);
      this.controls.target.set(0, 0.6, 0);
      this.controls.minDistance = 0.6;
      this.controls.maxDistance = 14;
      this.controls.update();
      return;
    }

    const maxDim = Math.max(size.x, size.y, size.z, 0.1);
    const halfFovY = THREE.MathUtils.degToRad(this.camera.fov / 2);
    const fitHeightDistance = size.y / (2 * Math.tan(halfFovY));
    const fitWidthDistance = size.x / (2 * Math.tan(halfFovY) * this.camera.aspect);
    const distance = Math.max(fitHeightDistance, fitWidthDistance, size.z) * 1.5;

    this.camera.near = Math.max(0.01, maxDim / 100);
    this.camera.far = Math.max(50, maxDim * 30);
    this.camera.position.set(
      center.x + distance * 0.72,
      center.y + size.y * 0.45 + distance * 0.22,
      center.z + distance
    );
    this.camera.updateProjectionMatrix();

    this.controls.target.copy(center);
    this.controls.minDistance = Math.max(0.2, maxDim * 0.7);
    this.controls.maxDistance = Math.max(4, maxDim * 6);
    this.controls.update();

    const stageSize = Math.max(3.5, maxDim * 3.2);
    if (this.floor) {
      this.floor.scale.setScalar(stageSize * 0.5);
    }
    if (this.grid) {
      this.grid.scale.setScalar(stageSize);
    }
  }

  private addPlaceholder(scene: THREE.Scene): THREE.Group {
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

    group.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    });

    scene.add(group);
    return group;
  }
}
