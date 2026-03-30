import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { Canvas, useThree, useFrame, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Grid, Environment, ContactShadows, Html } from "@react-three/drei";
import type { PlacedObject, RoomConfig } from "@/types/editor";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

/* ─── Wall detection helper ─── */
type WallPlane = 'floor' | 'front' | 'back' | 'left' | 'right';

const clampPositionToRoom = (
  position: [number, number, number],
  dimensions: { width: number; height: number; depth: number },
  scale: [number, number, number],
  roomConfig: RoomConfig,
  wallType: WallPlane
): [number, number, number] => {
  const scaledW = dimensions.width * scale[0];
  const scaledH = dimensions.height * scale[1];
  const scaledD = dimensions.depth * scale[2];
  const [x, y, z] = position;
  
  let newX = x, newY = y, newZ = z;
  
  if (wallType === 'floor') {
    // Clamp to room bounds (with half-width/depth margin)
    newX = Math.max(-roomConfig.width / 2 + scaledW / 2, Math.min(roomConfig.width / 2 - scaledW / 2, x));
    newZ = Math.max(-roomConfig.depth / 2 + scaledD / 2, Math.min(roomConfig.depth / 2 - scaledD / 2, z));
    newY = 0; // Always on floor
  } else if (wallType === 'front' || wallType === 'back') {
    // Lock Z to wall, allow X height variation
    newZ = wallType === 'front' ? -roomConfig.depth / 2 + scaledD / 2 : roomConfig.depth / 2 - scaledD / 2;
    newX = Math.max(-roomConfig.width / 2 + scaledW / 2, Math.min(roomConfig.width / 2 - scaledW / 2, x));
    newY = Math.max(scaledH / 2, Math.min(roomConfig.height - scaledH / 2, y));
  } else if (wallType === 'left' || wallType === 'right') {
    // Lock X to wall, allow Z height variation
    newX = wallType === 'left' ? -roomConfig.width / 2 + scaledW / 2 : roomConfig.width / 2 - scaledW / 2;
    newZ = Math.max(-roomConfig.depth / 2 + scaledD / 2, Math.min(roomConfig.depth / 2 - scaledD / 2, z));
    newY = Math.max(scaledH / 2, Math.min(roomConfig.height - scaledH / 2, y));
  }
  
  return [newX, newY, newZ];
};

const getActivePlane = (position: [number, number, number], roomConfig: RoomConfig): { plane: THREE.Plane; type: WallPlane } => {
  const x = position[0];
  const z = position[2];
  const yTol = 0.3;
  const xTol = 0.3;
  const zTol = 0.3;
  
  const distToFront = Math.abs(z + roomConfig.depth / 2);
  const distToBack = Math.abs(z - roomConfig.depth / 2);
  const distToLeft = Math.abs(x + roomConfig.width / 2);
  const distToRight = Math.abs(x - roomConfig.width / 2);
  const distToFloor = position[1];
  
  const distances = [
    { dist: distToFront, type: 'front' as WallPlane, plane: new THREE.Plane(new THREE.Vector3(0, 0, 1), -roomConfig.depth / 2) },
    { dist: distToBack, type: 'back' as WallPlane, plane: new THREE.Plane(new THREE.Vector3(0, 0, -1), -roomConfig.depth / 2) },
    { dist: distToLeft, type: 'left' as WallPlane, plane: new THREE.Plane(new THREE.Vector3(1, 0, 0), -roomConfig.width / 2) },
    { dist: distToRight, type: 'right' as WallPlane, plane: new THREE.Plane(new THREE.Vector3(-1, 0, 0), -roomConfig.width / 2) },
  ];
  
  distances.sort((a, b) => a.dist - b.dist);
  if (distances[0].dist < 0.36) {
    return { type: distances[0].type, plane: distances[0].plane };
  }
  
  return { type: 'floor', plane: new THREE.Plane(new THREE.Vector3(0, 1, 0), 0) };
};

