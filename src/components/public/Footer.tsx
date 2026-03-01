import Link from "next/link"
import { MapPin, Phone, Mail, Clock } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-navy-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <h3 className="font-serif text-2xl font-semibold text-white mb-3">
              Alturas<span className="text-gold-400">.</span>
            </h3>
            <p className="font-sans text-sm text-slate-400 leading-relaxed mb-4">
              Hotel boutique 4 estrellas en el corazón de Huánuco, con arquitectura colonial restaurada y vistas al río Huallaga.
            </p>
            <div className="flex items-center gap-1 text-gold-400 text-sm font-sans font-bold">
              ★★★★☆ <span className="text-slate-400 font-normal ml-1">4.8/5</span>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-sans text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Hotel</h4>
            <ul className="space-y-2.5">
              {[
                { href: "/rooms", label: "Habitaciones" },
                { href: "/amenities", label: "Servicios" },
                { href: "/booking", label: "Reservar" },
                { href: "/contact", label: "Contacto" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="font-sans text-sm text-slate-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-sans text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Contacto</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm">
                <MapPin className="h-4 w-4 text-gold-400 mt-0.5 shrink-0" />
                <span>Jr. Huallaga 520, Huánuco 10001, Perú</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-gold-400 shrink-0" />
                <span>+51 62 000 0000</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-gold-400 shrink-0" />
                <span>reservas@alturasgrand.pe</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 text-gold-400 shrink-0" />
                <span>Check-in: 15:00 · Check-out: 12:00</span>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="font-sans text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Legal</h4>
            <ul className="space-y-2.5">
              <li>
                <span className="font-sans text-sm text-slate-400 hover:text-white transition-colors cursor-pointer">
                  Política de privacidad
                </span>
              </li>
              <li>
                <span className="font-sans text-sm text-slate-400 hover:text-white transition-colors cursor-pointer">
                  Política de cancelación
                </span>
              </li>
              <li>
                <span className="font-sans text-sm text-slate-400 hover:text-white transition-colors cursor-pointer">
                  Términos y condiciones
                </span>
              </li>
              <li>
                <span className="font-sans text-sm text-slate-400 hover:text-white transition-colors cursor-pointer">
                  FAQ
                </span>
              </li>
            </ul>
            <div className="mt-5 text-xs text-slate-500">
              Métodos de pago: Visa · Mastercard · Yape · Plin
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-navy-700 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-sans text-xs text-slate-500">
            © {new Date().getFullYear()} Alturas Grand Hotel. Todos los derechos reservados.
          </p>
          <p className="font-sans text-xs text-slate-600">
            Mejor precio garantizado en reserva directa
          </p>
        </div>
      </div>
    </footer>
  )
}
