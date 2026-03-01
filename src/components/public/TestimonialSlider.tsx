"use client"
import { useState, useEffect, useCallback } from "react"
import { Quote } from "lucide-react"
import StarRating from "@/components/ui/StarRating"
import { cn } from "@/lib/utils"

interface Testimonial {
  id: number
  name: string
  country: string
  date: string
  rating: number
  text: string
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: "María José Rodríguez",
    country: "Perú",
    date: "Enero 2026",
    rating: 5,
    text: "Una experiencia inolvidable. Las vistas al Valle Sagrado desde la suite fueron impresionantes. El servicio fue impecable y la atención al detalle en cada rincón del hotel es admirable. Sin duda volveremos.",
  },
  {
    id: 2,
    name: "James & Sarah Mitchell",
    country: "Estados Unidos",
    date: "Diciembre 2025",
    rating: 5,
    text: "We celebrated our anniversary here and it exceeded all expectations. The spa treatments using local ingredients were heavenly. The concierge arranged a private tour to Machu Picchu that was perfectly organized.",
  },
  {
    id: 3,
    name: "Carlos Alberto Mendoza",
    country: "Colombia",
    date: "Noviembre 2025",
    rating: 4.5,
    text: "El restaurante del hotel ofrece una fusión perfecta entre cocina peruana tradicional y alta gastronomía. La habitación era espaciosa y cómoda, con todos los amenities de un hotel de lujo. Muy recomendado.",
  },
  {
    id: 4,
    name: "Sophie Laurent",
    country: "Francia",
    date: "Octubre 2025",
    rating: 5,
    text: "Un hôtel magnifique avec un service exceptionnel. L'architecture mélange parfaitement le style colonial et le confort moderne. Le personnel parle plusieurs langues et est toujours disponible. Une perle dans les Andes.",
  },
  {
    id: 5,
    name: "Takeshi Yamamoto",
    country: "Japón",
    date: "Septiembre 2025",
    rating: 4.5,
    text: "La ubicación es perfecta para explorar Cusco y los sitios arqueológicos. El desayuno buffet ofrece una variedad increíble con productos locales. Las habitaciones cuentan con calefacción excelente para las noches frías.",
  },
  {
    id: 6,
    name: "Ana Beatriz Silva",
    country: "Brasil",
    date: "Agosto 2025",
    rating: 5,
    text: "Superou todas as expectativas! O hotel combina luxo com a cultura andina de forma única. O jardim interior é um oásis de tranquilidade. A equipe nos ajudou com tudo, desde reservas até recomendações locais.",
  },
]

const AUTOPLAY_INTERVAL = 5000

export default function TestimonialSlider({ className }: { className?: string }) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const [fadeKey, setFadeKey] = useState(0)

  const total = TESTIMONIALS.length

  const goTo = useCallback(
    (index: number) => {
      setCurrent((index + total) % total)
      setFadeKey((k) => k + 1)
    },
    [total]
  )

  const next = useCallback(() => goTo(current + 1), [current, goTo])

  // Autoplay
  useEffect(() => {
    if (paused) return

    const timer = setInterval(next, AUTOPLAY_INTERVAL)
    return () => clearInterval(timer)
  }, [paused, next])

  const testimonial = TESTIMONIALS[current]

  return (
    <div
      className={cn("relative w-full", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Testimonial content with fade */}
      <div className="relative min-h-70 flex items-center justify-center">
        <div
          key={fadeKey}
          className="w-full max-w-2xl mx-auto text-center animate-in fade-in duration-500"
        >
          {/* Quote icon */}
          <div className="flex justify-center mb-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-100">
              <Quote className="h-5 w-5 text-gold-500" />
            </div>
          </div>

          {/* Star rating */}
          <div className="flex justify-center mb-4">
            <StarRating rating={testimonial.rating} size="md" />
          </div>

          {/* Review text */}
          <blockquote className="font-sans text-base leading-relaxed text-slate-600 mb-6 px-4">
            &ldquo;{testimonial.text}&rdquo;
          </blockquote>

          {/* Guest info */}
          <div className="space-y-1">
            <p className="font-serif text-base font-semibold text-slate-900">
              {testimonial.name}
            </p>
            <p className="font-sans text-xs text-slate-400">
              {testimonial.country} &middot; {testimonial.date}
            </p>
          </div>
        </div>
      </div>

      {/* Dot indicators */}
      <div className="flex items-center justify-center gap-2 mt-6">
        {TESTIMONIALS.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              i === current
                ? "w-6 bg-navy-500"
                : "w-2 bg-slate-200 hover:bg-slate-300"
            )}
            aria-label={`Ver testimonio ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
