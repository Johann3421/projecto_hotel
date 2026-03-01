import { cn } from "@/lib/utils"

interface BadgeProps {
  children: React.ReactNode
  variant?: "default" | "success" | "warning" | "danger" | "info" | "gold"
  size?: "sm" | "md" | "lg"
  className?: string
}

export default function Badge({ children, variant = "default", size = "sm", className }: BadgeProps) {
  const variants = {
    default: "bg-slate-100 text-slate-700 border-slate-200",
    success: "bg-emerald-50 text-emerald-800 border-emerald-300",
    warning: "bg-amber-50 text-amber-800 border-amber-300",
    danger: "bg-rose-50 text-rose-800 border-rose-300",
    info: "bg-blue-50 text-blue-800 border-blue-300",
    gold: "bg-gold-100 text-gold-700 border-gold-200",
  }

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-sans font-bold",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  )
}
