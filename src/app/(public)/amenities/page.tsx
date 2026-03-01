import { generateSEOMetadata } from "@/lib/seo"
import AmenityCard from "@/components/public/AmenityCard"

export const metadata = generateSEOMetadata({
  title: "Servicios & Amenidades",
  description: "Descubre todos los servicios y amenidades de lujo que ofrece Alturas Grand Hotel: piscina temperada, spa, restaurante panorámico, gimnasio y más.",
  path: "/amenities",
})

const AMENITY_SECTIONS = [
  {
    title: "Bienestar & Relax",
    amenities: [
      { iconName: "Waves", title: "Piscina Temperada", description: "Piscina climatizada al aire libre rodeada de jardines tropicales. Disfruta de un baño relajante con temperatura perfecta durante todo el año." },
      { iconName: "Flower2", title: "Spa Completo", description: "Centro de bienestar con sauna, jacuzzi, sala de masajes y tratamientos faciales. Productos orgánicos locales." },
      { iconName: "Sparkles", title: "Sauna Seca & Húmeda", description: "Dos tipos de sauna para purificar cuerpo y mente después de un largo día explorando Huánuco." },
    ],
  },
  {
    title: "Gastronomía",
    amenities: [
      { iconName: "UtensilsCrossed", title: "Restaurante Panorámico", description: "Cocina de autor que fusiona la tradición huanuqueña con técnicas modernas. Vista panorámica al río Huallaga." },
      { iconName: "Wine", title: "Bar Lounge", description: "Cócteles artesanales con ingredientes locales, carta de vinos nacionales e internacionales. Ambiente elegante con música en vivo los fines de semana." },
      { iconName: "Coffee", title: "Café Terraza", description: "Café de especialidad de la región con bollería artesanal. Perfecto para desayunos al aire libre con vista al jardín." },
    ],
  },
  {
    title: "Fitness & Deporte",
    amenities: [
      { iconName: "Dumbbell", title: "Gimnasio 24/7", description: "Equipamiento de última generación: cardio, fuerza, peso libre y zona de stretching. Abierto las 24 horas." },
      { iconName: "Bike", title: "Bicicletas de Cortesía", description: "Explora Huánuco sobre dos ruedas. Bicicletas disponibles sin costo adicional para nuestros huéspedes." },
    ],
  },
  {
    title: "Servicios del Hotel",
    amenities: [
      { iconName: "Wifi", title: "WiFi de Alta Velocidad", description: "Conexión de banda ancha en todas las áreas del hotel: habitaciones, lobby, restaurante, piscina y jardines." },
      { iconName: "Car", title: "Estacionamiento Privado", description: "Estacionamiento vigilado con cámaras 24/7, con capacidad para 30 vehículos. Servicio de valet parking disponible." },
      { iconName: "Headphones", title: "Concierge 24 Horas", description: "Nuestro equipo de concierge te ayudará con tours, transporte, reservas en restaurantes y cualquier solicitud especial." },
      { iconName: "ShieldCheck", title: "Seguridad 24/7", description: "Sistema de seguridad con cámaras, acceso con tarjeta electrónica y personal de vigilancia las 24 horas." },
      { iconName: "Shirt", title: "Lavandería Express", description: "Servicio de lavandería y planchado con entrega en el mismo día. Bolsas disponibles en cada habitación." },
      { iconName: "Plane", title: "Transfer Aeropuerto", description: "Servicio de traslado desde/hacia el aeropuerto de Huánuco. Reserva con anticipación para garantizar disponibilidad." },
    ],
  },
  {
    title: "Eventos & Negocios",
    amenities: [
      { iconName: "Presentation", title: "Centro de Convenciones", description: "Salón principal con capacidad para 150 personas, equipado con proyector, audio profesional y WiFi dedicado." },
      { iconName: "Users", title: "Salas de Reuniones", description: "3 salas de reuniones privadas con capacidad de 8 a 30 personas. Servicio de coffee break incluido." },
      { iconName: "Printer", title: "Business Center", description: "Computadoras, impresora láser, escáner y suministros de oficina. Abierto las 24 horas para huéspedes." },
    ],
  },
]

export default function AmenitiesPage() {
  return (
    <div className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="font-sans text-xs font-bold uppercase tracking-widest text-gold-500 mb-2">
            Servicios & Amenidades
          </p>
          <h1 className="font-serif text-3xl lg:text-4xl font-medium italic text-navy-900 mb-4">
            Todo para una estadía perfecta
          </h1>
          <p className="font-sans text-slate-600 max-w-2xl mx-auto">
            En Alturas Grand Hotel nos dedicamos a ofrecer una experiencia completa.
            Cada detalle está pensado para tu comodidad y disfrute.
          </p>
        </div>

        {/* Sections */}
        {AMENITY_SECTIONS.map((section) => (
          <div key={section.title} className="mb-16">
            <h2 className="font-serif text-2xl font-medium text-navy-900 mb-6 border-l-4 border-gold-400 pl-4">
              {section.title}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {section.amenities.map((amenity) => (
                <AmenityCard
                  key={amenity.title}
                  iconName={amenity.iconName}
                  title={amenity.title}
                  description={amenity.description}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Bottom CTA */}
        <div className="text-center mt-8 p-10 rounded-2xl bg-navy-900">
          <h3 className="font-serif text-2xl font-medium italic text-white mb-3">
            ¿Listo para disfrutar de todo esto?
          </h3>
          <p className="font-sans text-slate-400 mb-6">
            Reserva ahora y vive la experiencia Alturas Grand Hotel.
          </p>
          <a href="/booking">
            <button className="px-8 py-3 bg-gold-500 hover:bg-gold-600 text-navy-900 font-sans font-bold rounded-lg transition-colors">
              Reservar Ahora
            </button>
          </a>
        </div>
      </div>
    </div>
  )
}