/* ─── Draggable Furniture mesh ─── */
const FurnitureMesh = ({ obj, selected, onSelect, onDrag, roomConfig }: {
  obj: PlacedObject;
  selected: boolean;
  onSelect: (id: string) => void;
  onDrag: (id: string, position: [number, number, number]) => void;
  roomConfig: RoomConfig;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [modelScene, setModelScene] = useState<THREE.Object3D | null>(null);
  const [modelFailed, setModelFailed] = useState(false);
  const dragPlane = useRef<THREE.Plane>(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const dragPlaneType = useRef<WallPlane>('floor');
  const dragOffset = useRef<THREE.Vector3>(new THREE.Vector3());

  const { width, height, depth } = obj.dimensions;
  const scaledW = width * obj.scale[0];
  const scaledH = height * obj.scale[1];
  const scaledD = depth * obj.scale[2];

  useEffect(() => {
    if (!obj.modelUrl) {
      setModelScene(null);
      setModelFailed(false);
      return;
    }

    let cancelled = false;
    const loader = new GLTFLoader();

    setModelFailed(false);
    loader.load(
      obj.modelUrl,
      (gltf) => {
        if (cancelled) return;
        setModelScene(gltf.scene.clone(true));
      },
      undefined,
      () => {
        if (cancelled) return;
        setModelScene(null);
        setModelFailed(true);
      }
    );

    return () => {
      cancelled = true;
    };
  }, [obj.modelUrl]);

  const modelTransform = useMemo(() => {
    if (!modelScene) {
      return {
        scale: 1,
        position: [0, 0, 0] as [number, number, number],
      };
    }

    const box = new THREE.Box3().setFromObject(modelScene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const safeW = size.x || 1;
    const safeH = size.y || 1;
    const safeD = size.z || 1;
    const fitScale = Math.min(scaledW / safeW, scaledH / safeH, scaledD / safeD);

    return {
      scale: fitScale,
      position: [
        -center.x * fitScale,
        -box.min.y * fitScale,
        -center.z * fitScale,
      ] as [number, number, number],
    };
  }, [modelScene, scaledW, scaledH, scaledD]);

  const showFallbackGeometry = !modelScene || modelFailed;

  const handlePointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onSelect(obj.id);

    // Detect wall or floor
    const { plane, type } = getActivePlane(obj.position, roomConfig);
    dragPlane.current = plane;
    dragPlaneType.current = type;

    // Calculate drag offset
    const intersect = new THREE.Vector3();
    e.ray.intersectPlane(plane, intersect);
    
    if (type === 'floor') {
      dragOffset.current.set(
        intersect.x - obj.position[0],
        0,
        intersect.z - obj.position[2]
      );
    } else if (type === 'front' || type === 'back') {
      dragOffset.current.set(
        intersect.x - obj.position[0],
        intersect.y - obj.position[1],
        0
      );
    } else if (type === 'left' || type === 'right') {
      dragOffset.current.set(
        0,
        intersect.y - obj.position[1],
        intersect.z - obj.position[2]
      );
    }

    setDragging(true);
    (e.target as HTMLElement)?.setPointerCapture?.(e.pointerId);
    document.body.style.cursor = "grabbing";
  }, [obj.id, obj.position, onSelect, roomConfig]);

  const handlePointerMove = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (!dragging) return;
    e.stopPropagation();

    const intersect = new THREE.Vector3();
    e.ray.intersectPlane(dragPlane.current, intersect);

    let newPos: [number, number, number] = [...obj.position];

    // When on wall, check if dragging down should switch to floor
    if (dragPlaneType.current !== 'floor') {
      const intendedY = intersect.y - dragOffset.current.y;
      
      // If dragging down below drawable height, switch to floor plane
      if (intendedY < scaledH / 2 + 0.1) {
        dragPlaneType.current = 'floor';
        dragPlane.current = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        
        // Re-intersect with floor plane to get valid X, Z
        e.ray.intersectPlane(dragPlane.current, intersect);
        dragOffset.current.set(
          intersect.x - obj.position[0],
          0,
          intersect.z - obj.position[2]
        );
        
        // Re-intersect to get new position
        e.ray.intersectPlane(dragPlane.current, intersect);
        newPos[0] = intersect.x - dragOffset.current.x;
        newPos[1] = 0; // Floor level
        newPos[2] = intersect.z - dragOffset.current.z;
      } else if (dragPlaneType.current === 'front' || dragPlaneType.current === 'back') {
        newPos[0] = intersect.x - dragOffset.current.x;
        newPos[1] = intendedY; // Allow free Y movement
      } else if (dragPlaneType.current === 'left' || dragPlaneType.current === 'right') {
        newPos[2] = intersect.z - dragOffset.current.z;
        newPos[1] = intendedY; // Allow free Y movement
      }
    } else {
      // On floor plane
      newPos[0] = intersect.x - dragOffset.current.x;
      newPos[2] = intersect.z - dragOffset.current.z;
      newPos[1] = 0;
    }

    // Clamp to room bounds
    const clamped = clampPositionToRoom(newPos, obj.dimensions, obj.scale, roomConfig, dragPlaneType.current);
    onDrag(obj.id, clamped);
  }, [dragging, obj.id, obj.position, obj.dimensions, obj.scale, onDrag, roomConfig, scaledH]);

  const handlePointerUp = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (!dragging) return;
    e.stopPropagation();
    setDragging(false);
    document.body.style.cursor = "default";
  }, [dragging]);

  return (
    <group
      position={obj.position}
      rotation={obj.rotation.map((r) => (r * Math.PI) / 180) as [number, number, number]}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = dragging ? "grabbing" : "grab"; }}
      onPointerOut={() => { if (!dragging) { setHovered(false); document.body.style.cursor = "default"; } }}
    >
      <mesh
        ref={meshRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = dragging ? "grabbing" : "grab"; }}
        onPointerOut={() => { if (!dragging) { setHovered(false); document.body.style.cursor = "default"; } }}
        position={[0, scaledH / 2, 0]}
        castShadow
        receiveShadow
      >
        {/* Hidden geometry for interaction only */}
      </mesh>

      {modelScene && !modelFailed && (
        <primitive
          object={modelScene}
          position={modelTransform.position}
          scale={modelTransform.scale}
        />
      )}

      {showFallbackGeometry && (
        <mesh position={[0, scaledH / 2, 0]} castShadow receiveShadow>
          {obj.category === "lamp" ? (
            <cylinderGeometry args={[scaledW * 0.15, scaledW * 0.3, scaledH, 8]} />
          ) : obj.category === "plant" ? (
            <cylinderGeometry args={[scaledW * 0.3, scaledW * 0.4, scaledH, 12]} />
          ) : obj.category === "rug" ? (
            <boxGeometry args={[scaledW, 0.02, scaledD]} />
          ) : (
            <boxGeometry args={[scaledW, scaledH, scaledD]} />
          )}
          <meshStandardMaterial
            color={obj.color}
            transparent={hovered || selected}
            opacity={hovered || selected ? 0.85 : 1}
            roughness={0.6}
            metalness={0.1}
          />
        </mesh>
      )}

      {/* Dimension label */}
      {selected && (
        <Html position={[0, scaledH + 0.3, 0]} center>
          <div className="bg-card/90 backdrop-blur-sm border border-border/40 rounded-lg px-2 py-1 text-[10px] text-foreground whitespace-nowrap shadow-lg pointer-events-none">
            {(scaledW * 100).toFixed(0)} × {(scaledD * 100).toFixed(0)} cm
          </div>
        </Html>
      )}
    </group>
  );
};

