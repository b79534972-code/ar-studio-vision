/**
 * Interactive 3D furniture preview using @react-three/fiber.
 * Shows the generated object with orbit controls, shadows, and environment lighting.
 */

import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment } from "@react-three/drei";
import { RotateCcw, Move } from "lucide-react";

interface FurniturePreview3DProps {
  dimensions: { width: number; height: number; depth: number };
  color: string;
  material: string;
}

function FurnitureBox({ dimensions, color }: { dimensions: FurniturePreview3DProps["dimensions"]; color: string }) {
  const { width, height, depth } = dimensions;
  return (
    <group>
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]} receiveShadow>
        <circleGeometry args={[Math.max(width, depth) * 0.8, 32]} />
        <meshStandardMaterial color="hsl(225, 14%, 90%)" roughness={1} transparent opacity={0.2} />
      </mesh>
    </group>
  );
}

function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]} receiveShadow>
      <planeGeometry args={[8, 8]} />
      <meshStandardMaterial color="hsl(225, 14%, 95%)" roughness={0.9} />
    </mesh>
  );
}

const FurniturePreview3D = ({ dimensions, color }: FurniturePreview3DProps) => {
  const maxDim = Math.max(dimensions.width, dimensions.height, dimensions.depth);
  const camDist = maxDim * 2.5;

  return (
    <div className="space-y-2">
      <div className="aspect-[4/3] rounded-xl overflow-hidden border border-border/50 bg-secondary/20">
        <Canvas
          shadows
          camera={{ position: [camDist * 0.7, camDist * 0.6, camDist * 0.7], fov: 40 }}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[3, 6, 4]}
            intensity={1.2}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          <Floor />
          <FurnitureBox dimensions={dimensions} color={color} />
          <ContactShadows position={[0, -0.004, 0]} opacity={0.3} scale={maxDim * 4} blur={2.5} />
          <Environment preset="apartment" />
          <OrbitControls
            enablePan={false}
            enableZoom
            enableRotate
            maxPolarAngle={Math.PI / 2}
            minDistance={maxDim * 0.5}
            maxDistance={maxDim * 5}
            target={[0, dimensions.height / 2, 0]}
          />
        </Canvas>
      </div>
      <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1"><RotateCcw className="w-3 h-3" /> Drag to rotate</span>
        <span className="flex items-center gap-1"><Move className="w-3 h-3" /> Scroll to zoom</span>
      </div>
    </div>
  );
};

export default FurniturePreview3D;
