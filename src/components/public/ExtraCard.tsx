"use client"
import { Minus, Plus } from "lucide-react"
import * as LucideIcons from "lucide-react"
import Badge from "@/components/ui/Badge"
import { cn, formatPrice } from "@/lib/utils"

type LucideIconName = keyof typeof LucideIcons

interface ExtraData {
  id: string
  name: string
  description: string
  icon: string
  unitPrice: number
  priceType: "PER_NIGHT" | "PER_PERSON" | "PER_STAY"
  maxQuantity?: number
}

interface ExtraCardProps {
  extra: ExtraData
  selected: boolean
  quantity: number
  onToggle: (extraId: string) => void
  onQuantityChange: (extraId: string, quantity: number) => void
  className?: string
}

const PRICE_TYPE_LABELS: Record<string, string> = {
  PER_NIGHT: "por noche",
  PER_PERSON: "por persona",
  PER_STAY: "por estadía",
}

function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const iconName = name as LucideIconName
  const IconComponent = LucideIcons[iconName] as React.ComponentType<{ className?: string }>

  if (!IconComponent || typeof IconComponent !== "function") {
    const Fallback = LucideIcons.Package as React.ComponentType<{ className?: string }>
    return <Fallback className={className} />
  }

  return <IconComponent className={className} />
}

export default function ExtraCard({
  extra,
  selected,
  quantity,
  onToggle,
  onQuantityChange,
  className,
}: ExtraCardProps) {
  const maxQty = extra.maxQuantity || 10

  const handleIncrement = () => {
    if (quantity < maxQty) onQuantityChange(extra.id, quantity + 1)
  }

  const handleDecrement = () => {
    if (quantity > 1) onQuantityChange(extra.id, quantity - 1)
  }

  return (
    <div
      className={cn(
        "relative rounded-xl border-2 bg-white p-5 transition-all duration-300",
        selected
          ? "border-navy-500 shadow-md ring-2 ring-navy-500/10"
          : "border-slate-100 shadow-sm hover:border-slate-200 hover:shadow-md",
        className
      )}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors duration-300",
            selected ? "bg-navy-50 text-navy-500" : "bg-slate-50 text-slate-400"
          )}
        >
          <DynamicIcon name={extra.icon} className="h-6 w-6" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="font-sans text-sm font-bold text-slate-900">{extra.name}</h4>
              <p className="font-sans text-xs text-slate-500 mt-0.5 line-clamp-2">
                {extra.description}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <Badge variant="gold">{formatPrice(extra.unitPrice)}</Badge>
              <span className="font-sans text-[10px] text-slate-400 font-bold">
                {PRICE_TYPE_LABELS[extra.priceType] ?? extra.priceType}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between mt-4">
            {/* Quantity stepper – visible when selected */}
            {selected && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleDecrement}
                  disabled={quantity <= 1}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Reducir cantidad"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="font-sans text-sm font-bold text-slate-900 w-6 text-center">
                  {quantity}
                </span>
                <button
                  onClick={handleIncrement}
                  disabled={quantity >= maxQty}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Aumentar cantidad"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {!selected && <div />}

            {/* Toggle */}
            <button
              onClick={() => onToggle(extra.id)}
              className={cn(
                "rounded-lg px-4 py-1.5 font-sans text-xs font-bold transition-all duration-200",
                selected
                  ? "bg-navy-500 text-white hover:bg-navy-700"
                  : "bg-navy-50 text-navy-700 hover:bg-navy-100"
              )}
            >
              {selected ? "Quitar" : "Agregar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
