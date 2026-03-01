"use client"
import { useEffect, useState } from "react"
import { CheckCircle, AlertCircle, X, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface ToastProps {
  message: string
  type?: "success" | "error" | "info"
  duration?: number
  onClose: () => void
}

export default function Toast({ message, type = "info", duration = 4000, onClose }: ToastProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 300)
    }, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-emerald-500" />,
    error: <AlertCircle className="h-5 w-5 text-rose-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
  }

  const styles = {
    success: "border-emerald-200 bg-emerald-50",
    error: "border-rose-200 bg-rose-50",
    info: "border-blue-200 bg-blue-50",
  }

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-[100] flex items-center gap-3 rounded-xl border px-5 py-3 shadow-luxury transition-all duration-300 font-sans",
        styles[type],
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      )}
    >
      {icons[type]}
      <span className="text-sm text-slate-700">{message}</span>
      <button onClick={() => { setVisible(false); setTimeout(onClose, 300) }} className="ml-2 p-1 hover:bg-white/50 rounded">
        <X className="h-4 w-4 text-slate-400" />
      </button>
    </div>
  )
}
