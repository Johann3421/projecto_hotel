"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { LogIn } from "lucide-react"

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/admin"
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError("Credenciales inválidas. Verifica tu email y contraseña.")
      setLoading(false)
      return
    }

    router.push(callbackUrl)
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ivory-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-serif text-2xl font-bold text-navy-900">
            Alturas<span className="text-gold-500">Grand</span>
          </Link>
          <h1 className="font-serif text-xl font-medium text-navy-900 mt-4">Iniciar sesión</h1>
          <p className="font-sans text-sm text-slate-500 mt-1">Accede al panel de administración</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 rounded-2xl border border-ivory-200 bg-white shadow-luxury">
          <div className="space-y-5">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@alturasgrand.pe"
              required
            />
            <Input
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <p className="mt-4 font-sans text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
          )}

          <Button type="submit" variant="gold" size="lg" className="w-full mt-6" loading={loading}>
            <LogIn className="w-4 h-4 mr-2" />
            Ingresar
          </Button>

          <div className="mt-6 p-4 rounded-lg bg-ivory-50 border border-ivory-200">
            <p className="font-sans text-xs font-bold text-navy-900 mb-2">Credenciales de prueba:</p>
            <div className="space-y-1 font-sans text-xs text-slate-600">
              <p><strong>Manager:</strong> manager@alturasgrand.pe / password123</p>
              <p><strong>Recepción:</strong> recepcion1@alturasgrand.pe / password123</p>
              <p><strong>Limpieza:</strong> limpieza1@alturasgrand.pe / password123</p>
            </div>
          </div>
        </form>

        <p className="text-center mt-6 font-sans text-sm text-slate-500">
          <Link href="/" className="text-gold-600 hover:text-gold-700 transition-colors">
            ← Volver al sitio
          </Link>
        </p>
      </div>
    </div>
  )
}