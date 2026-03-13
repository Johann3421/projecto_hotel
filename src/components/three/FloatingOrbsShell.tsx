"use client"

import dynamic from "next/dynamic"

const FloatingOrbs = dynamic(() => import("@/components/three/FloatingOrbs"), {
  ssr: false,
  loading: () => null,
})

export default function FloatingOrbsShell() {
  if (process.env.NODE_ENV !== "production") {
    return null
  }

  return <FloatingOrbs />
}