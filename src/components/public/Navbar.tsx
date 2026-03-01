"use client"
import { useState } from "react"
import Link from "next/link"
import { Menu, X, Phone } from "lucide-react"
import Button from "@/components/ui/Button"
import { cn } from "@/lib/utils"

const links = [
  { href: "/rooms", label: "Habitaciones" },
  { href: "/amenities", label: "Servicios" },
  { href: "/contact", label: "Contacto" },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 bg-ivory-50/95 backdrop-blur border-b border-ivory-200">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <svg width="32" height="32" viewBox="0 0 32 32" className="text-navy-700">
              <path d="M16 2L4 14h4v14h16V14h4L16 2z" fill="currentColor" opacity="0.2" />
              <path d="M16 4L6 14h3v12h14V14h3L16 4z" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <rect x="13" y="18" width="6" height="8" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none" />
              <circle cx="17.5" cy="22" r="0.8" fill="currentColor" />
            </svg>
            <span className="font-serif text-xl font-semibold text-navy-900 tracking-tight">
              Alturas<span className="text-gold-400">.</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-sans text-sm font-normal text-slate-600 hover:text-navy-700 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-4">
            <a href={`tel:${process.env.NEXT_PUBLIC_HOTEL_PHONE}`} className="flex items-center gap-1.5 text-sm text-slate-500">
              <Phone className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">+51 62 000 0000</span>
            </a>
            <Link href="/booking">
              <Button variant="gold" size="sm">
                Reservar Ahora
              </Button>
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-ivory-100"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300 border-t border-ivory-200",
          mobileOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-4 py-4 space-y-3 bg-ivory-50">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block font-sans text-sm text-slate-700 hover:text-navy-700 py-2"
            >
              {link.label}
            </Link>
          ))}
          <Link href="/booking" onClick={() => setMobileOpen(false)}>
            <Button variant="gold" size="sm" className="w-full">
              Reservar Ahora
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