/* ─── Room walls ─── */
const RoomWalls = ({ config }: { config: RoomConfig }) => {
  const { width, depth, height } = config;
  const wallThickness = 0.05;

  return (
    <group>
      <mesh position={[0, height / 2, -depth / 2]} receiveShadow>
        <boxGeometry args={[width, height, wallThickness]} />
        <meshStandardMaterial color={config.wallColor} roughness={0.9} />
      </mesh>
      <mesh position={[-width / 2, height / 2, 0]} receiveShadow>
        <boxGeometry args={[wallThickness, height, depth]} />
        <meshStandardMaterial color={config.wallColor} roughness={0.9} />
      </mesh>
      <mesh position={[width / 2, height / 2, 0]} receiveShadow>
        <boxGeometry args={[wallThickness, height, depth]} />
        <meshStandardMaterial color={config.wallColor} roughness={0.9} />
      </mesh>
    </group>
  );
};

/* ─── Disable OrbitControls while dragging ─── */
const SceneControls = ({ viewMode, isDragging }: { viewMode: "3d" | "top"; isDragging: boolean }) => {
  const { camera } = useThree();

  useFrame(() => {
    if (viewMode === "top") {
      camera.position.lerp(new THREE.Vector3(0, 8, 0.01), 0.05);
    }
  });

  return (
    <OrbitControls
      makeDefault
      enabled={!isDragging}
      maxPolarAngle={viewMode === "top" ? 0.1 : Math.PI / 2.1}
      minDistance={2}
      maxDistance={15}
      enablePan
    />
  );
};

