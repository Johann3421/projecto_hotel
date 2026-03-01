"use client"

import Link from "next/link"
import Button from "@/components/ui/Button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="font-serif text-6xl font-bold text-gold-500 mb-4">Error</p>
        <h1 className="font-serif text-2xl font-medium text-navy-900 mb-3">
          Algo salió mal
        </h1>
        <p className="font-sans text-sm text-slate-500 mb-6">
          Ha ocurrido un error inesperado. Nuestro equipo ha sido notificado.
        </p>
        <div className="flex gap-4 justify-center">
          <Button variant="gold" onClick={reset}>
            Intentar de nuevo
          </Button>
          <Link href="/">
            <Button variant="outline">Volver al inicio</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
