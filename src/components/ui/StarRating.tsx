import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface StarRatingProps {
  rating: number
  max?: number
  size?: "sm" | "md" | "lg"
  className?: string
}

export default function StarRating({ rating, max = 5, size = "md", className }: StarRatingProps) {
  const sizes = {
    sm: "h-3.5 w-3.5",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            sizes[size],
            i < Math.floor(rating)
              ? "fill-gold-400 text-gold-400"
              : i < rating
              ? "fill-gold-400/50 text-gold-400"
              : "fill-slate-200 text-slate-200"
          )}
        />
      ))}
    </div>
  )
}
