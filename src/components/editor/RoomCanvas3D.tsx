import { useRef, useState, useCallback } from "react";
import { Canvas, useThree, useFrame, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Grid, Environment, ContactShadows, Html } from "@react-three/drei";
import type { PlacedObject, RoomConfig } from "@/types/editor";
import * as THREE from "three";

/* ─── Draggable Furniture mesh ─── */
const FurnitureMesh = ({ obj, selected, onSelect, onDrag }: {
  obj: PlacedObject;
  selected: boolean;
  onSelect: (id: string) => void;
  onDrag: (id: string, position: [number, number, number]) => void;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);
  const floorPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const dragOffset = useRef(new THREE.Vector3());

  const { width, height, depth } = obj.dimensions;
  const scaledW = width * obj.scale[0];
  const scaledH = height * obj.scale[1];
  const scaledD = depth * obj.scale[2];

  const handlePointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onSelect(obj.id);

    // Calculate drag offset
    const intersect = new THREE.Vector3();
    e.ray.intersectPlane(floorPlane.current, intersect);
    dragOffset.current.set(
      intersect.x - obj.position[0],
      0,
      intersect.z - obj.position[2]
    );

    setDragging(true);
    (e.target as HTMLElement)?.setPointerCapture?.(e.pointerId);
    document.body.style.cursor = "grabbing";
  }, [obj.id, obj.position, onSelect]);

  const handlePointerMove = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (!dragging) return;
    e.stopPropagation();

    const intersect = new THREE.Vector3();
    e.ray.intersectPlane(floorPlane.current, intersect);

    const newX = intersect.x - dragOffset.current.x;
    const newZ = intersect.z - dragOffset.current.z;

    onDrag(obj.id, [newX, obj.position[1], newZ]);
  }, [dragging, obj.id, obj.position, onDrag]);

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

      {/* Selection outline */}
      {selected && (
        <mesh position={[0, scaledH / 2, 0]}>
          <boxGeometry args={[scaledW + 0.04, scaledH + 0.04, scaledD + 0.04]} />
          <meshBasicMaterial color="#4F46E5" wireframe transparent opacity={0.5} />
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
  viewMode: "3d" | "top";
}

const RoomCanvas3D = ({ objects, roomConfig, selectedId, onSelectObject, onUpdateObject, viewMode }: RoomCanvas3DProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((id: string, position: [number, number, number]) => {
    setIsDragging(true);
    onUpdateObject?.(id, { position });
  }, [onUpdateObject]);

  return (
    <div
      className="w-full h-full rounded-xl overflow-hidden bg-gradient-to-b from-accent/20 to-background border border-border/30"
      onPointerUp={() => setIsDragging(false)}
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
          />
        ))}

        <ContactShadows position={[0, 0, 0]} opacity={0.3} blur={2} />
        <Environment preset="apartment" />
      </Canvas>
    </div>
  );
};

export default RoomCanvas3D;
