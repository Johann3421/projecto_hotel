"use client"

import dynamic from "next/dynamic"
import Image from "next/image"
import Skeleton from "@/components/ui/Skeleton"
import { getRoomStockImages } from "@/lib/room-stock-images"

const RoomTourScene = dynamic(() => import("@/components/three/RoomTourScene"), {
  ssr: false,
  loading: () => <Skeleton variant="card" className="h-[400px] w-full rounded-2xl" />,
})

export default function RoomTourSceneShell() {
  if (process.env.NODE_ENV !== "production") {
    const previewImage = getRoomStockImages("suite-presidencial", "Suite Presidencial")[1]

    return (
      <div className="relative h-[400px] w-full overflow-hidden rounded-2xl">
        <Image
          src={previewImage.url}
          alt={previewImage.alt}
          fill
          sizes="(max-width: 1200px) 100vw, 50vw"
          className="object-cover"
          quality={90}
        />
        <div className="absolute inset-0 bg-linear-to-t from-navy-950/70 via-navy-900/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 text-white">
          <p className="font-sans text-xs font-bold uppercase tracking-[0.28em] text-gold-300">Preview 360</p>
          <p className="mt-2 font-serif text-2xl italic">Recorrido interactivo activo en produccion</p>
        </div>
      </div>
    )
  }

  return <RoomTourScene />
}