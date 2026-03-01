import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const TAX_RATE = Number(process.env.NEXT_PUBLIC_TAX_RATE) || 0.18
export const CURRENCY_SYMBOL = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "S/"
export const HOTEL_NAME = process.env.NEXT_PUBLIC_HOTEL_NAME || "Alturas Grand Hotel"
export const CHECKIN_TIME = process.env.NEXT_PUBLIC_CHECKIN_TIME || "15:00"
export const CHECKOUT_TIME = process.env.NEXT_PUBLIC_CHECKOUT_TIME || "12:00"

export function formatPrice(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount
  return `${CURRENCY_SYMBOL} ${num.toFixed(2)}`
}

export function formatDate(date: Date | string, format: "short" | "long" | "iso" = "short"): string {
  const d = typeof date === "string" ? new Date(date) : date
  switch (format) {
    case "long":
      return d.toLocaleDateString("es-PE", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    case "iso":
      return d.toISOString().split("T")[0]
    case "short":
    default:
      return d.toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
  }
}

export function nightCount(checkIn: Date | string, checkOut: Date | string): number {
  const start = typeof checkIn === "string" ? new Date(checkIn) : checkIn
  const end = typeof checkOut === "string" ? new Date(checkOut) : checkOut
  return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    AVAILABLE: "bg-emerald-50 border-emerald-300 text-emerald-800",
    OCCUPIED: "bg-navy-50 border-navy-300 text-navy-800",
    HOUSEKEEPING: "bg-amber-50 border-amber-300 text-amber-800",
    MAINTENANCE: "bg-rose-50 border-rose-300 text-rose-800",
    OUT_OF_ORDER: "bg-rose-50 border-rose-300 text-rose-800",
    PENDING: "bg-amber-50 border-amber-300 text-amber-800",
    CONFIRMED: "bg-blue-50 border-blue-300 text-blue-800",
    CHECKED_IN: "bg-emerald-50 border-emerald-300 text-emerald-800",
    CHECKED_OUT: "bg-slate-50 border-slate-300 text-slate-800",
    CANCELLED: "bg-rose-50 border-rose-300 text-rose-800",
    NO_SHOW: "bg-orange-50 border-orange-300 text-orange-800",
  }
  return colors[status] || "bg-slate-50 border-slate-300 text-slate-800"
}
