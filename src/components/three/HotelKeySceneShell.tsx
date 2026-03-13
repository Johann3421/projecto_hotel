"use client"

import dynamic from "next/dynamic"
import Image from "next/image"
import Skeleton from "@/components/ui/Skeleton"
import { getRoomStockImages } from "@/lib/room-stock-images"

const HotelKeyScene = dynamic(() => import("@/components/three/HotelKeyScene"), {
  ssr: false,
  loading: () => <Skeleton variant="card" className="h-[420px] w-full rounded-2xl" />,
})

export default function HotelKeySceneShell() {
  if (process.env.NODE_ENV !== "production") {
    const previewImage = getRoomStockImages("suite-presidencial", "Suite Presidencial")[0]

    return (
      <div className="relative h-[420px] w-full overflow-hidden rounded-[32px] border border-white/20 bg-white/10 shadow-2xl backdrop-blur-sm">
        <Image
          src={previewImage.url}
          alt={previewImage.alt}
          fill
          sizes="(max-width: 1200px) 50vw, 40vw"
          className="object-cover"
          quality={90}
        />
        <div className="absolute inset-0 bg-linear-to-t from-navy-950/70 via-navy-900/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 text-white">
          <p className="font-sans text-xs font-bold uppercase tracking-[0.28em] text-gold-300">Vista previa</p>
          <p className="mt-2 font-serif text-2xl italic">Escena decorativa disponible en produccion</p>
        </div>
      </div>
    )
  }

  return <HotelKeyScene />
}