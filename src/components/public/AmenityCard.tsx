import * as LucideIcons from "lucide-react"
import { cn } from "@/lib/utils"

type LucideIconName = keyof typeof LucideIcons

interface AmenityCardProps {
  iconName: string
  title: string
  description: string
  className?: string
}

function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const iconName = name as LucideIconName
  const IconComponent = LucideIcons[iconName] as React.ComponentType<{ className?: string }>

  if (!IconComponent || typeof IconComponent !== "function") {
    const Fallback = LucideIcons.Star as React.ComponentType<{ className?: string }>
    return <Fallback className={className} />
  }

  return <IconComponent className={className} />
}

export default function AmenityCard({ iconName, title, description, className }: AmenityCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-slate-100 shadow-sm p-6 transition-shadow duration-300 hover:shadow-md",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-50 mb-4">
        <DynamicIcon name={iconName} className="h-6 w-6 text-navy-500" />
      </div>
      <h3 className="font-serif text-base font-semibold text-slate-900 mb-1.5">{title}</h3>
      <p className="font-sans text-sm text-slate-500 leading-relaxed">{description}</p>
    </div>
  )
}