/* ─── Main Canvas Component ─── */
interface RoomCanvas3DProps {
  objects: PlacedObject[];
  roomConfig: RoomConfig;
  selectedId: string | null;
  onSelectObject: (id: string | null) => void;
  onUpdateObject?: (id: string, updates: Partial<PlacedObject>) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  viewMode: "3d" | "top";
}

const RoomCanvas3D = ({ objects, roomConfig, selectedId, onSelectObject, onUpdateObject, onDragStart, onDragEnd, viewMode }: RoomCanvas3DProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((id: string, position: [number, number, number]) => {
    if (!isDragging) {
      setIsDragging(true);
      onDragStart?.();
    }
    onUpdateObject?.(id, { position });
  }, [onUpdateObject, onDragStart, isDragging]);

  return (
    <div
      className="w-full h-full rounded-xl overflow-hidden bg-gradient-to-b from-accent/20 to-background border border-border/30"
      onPointerUp={() => { if (isDragging) { setIsDragging(false); onDragEnd?.(); } }}
    >
      <Canvas
        shadows
        camera={{ position: [4, 4, 4], fov: 50 }}
        onPointerMissed={() => { onSelectObject(null); setIsDragging(false); }}
      >
        <SceneControls viewMode={viewMode} isDragging={isDragging} />
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[5, 8, 3]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-far={20}
          shadow-camera-left={-8}
          shadow-camera-right={8}
          shadow-camera-top={8}
          shadow-camera-bottom={-8}
        />
        <pointLight position={[-3, 4, -2]} intensity={0.3} color="#93C5FD" />

        {/* Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[roomConfig.width, roomConfig.depth]} />
          <meshStandardMaterial color={roomConfig.floorColor} roughness={0.8} />
        </mesh>

        {/* Grid */}
        <Grid
          args={[roomConfig.width, roomConfig.depth]}
          position={[0, 0.001, 0]}
          cellSize={0.5}
          cellThickness={0.5}
          cellColor="#94A3B8"
          sectionSize={1}
          sectionThickness={1}
          sectionColor="#64748B"
          fadeDistance={15}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid={false}
        />

        {/* Walls */}
        <RoomWalls config={roomConfig} />

        {/* Placed furniture */}
        {objects.map((obj) => (
          <FurnitureMesh
            key={obj.id}
            obj={obj}
            selected={selectedId === obj.id}
            onSelect={onSelectObject}
            onDrag={handleDrag}
            roomConfig={roomConfig}
          />
        ))}

        <ContactShadows position={[0, 0, 0]} opacity={0.3} blur={2} />
        <Environment preset="apartment" />
      </Canvas>
    </div>
  );
};

export default RoomCanvas3D;
