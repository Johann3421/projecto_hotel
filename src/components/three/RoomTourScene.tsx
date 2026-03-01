"use client"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Float } from "@react-three/drei"
import { Suspense, useRef } from "react"
import * as THREE from "three"

function Room() {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
        <planeGeometry args={[8, 6]} />
        <meshStandardMaterial color="#c4956a" roughness={0.8} />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 1, -3]}>
        <planeGeometry args={[8, 4]} />
        <meshStandardMaterial color="#f5f0e8" roughness={0.9} />
      </mesh>

      {/* Left wall */}
      <mesh position={[-4, 1, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[6, 4]} />
        <meshStandardMaterial color="#ede8de" roughness={0.9} />
      </mesh>

      {/* Bed - base */}
      <mesh position={[0, -0.2, -1.5]}>
        <boxGeometry args={[3, 0.6, 2.2]} />
        <meshStandardMaterial color="#8B7355" roughness={0.7} />
      </mesh>

      {/* Bed - mattress */}
      <mesh position={[0, 0.15, -1.5]}>
        <boxGeometry args={[2.8, 0.3, 2]} />
        <meshStandardMaterial color="#FAFAFA" roughness={0.4} />
      </mesh>

      {/* Pillows */}
      <mesh position={[-0.5, 0.4, -2.3]}>
        <boxGeometry args={[0.7, 0.15, 0.4]} />
        <meshStandardMaterial color="#F5F5F5" roughness={0.3} />
      </mesh>
      <mesh position={[0.5, 0.4, -2.3]}>
        <boxGeometry args={[0.7, 0.15, 0.4]} />
        <meshStandardMaterial color="#F5F5F5" roughness={0.3} />
      </mesh>

      {/* Nightstand */}
      <mesh position={[-2, -0.4, -2]}>
        <boxGeometry args={[0.6, 0.8, 0.5]} />
        <meshStandardMaterial color="#5C4033" roughness={0.6} />
      </mesh>

      {/* Lamp on nightstand */}
      <mesh position={[-2, 0.2, -2]}>
        <cylinderGeometry args={[0.1, 0.15, 0.4, 16]} />
        <meshStandardMaterial color="#d4a843" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Window light */}
      <mesh position={[3.99, 1, -1]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[2.5, 2]} />
        <meshStandardMaterial color="#ffffff" emissive="#fff8e7" emissiveIntensity={0.5} transparent opacity={0.6} />
      </mesh>

      {/* Rug */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.98, 0.5]}>
        <planeGeometry args={[3, 2]} />
        <meshStandardMaterial color="#8B4513" roughness={0.95} />
      </mesh>
    </group>
  )
}

function FloatingParticles() {
  const ref = useRef<THREE.Points>(null)
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.02
    }
  })

  const positions = new Float32Array(30)
  for (let i = 0; i < 30; i += 3) {
    positions[i] = (Math.random() - 0.5) * 6
    positions[i + 1] = Math.random() * 3 - 0.5
    positions[i + 2] = (Math.random() - 0.5) * 4
  }

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#d4a843" transparent opacity={0.6} />
    </points>
  )
}

export default function RoomTourScene() {
  return (
    <Canvas camera={{ position: [3, 2, 5], fov: 50 }} gl={{ antialias: true }}>
      <Suspense fallback={null}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 3]} intensity={1.2} color="#fff8e7" castShadow />
        <pointLight position={[-2, 2, -1]} color="#d4a843" intensity={1.5} />
        <pointLight position={[3, 1, -1]} color="#FF9800" intensity={0.5} />
        <Room />
        <FloatingParticles />
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          maxDistance={8}
          minDistance={3}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2.2}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Suspense>
    </Canvas>
  )
}
