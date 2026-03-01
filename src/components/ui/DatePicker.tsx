"use client"
import { useState, useRef, useEffect, useCallback } from "react"
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isBefore, isAfter, startOfDay, getDay, addDays } from "date-fns"
import { es } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

interface DatePickerProps {
  checkIn: Date | null
  checkOut: Date | null
  onDateChange: (checkIn: Date | null, checkOut: Date | null) => void
  blockedDates?: string[]
  minDate?: Date
  className?: string
  inline?: boolean
}

export default function DatePicker({
  checkIn,
  checkOut,
  onDateChange,
  blockedDates = [],
  minDate,
  className,
  inline = false,
}: DatePickerProps) {
  const [open, setOpen] = useState(inline)
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(checkIn || new Date()))
  const [selecting, setSelecting] = useState<"checkIn" | "checkOut">("checkIn")
  const ref = useRef<HTMLDivElement>(null)

  const today = startOfDay(new Date())
  const min = minDate || today

  useEffect(() => {
    if (inline) return
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [inline])

  const isBlocked = useCallback(
    (date: Date) => blockedDates.includes(format(date, "yyyy-MM-dd")),
    [blockedDates]
  )

  const handleDayClick = useCallback(
    (day: Date) => {
      if (isBefore(day, min) || isBlocked(day)) return

      if (selecting === "checkIn") {
        onDateChange(day, null)
        setSelecting("checkOut")
      } else {
        if (checkIn && isBefore(day, checkIn)) {
          onDateChange(day, null)
          setSelecting("checkOut")
        } else {
          onDateChange(checkIn, day)
          setSelecting("checkIn")
          if (!inline) setOpen(false)
        }
      }
    },
    [selecting, checkIn, min, isBlocked, onDateChange, inline]
  )

  const renderMonth = (monthDate: Date) => {
    const start = startOfMonth(monthDate)
    const end = endOfMonth(monthDate)
    const days = eachDayOfInterval({ start, end })
    const startDay = getDay(start)

    return (
      <div>
        <h3 className="text-center font-sans text-sm font-bold text-slate-700 mb-3">
          {format(monthDate, "MMMM yyyy", { locale: es })}
        </h3>
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"].map((d) => (
            <div key={d} className="text-center text-xs font-bold text-slate-400 py-1">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {Array.from({ length: (startDay + 6) % 7 }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {days.map((day) => {
            const blocked = isBlocked(day)
            const past = isBefore(day, min)
            const disabled = blocked || past
            const isCheckIn = checkIn && isSameDay(day, checkIn)
            const isCheckOut = checkOut && isSameDay(day, checkOut)
            const isInRange =
              checkIn && checkOut && isAfter(day, checkIn) && isBefore(day, checkOut)

            return (
              <button
                key={day.toISOString()}
                type="button"
                disabled={disabled}
                onClick={() => handleDayClick(day)}
                className={cn(
                  "relative h-9 w-full rounded text-sm transition-colors font-sans",
                  disabled && "text-slate-300 cursor-not-allowed",
                  blocked && "line-through decoration-rose-400",
                  !disabled && "hover:bg-gold-100 cursor-pointer",
                  isCheckIn && "bg-navy-500 text-white rounded-l-full hover:bg-navy-600",
                  isCheckOut && "bg-navy-500 text-white rounded-r-full hover:bg-navy-600",
                  isInRange && "bg-navy-100 text-navy-800",
                  isSameDay(day, today) && !isCheckIn && !isCheckOut && "font-bold text-gold-500"
                )}
              >
                {format(day, "d")}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  const nextMonth = addMonths(currentMonth, 1)

  return (
    <div ref={ref} className={cn("relative", className)}>
      {!inline && (
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-left transition-colors hover:border-navy-300 focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/20"
        >
          <Calendar className="h-4 w-4 text-slate-400" />
          <span className={cn(!checkIn && "text-slate-400")}>
            {checkIn ? format(checkIn, "dd MMM yyyy", { locale: es }) : "Check-in"}
          </span>
          <span className="text-slate-300">→</span>
          <span className={cn(!checkOut && "text-slate-400")}>
            {checkOut ? format(checkOut, "dd MMM yyyy", { locale: es }) : "Check-out"}
          </span>
        </button>
      )}

      {(open || inline) && (
        <div
          className={cn(
            "bg-white rounded-xl shadow-luxury p-4 z-50",
            !inline && "absolute top-full left-0 mt-2"
          )}
        >
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-1 rounded hover:bg-slate-100"
            >
              <ChevronLeft className="h-5 w-5 text-slate-600" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-1 rounded hover:bg-slate-100"
            >
              <ChevronRight className="h-5 w-5 text-slate-600" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderMonth(currentMonth)}
            {renderMonth(nextMonth)}
          </div>

          <div className="mt-3 flex items-center gap-4 text-xs text-slate-500 font-sans border-t border-slate-100 pt-3">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-navy-500 inline-block" /> Seleccionado
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-navy-100 inline-block" /> Rango
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-slate-200 line-through inline-block" /> No disponible
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
