"use client"
import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight, Expand } from "lucide-react"
import { cn } from "@/lib/utils"

interface GalleryImage {
  url: string
  alt: string
  caption?: string | null
}

interface RoomGalleryProps {
  images: GalleryImage[]
  className?: string
}

export default function RoomGallery({ images, className }: RoomGalleryProps) {
  const [current, setCurrent] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [fadeKey, setFadeKey] = useState(0)

  const total = images.length

  const goTo = useCallback(
    (index: number) => {
      setCurrent((index + total) % total)
      setFadeKey((k) => k + 1)
    },
    [total]
  )

  const prev = useCallback(() => goTo(current - 1), [current, goTo])
  const next = useCallback(() => goTo(current + 1), [current, goTo])

  const openLightbox = (index: number) => {
    setCurrent(index)
    setFadeKey((k) => k + 1)
    setLightboxOpen(true)
  }

  const closeLightbox = () => setLightboxOpen(false)

  // Keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return

    const handleKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          prev()
          break
        case "ArrowRight":
          next()
          break
        case "Escape":
          closeLightbox()
          break
      }
    }

    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", handleKey)
    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", handleKey)
    }
  }, [lightboxOpen, prev, next])

  if (!images.length) return null

  const img = images[current]

  return (
    <>
      {/* Thumbnail Grid */}
      <div className={cn("grid gap-2", className)}>
        {/* Main image */}
        <button
          onClick={() => openLightbox(0)}
          className="relative aspect-[16/10] overflow-hidden rounded-xl group cursor-pointer"
        >
          <Image
            src={images[0].url}
            alt={images[0].alt}
            fill
            sizes="(max-width: 768px) 100vw, 66vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            quality={90}
            priority
          />
          <div className="absolute inset-0 bg-navy-900/0 group-hover:bg-navy-900/20 transition-colors duration-300" />
          <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Expand className="h-4 w-4 text-navy-700" />
            <span className="font-sans text-xs font-bold text-navy-700">Ver galería</span>
          </div>
        </button>

        {/* Small thumbnails */}
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {images.slice(1, 5).map((image, i) => (
              <button
                key={i}
                onClick={() => openLightbox(i + 1)}
                className="relative aspect-[4/3] overflow-hidden rounded-lg group cursor-pointer"
              >
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  sizes="(max-width: 768px) 25vw, 16vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  quality={75}
                />
                <div className="absolute inset-0 bg-navy-900/0 group-hover:bg-navy-900/20 transition-colors duration-300" />
                {i === 3 && images.length > 5 && (
                  <div className="absolute inset-0 bg-navy-900/60 flex items-center justify-center">
                    <span className="font-sans text-white font-bold text-sm">
                      +{images.length - 5} más
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-navy-900/95 flex flex-col items-center justify-center">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 z-10">
            <span className="font-sans text-sm font-bold text-white/80">
              {current + 1} / {total}
            </span>
            <button
              onClick={closeLightbox}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Cerrar galería"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* Image with crossfade */}
          <div className="relative w-full h-full flex items-center justify-center px-16 py-20">
            <div
              key={fadeKey}
              className="relative max-w-5xl w-full h-full animate-in fade-in duration-500"
            >
              <Image
                src={img.url}
                alt={img.alt}
                fill
                sizes="100vw"
                className="object-contain"
                quality={95}
                priority
              />
            </div>
          </div>

          {/* Caption */}
          {img.caption && (
            <div className="absolute bottom-16 left-0 right-0 text-center">
              <p className="font-sans text-sm text-white/80 bg-navy-900/60 inline-block px-4 py-2 rounded-full backdrop-blur-sm">
                {img.caption}
              </p>
            </div>
          )}

          {/* Nav buttons */}
          {total > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Imagen anterior"
              >
                <ChevronLeft className="h-6 w-6 text-white" />
              </button>
              <button
                onClick={next}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Imagen siguiente"
              >
                <ChevronRight className="h-6 w-6 text-white" />
              </button>
            </>
          )}

          {/* Dot indicators */}
          {total > 1 && (
            <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    i === current ? "bg-white w-6" : "bg-white/40 hover:bg-white/60"
                  )}
                  aria-label={`Ir a imagen ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}
