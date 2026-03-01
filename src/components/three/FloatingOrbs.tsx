"use client"
import { Canvas, useFrame } from "@react-three/fiber"
import { Float } from "@react-three/drei"
import { Suspense, useRef, useMemo } from "react"
import * as THREE from "three"

function Orb({ position, scale, speed, color }: { position: [number, number, number]; scale: number; speed: number; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.3
    }
  })

  return (
    <Float speed={speed} rotationIntensity={0.1} floatIntensity={0.4}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.15}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </Float>
  )
}

export default function FloatingOrbs() {
  const orbs = useMemo(
    () => [
      { position: [-3, 1, -2] as [number, number, number], scale: 0.8, speed: 0.8, color: "#d4a843" },
      { position: [3, -0.5, -1] as [number, number, number], scale: 1.2, speed: 0.5, color: "#d4a843" },
      { position: [0, 2, -3] as [number, number, number], scale: 0.6, speed: 1.0, color: "#f9e8b8" },
      { position: [-2, -1, 1] as [number, number, number], scale: 0.4, speed: 1.2, color: "#b8922a" },
      { position: [2, 1.5, 0] as [number, number, number], scale: 0.7, speed: 0.7, color: "#d4a843" },
    ],
    []
  )

  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 50 }} gl={{ antialias: true, alpha: true }}>
      <Suspense fallback={null}>
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} color="#d4a843" intensity={1} />
        {orbs.map((orb, i) => (
          <Orb key={i} {...orb} />
        ))}
      </Suspense>
    </Canvas>
  )
}
