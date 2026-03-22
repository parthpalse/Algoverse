import { Float, OrbitControls, Stars } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";

function TorusKnotHero() {
  const mesh = useRef();
  useFrame((_, delta) => {
    if (!mesh.current) return;
    mesh.current.rotation.x += delta * 0.12;
    mesh.current.rotation.y += delta * 0.18;
  });
  return (
    <Float speed={1.6} rotationIntensity={0.35} floatIntensity={0.55}>
      <mesh ref={mesh} scale={1.15}>
        <torusKnotGeometry args={[1.05, 0.32, 160, 18]} />
        <meshStandardMaterial
          color="#22d3ee"
          emissive="#0891b2"
          emissiveIntensity={0.25}
          metalness={0.35}
          roughness={0.25}
          wireframe
        />
      </mesh>
    </Float>
  );
}

function InnerGlobe() {
  const mesh = useRef();
  useFrame((_, delta) => {
    if (!mesh.current) return;
    mesh.current.rotation.y -= delta * 0.08;
  });
  return (
    <mesh ref={mesh} scale={2.4}>
      <icosahedronGeometry args={[1, 2]} />
      <meshStandardMaterial
        color="#312e81"
        emissive="#4c1d95"
        emissiveIntensity={0.15}
        wireframe
        transparent
        opacity={0.35}
      />
    </mesh>
  );
}

export function LandingScene() {
  return (
    <div className="relative h-[min(72vh,640px)] w-full overflow-hidden rounded-3xl ring-1 ring-cyan-500/20">
      <Canvas
        camera={{ position: [0, 1.2, 9], fov: 42 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={["#070a12"]} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[6, 10, 4]} intensity={1.1} />
        <pointLight position={[-6, -2, -4]} intensity={0.6} color="#a78bfa" />
        <Stars radius={80} depth={40} count={4200} factor={3.2} saturation={0} fade speed={0.6} />
        <InnerGlobe />
        <TorusKnotHero />
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.35} />
      </Canvas>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-av-bg via-transparent to-transparent" />
    </div>
  );
}
