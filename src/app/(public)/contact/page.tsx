import { generateSEOMetadata } from "@/lib/seo"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { MapPin, Phone, Mail, Clock } from "lucide-react"

export const metadata = generateSEOMetadata({
  title: "Contacto",
  description: "Contáctanos para reservas, consultas o cualquier información sobre Alturas Grand Hotel en Huánuco, Perú.",
  path: "/contact",
})

export default function ContactPage() {
  return (
    <div className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <p className="font-sans text-xs font-bold uppercase tracking-widest text-gold-500 mb-2">Contacto</p>
          <h1 className="font-serif text-3xl lg:text-4xl font-medium italic text-navy-900 mb-4">
            Estamos aquí para ayudarte
          </h1>
          <p className="font-sans text-slate-600 max-w-xl mx-auto">
            ¿Tienes alguna pregunta o solicitud especial? Contáctanos y te responderemos a la brevedad.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="p-8 rounded-2xl border border-ivory-200 bg-white shadow-sm">
            <h2 className="font-serif text-xl font-medium text-navy-900 mb-6">Envíanos un mensaje</h2>
            <form className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input label="Nombre *" placeholder="Tu nombre" />
                <Input label="Apellido *" placeholder="Tu apellido" />
              </div>
              <Input label="Email *" type="email" placeholder="tu@email.com" />
              <Input label="Teléfono" type="tel" placeholder="+51 999 999 999" />
              <div>
                <label className="block font-sans text-sm font-medium text-navy-900 mb-1.5">Asunto</label>
                <select className="w-full px-4 py-2.5 rounded-lg border border-ivory-300 bg-white font-sans text-sm text-navy-900 focus:ring-2 focus:ring-gold-300 focus:border-gold-400 outline-none transition-all">
                  <option value="">Selecciona un asunto</option>
                  <option value="reserva">Consulta sobre reserva</option>
                  <option value="grupos">Reserva grupal / eventos</option>
                  <option value="servicios">Servicios del hotel</option>
                  <option value="reclamo">Reclamo o sugerencia</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div>
                <label className="block font-sans text-sm font-medium text-navy-900 mb-1.5">Mensaje *</label>
                <textarea
                  rows={5}
                  placeholder="Escribe tu mensaje aquí..."
                  className="w-full px-4 py-2.5 rounded-lg border border-ivory-300 bg-white font-sans text-sm text-navy-900 placeholder:text-slate-400 focus:ring-2 focus:ring-gold-300 focus:border-gold-400 outline-none transition-all resize-none"
                />
              </div>
              <Button variant="gold" size="lg" className="w-full">
                Enviar mensaje
              </Button>
            </form>
          </div>

          {/* Contact Info + Map */}
          <div className="space-y-8">
            {/* Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-ivory-50 border border-ivory-200">
                <MapPin className="w-6 h-6 text-gold-500 mb-3" />
                <p className="font-sans font-bold text-sm text-navy-900">Dirección</p>
                <p className="font-sans text-xs text-slate-600 mt-1">Jr. Huallaga 520, Huánuco 10001, Perú</p>
              </div>
              <div className="p-5 rounded-xl bg-ivory-50 border border-ivory-200">
                <Phone className="w-6 h-6 text-gold-500 mb-3" />
                <p className="font-sans font-bold text-sm text-navy-900">Teléfono</p>
                <p className="font-sans text-xs text-slate-600 mt-1">+51 62 000 0000</p>
                <p className="font-sans text-xs text-slate-400">WhatsApp: +51 962 000 000</p>
              </div>
              <div className="p-5 rounded-xl bg-ivory-50 border border-ivory-200">
                <Mail className="w-6 h-6 text-gold-500 mb-3" />
                <p className="font-sans font-bold text-sm text-navy-900">Email</p>
                <p className="font-sans text-xs text-slate-600 mt-1">reservas@alturasgrand.pe</p>
                <p className="font-sans text-xs text-slate-400">info@alturasgrand.pe</p>
              </div>
              <div className="p-5 rounded-xl bg-ivory-50 border border-ivory-200">
                <Clock className="w-6 h-6 text-gold-500 mb-3" />
                <p className="font-sans font-bold text-sm text-navy-900">Horarios</p>
                <p className="font-sans text-xs text-slate-600 mt-1">Recepción: 24 horas</p>
                <p className="font-sans text-xs text-slate-400">Check-in: 14:00 · Check-out: 12:00</p>
              </div>
            </div>

            {/* Map */}
            <div className="rounded-2xl overflow-hidden shadow-luxury h-[350px]">
              <iframe
                src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d-76.2404!3d-9.9270!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOcKwNTUnMzcuMiJTIDc2wrAxNCcyNS40Ilc!5e0!3m2!1ses!2spe!4v1234567890`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación de Alturas Grand Hotel"
              />
            </div>

            {/* Quick info */}
            <div className="p-6 rounded-xl bg-navy-900 text-white">
              <h3 className="font-serif text-lg font-medium mb-2">¿Prefieres hablar directamente?</h3>
              <p className="font-sans text-sm text-slate-300 mb-4">
                Nuestro equipo de reservas está disponible de lunes a domingo, 8:00 AM - 10:00 PM.
              </p>
              <a
                href="tel:+5162000000"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-navy-900 font-sans font-bold text-sm rounded-lg transition-colors"
              >
                <Phone className="w-4 h-4" />
                Llamar ahora
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
