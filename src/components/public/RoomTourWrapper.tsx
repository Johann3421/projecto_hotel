"use client"
import dynamic from "next/dynamic"

const RoomTourScene = dynamic(() => import("@/components/three/RoomTourScene"), {
  ssr: false,
  loading: () => <div className="h-[350px] rounded-xl bg-navy-100 animate-pulse" />,
})

export default function RoomTourWrapper() {
  return <RoomTourScene />
}
