import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface BookingStepIndicatorProps {
  currentStep: number
  className?: string
}

const STEPS = [
  { number: 1, label: "Selección" },
  { number: 2, label: "Huésped" },
  { number: 3, label: "Extras" },
  { number: 4, label: "Pago" },
]

export default function BookingStepIndicator({ currentStep, className }: BookingStepIndicatorProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => {
          const isCompleted = currentStep > step.number
          const isActive = currentStep === step.number
          const isPending = currentStep < step.number

          return (
            <div key={step.number} className="flex items-center flex-1 last:flex-none">
              {/* Step circle + label */}
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    "relative flex h-10 w-10 items-center justify-center rounded-full border-2 font-sans text-sm font-bold transition-all duration-300",
                    isCompleted && "border-navy-500 bg-navy-500 text-white",
                    isActive && "border-navy-500 bg-white text-navy-500 ring-4 ring-navy-500/20",
                    isPending && "border-slate-300 bg-white text-slate-300"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span>{step.number}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "font-sans text-xs font-bold whitespace-nowrap transition-colors duration-300",
                    isCompleted && "text-navy-500",
                    isActive && "text-navy-700",
                    isPending && "text-slate-300"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {index < STEPS.length - 1 && (
                <div className="flex-1 mx-3 mb-6">
                  <div className="relative h-0.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "absolute inset-y-0 left-0 bg-navy-500 rounded-full transition-all duration-500",
                        isCompleted ? "w-full" : isActive ? "w-1/2" : "w-0"
                      )}
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
