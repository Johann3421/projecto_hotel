import Link from "next/link"
import Button from "@/components/ui/Button"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-ivory-50">
      <div className="text-center max-w-md">
        <p className="font-serif text-8xl font-bold text-gold-500 mb-4">404</p>
        <h1 className="font-serif text-2xl font-medium text-navy-900 mb-3">
          Página no encontrada
        </h1>
        <p className="font-sans text-sm text-slate-500 mb-6">
          La página que buscas no existe o ha sido movida. Te invitamos a volver al inicio.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/">
            <Button variant="gold">Volver al inicio</Button>
          </Link>
          <Link href="/rooms">
            <Button variant="outline">Ver habitaciones</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
