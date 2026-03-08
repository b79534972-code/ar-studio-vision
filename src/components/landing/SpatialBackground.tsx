import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshReflectorMaterial } from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";

/* ── tiny floating shapes ── */
const FloatingShape = ({
  position,
  geometry,
  speed,
  rotSpeed,
}: {
  position: [number, number, number];
  geometry: "box" | "octahedron" | "torus" | "sphere";
  speed: number;
  rotSpeed: number;
}) => {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed;
    ref.current.position.y = position[1] + Math.sin(t) * 0.35;
    ref.current.rotation.x += rotSpeed * 0.002;
    ref.current.rotation.z += rotSpeed * 0.0015;
  });

  const geo = useMemo(() => {
    switch (geometry) {
      case "box":
        return <boxGeometry args={[0.35, 0.35, 0.35]} />;
      case "octahedron":
        return <octahedronGeometry args={[0.28, 0]} />;
      case "torus":
        return <torusGeometry args={[0.25, 0.08, 16, 32]} />;
      case "sphere":
        return <sphereGeometry args={[0.22, 24, 24]} />;
    }
  }, [geometry]);

  return (
    <Float speed={0.6} floatIntensity={0.3}>
      <mesh ref={ref} position={position}>
        {geo}
        <meshStandardMaterial
          color="#8b9cf7"
          transparent
          opacity={0.18}
          roughness={0.3}
          metalness={0.6}
        />
      </mesh>
    </Float>
  );
};

/* ── distant particle stars ── */
const Particles = ({ count = 200 }) => {
  const ref = useRef<THREE.Points>(null!);

  const [positions, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 1] = Math.random() * 18 - 2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30 - 5;
      sz[i] = Math.random() * 2 + 0.5;
    }
    return [pos, sz];
  }, [count]);

  useFrame(({ clock }) => {
    ref.current.rotation.y = clock.getElapsedTime() * 0.003;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={count}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          array={sizes}
          count={count}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#a5b4fc"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
};

/* ── scene ── */
const Scene = () => {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.25} />
      <directionalLight position={[5, 8, 5]} intensity={0.4} color="#c7d2fe" />
      <pointLight position={[-4, 6, -6]} intensity={0.3} color="#818cf8" distance={20} />
      <pointLight position={[6, 3, -8]} intensity={0.2} color="#67e8f9" distance={18} />

      {/* Fog for atmospheric depth */}
      <fog attach="fog" args={["#f0f1f8", 8, 35]} />

      {/* Floating shapes */}
      <FloatingShape position={[-3.5, 2.5, -6]} geometry="octahedron" speed={0.3} rotSpeed={1} />
      <FloatingShape position={[4, 3.2, -8]} geometry="box" speed={0.25} rotSpeed={0.8} />
      <FloatingShape position={[-1.5, 4, -10]} geometry="torus" speed={0.35} rotSpeed={1.2} />
      <FloatingShape position={[2.5, 1.8, -5]} geometry="sphere" speed={0.28} rotSpeed={0.9} />
      <FloatingShape position={[-5, 3.8, -12]} geometry="box" speed={0.2} rotSpeed={0.7} />
      <FloatingShape position={[5.5, 4.5, -14]} geometry="octahedron" speed={0.32} rotSpeed={1.1} />
      <FloatingShape position={[0, 5, -16]} geometry="torus" speed={0.22} rotSpeed={0.6} />

      {/* Reflective floor plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, -5]}>
        <planeGeometry args={[60, 40]} />
        <MeshReflectorMaterial
          mirror={0.15}
          blur={[300, 100]}
          resolution={512}
          mixBlur={0.8}
          mixStrength={0.4}
          roughness={1}
          depthScale={0.8}
          color="#e8eaf0"
          metalness={0.1}
        />
      </mesh>

      {/* Distant particles */}
      <Particles count={180} />
    </>
  );
};

const SpatialBackground = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 2, 6], fov: 55 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Scene />
      </Canvas>
    </div>
  );
};

export default SpatialBackground;
