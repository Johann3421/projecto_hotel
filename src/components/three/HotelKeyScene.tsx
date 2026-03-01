"use client"
import { Canvas, useFrame } from "@react-three/fiber"
import { Float, Environment, Torus, Cylinder } from "@react-three/drei"
import { Suspense, useRef } from "react"
import * as THREE from "three"

function HotelKey() {
  const groupRef = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.3
      groupRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.3) * 0.05
    }
  })
  return (
    <Float speed={1.0} rotationIntensity={0.2} floatIntensity={0.6}>
      <group ref={groupRef} scale={[1.2, 1.2, 1.2]}>
        <Torus args={[0.5, 0.08, 16, 64]} position={[0, 0.3, 0]}>
          <meshStandardMaterial color="#d4a843" metalness={0.9} roughness={0.1} />
        </Torus>
        <Cylinder args={[0.06, 0.06, 1.4, 16]} position={[0, -0.5, 0]}>
          <meshStandardMaterial color="#d4a843" metalness={0.85} roughness={0.15} />
        </Cylinder>
        <Cylinder args={[0.07, 0.07, 0.2, 8]} position={[0.15, -0.95, 0]} rotation={[0, 0, Math.PI / 2]}>
          <meshStandardMaterial color="#d4a843" metalness={0.85} roughness={0.15} />
        </Cylinder>
        <Cylinder args={[0.07, 0.07, 0.18, 8]} position={[0.15, -0.65, 0]} rotation={[0, 0, Math.PI / 2]}>
          <meshStandardMaterial color="#d4a843" metalness={0.85} roughness={0.15} />
        </Cylinder>
      </group>
    </Float>
  )
}

export default function HotelKeyScene() {
  return (
    <Canvas camera={{ position: [0, 0.5, 4.5], fov: 42 }} gl={{ antialias: true, alpha: true }}>
      <Suspense fallback={null}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 5, 3]} intensity={1.5} color="#fff8e7" />
        <pointLight position={[-3, 2, 1]} color="#d4a843" intensity={2} />
        <Environment preset="lobby" />
        <HotelKey />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.8, 0]}>
          <planeGeometry args={[10, 10]} />
          <meshStandardMaterial color="#1a3a50" metalness={0.3} roughness={0.8} transparent opacity={0.5} />
        </mesh>
      </Suspense>
    </Canvas>
  )
}
