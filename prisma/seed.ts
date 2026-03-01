import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"
import bcrypt from "bcryptjs"
import { addDays, subDays, startOfDay } from "date-fns"

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  console.log("🏨 Seeding Alturas Grand Hotel database...")

  // Clean up
  await prisma.payment.deleteMany()
  await prisma.reservationExtra.deleteMany()
  await prisma.reservationRoom.deleteMany()
  await prisma.reservation.deleteMany()
  await prisma.roomBlock.deleteMany()
  await prisma.roomStatusLog.deleteMany()
  await prisma.roomTypeAmenity.deleteMany()
  await prisma.roomTypeExtra.deleteMany()
  await prisma.roomTypeImage.deleteMany()
  await prisma.seasonalPrice.deleteMany()
  await prisma.room.deleteMany()
  await prisma.roomType.deleteMany()
  await prisma.amenity.deleteMany()
  await prisma.extra.deleteMany()
  await prisma.guest.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()

  const hashedPassword = await bcrypt.hash("password123", 12)

  // ==================== USERS ====================
  console.log("👤 Creating users...")

  const manager = await prisma.user.create({
    data: {
      name: "Carlos Mendoza",
      email: "manager@alturasgrand.pe",
      password: hashedPassword,
      role: "MANAGER",
    },
  })

  const receptionist1 = await prisma.user.create({
    data: {
      name: "María García",
      email: "recepcion1@alturasgrand.pe",
      password: hashedPassword,
      role: "RECEPTIONIST",
    },
  })

  const receptionist2 = await prisma.user.create({
    data: {
      name: "José Pérez",
      email: "recepcion2@alturasgrand.pe",
      password: hashedPassword,
      role: "RECEPTIONIST",
    },
  })

  const housekeeper1 = await prisma.user.create({
    data: {
      name: "Rosa Huamán",
      email: "limpieza1@alturasgrand.pe",
      password: hashedPassword,
      role: "HOUSEKEEPER",
    },
  })

  const housekeeper2 = await prisma.user.create({
    data: {
      name: "Lucía Espinoza",
      email: "limpieza2@alturasgrand.pe",
      password: hashedPassword,
      role: "HOUSEKEEPER",
    },
  })

  // Guest users
  const guestUsers = await Promise.all(
    Array.from({ length: 20 }, (_, i) =>
      prisma.user.create({
        data: {
          name: guestNames[i].name,
          email: guestNames[i].email,
          password: hashedPassword,
          role: "GUEST",
        },
      })
    )
  )

  // ==================== GUESTS ====================
  console.log("🧳 Creating guest profiles...")

  const guests = await Promise.all(
    guestUsers.map((u: any, i: any) =>
      prisma.guest.create({
        data: {
          firstName: guestNames[i].firstName,
          lastName: guestNames[i].lastName,
          email: guestNames[i].email,
          phone: guestNames[i].phone,
          nationality: guestNames[i].nationality,
          documentType: guestNames[i].docType as any,
          documentNumber: guestNames[i].docNum,
          vipStatus: i < 3,
          notes: i < 3 ? "Huésped VIP - tratamiento preferencial" : null,
          userId: u.id,
        },
      })
    )
  )

  // ==================== AMENITIES ====================
  console.log("✨ Creating amenities...")

  const amenities = await Promise.all([
    // ROOM
    prisma.amenity.create({ data: { name: "WiFi 5G", icon: "Wifi", category: "ROOM" } }),
    prisma.amenity.create({ data: { name: "Aire acondicionado", icon: "Wind", category: "ROOM" } }),
    prisma.amenity.create({ data: { name: 'TV 55" Smart', icon: "Monitor", category: "ROOM" } }),
    prisma.amenity.create({ data: { name: "Minibar", icon: "Wine", category: "ROOM" } }),
    prisma.amenity.create({ data: { name: "Caja de seguridad", icon: "Lock", category: "ROOM" } }),
    prisma.amenity.create({ data: { name: "Escritorio ejecutivo", icon: "Lamp", category: "ROOM" } }),
    // BATHROOM
    prisma.amenity.create({ data: { name: "Ducha a vapor", icon: "CloudRain", category: "BATHROOM" } }),
    prisma.amenity.create({ data: { name: "Bañera de hidromasaje", icon: "Bath", category: "BATHROOM" } }),
    prisma.amenity.create({ data: { name: "Amenities premium", icon: "Sparkles", category: "BATHROOM" } }),
    prisma.amenity.create({ data: { name: "Albornoz y pantuflas", icon: "Shirt", category: "BATHROOM" } }),
    // SERVICE
    prisma.amenity.create({ data: { name: "Desayuno incluido", icon: "Coffee", category: "SERVICE" } }),
    prisma.amenity.create({ data: { name: "Room service 24h", icon: "Bell", category: "SERVICE" } }),
    prisma.amenity.create({ data: { name: "Concierge", icon: "HeadphonesIcon", category: "SERVICE" } }),
    prisma.amenity.create({ data: { name: "Lavandería express", icon: "Shirt", category: "SERVICE" } }),
    // WELLNESS
    prisma.amenity.create({ data: { name: "Piscina temperada", icon: "Waves", category: "WELLNESS" } }),
    prisma.amenity.create({ data: { name: "Acceso spa", icon: "Flower2", category: "WELLNESS" } }),
    prisma.amenity.create({ data: { name: "Gimnasio equipado", icon: "Dumbbell", category: "WELLNESS" } }),
    prisma.amenity.create({ data: { name: "Yoga al amanecer", icon: "Sun", category: "WELLNESS" } }),
    // FOOD_DRINK
    prisma.amenity.create({ data: { name: "Café Nespresso", icon: "Coffee", category: "FOOD_DRINK" } }),
    prisma.amenity.create({ data: { name: "Minibar premium", icon: "GlassWater", category: "FOOD_DRINK" } }),
  ])

  // ==================== ROOM TYPES ====================
  console.log("🛏️ Creating room types...")

  const standard = await prisma.roomType.create({
    data: {
      name: "Habitación Estándar",
      slug: "habitacion-estandar",
      description:
        "Confort y elegancia en un espacio acogedor de 25m². Nuestra habitación estándar ofrece todo lo necesario para una estadía memorable en Huánuco. Decorada con una armoniosa combinación de estilo colonial y toques modernos, cuenta con una cama queen-size con ropa de cama premium de 400 hilos, escritorio de trabajo, y un baño completo con amenities de cortesía. Perfecta para viajeros de negocios o parejas que buscan calidad sin concesiones.",
      shortDesc: "Elegancia colonial con todas las comodidades modernas",
      basePrice: 180,
      weekendSurcharge: 0.15,
      maxGuests: 2,
      bedConfiguration: "1 cama Queen",
      sizeSqm: 25,
      floor: "Pisos 1-2",
      view: "Vista al jardín interior",
    },
  })

  const superior = await prisma.roomType.create({
    data: {
      name: "Habitación Superior Vista Río",
      slug: "superior-vista-rio",
      description:
        "Despierta con la majestuosa vista del río Huallaga desde tu balcón privado. Esta habitación de 32m² eleva la experiencia con una cama king-size, sala de estar compacta junto a la ventana, y un baño amplio con ducha de lluvia. Los tonos tierra y la madera noble crean un refugio de tranquilidad donde cada amanecer es un espectáculo natural. Incluye servicio de bienvenida con frutas de la región.",
      shortDesc: "Balcón privado con vista panorámica al río Huallaga",
      basePrice: 260,
      weekendSurcharge: 0.15,
      maxGuests: 2,
      bedConfiguration: "1 cama King",
      sizeSqm: 32,
      floor: "Pisos 2-3",
      view: "Vista al río Huallaga",
    },
  })

  const familiar = await prisma.roomType.create({
    data: {
      name: "Habitación Familiar",
      slug: "habitacion-familiar",
      description:
        "Espacio generoso de 45m² diseñado para familias que viajan con niños. Dispone de una cama king-size y dos camas twin en un área separada por un biombo decorativo, permitiendo privacidad sin perder la conexión. El minibar incluye opciones sin alcohol, y el baño cuenta con bañera ideal para los más pequeños. Ubicada en pisos intermedios con medidas de seguridad reforzadas en ventanas y balcón.",
      shortDesc: "Amplio espacio para toda la familia con vistas privilegiadas",
      basePrice: 320,
      weekendSurcharge: 0.20,
      maxGuests: 4,
      bedConfiguration: "1 cama King + 2 camas Twin",
      sizeSqm: 45,
      floor: "Pisos 3-4",
      view: "Vista al jardín y montañas",
    },
  })

  const suiteEjecutiva = await prisma.roomType.create({
    data: {
      name: "Suite Ejecutiva",
      slug: "suite-ejecutiva",
      description:
        "Para el viajero exigente que necesita un espacio de trabajo y descanso excepcional. La Suite Ejecutiva de 60m² cuenta con dormitorio separado con cama king-size, sala de estar con sofá de diseño italiano, escritorio ejecutivo con iluminación profesional, y un baño de mármol con bañera de hidromasaje y ducha walk-in. Incluye acceso al lounge ejecutivo, check-in prioritario y servicio de planchado diario.",
      shortDesc: "Lujo ejecutivo con sala independiente y jacuzzi privado",
      basePrice: 480,
      weekendSurcharge: 0.15,
      maxGuests: 2,
      bedConfiguration: "1 cama King de lujo",
      sizeSqm: 60,
      floor: "Pisos 4-5",
      view: "Vista panorámica al río",
    },
  })

  const suitePresidencial = await prisma.roomType.create({
    data: {
      name: "Suite Presidencial",
      slug: "suite-presidencial",
      description:
        "La joya de Alturas Grand Hotel. Con 90m² de opulencia refinada, la Suite Presidencial ocupa la esquina privilegiada del último piso con vistas de 270° al río Huallaga y las montañas circundantes. Incluye dormitorio master con vestidor walk-in, sala de estar formal, comedor para 4 personas, cocina kitchenette, y un baño digno de un spa con bañera independiente de mármol Carrara, ducha a vapor y toallas calefactadas. Servicio de mayordomo personal durante toda la estadía.",
      shortDesc: "90m² de lujo absoluto con vistas 270° y mayordomo personal",
      basePrice: 850,
      weekendSurcharge: 0.10,
      maxGuests: 3,
      bedConfiguration: "1 cama Emperor + sofá cama",
      sizeSqm: 90,
      floor: "Piso 5 (Último)",
      view: "Vista panorámica 270° — río y montañas",
    },
  })

  const roomTypes = [standard, superior, familiar, suiteEjecutiva, suitePresidencial]

  // ==================== ROOM TYPE IMAGES ====================
  console.log("📸 Creating room images...")

  const imageData = [
    { rtId: standard.id, images: [
      { url: "/images/rooms/estandar-1.jpg", alt: "Habitación Estándar - Cama", caption: "Cama queen-size con ropa de 400 hilos", position: 0 },
      { url: "/images/rooms/estandar-2.jpg", alt: "Habitación Estándar - Baño", caption: "Baño completo con amenities premium", position: 1 },
      { url: "/images/rooms/estandar-3.jpg", alt: "Habitación Estándar - Escritorio", caption: "Zona de trabajo iluminada", position: 2 },
    ]},
    { rtId: superior.id, images: [
      { url: "/images/rooms/superior-1.jpg", alt: "Superior Vista Río - Cama", caption: "Cama king con vista al río", position: 0 },
      { url: "/images/rooms/superior-2.jpg", alt: "Superior Vista Río - Balcón", caption: "Balcón privado sobre el Huallaga", position: 1 },
      { url: "/images/rooms/superior-3.jpg", alt: "Superior Vista Río - Baño", caption: "Ducha de lluvia en baño de mármol", position: 2 },
    ]},
    { rtId: familiar.id, images: [
      { url: "/images/rooms/familiar-1.jpg", alt: "Habitación Familiar - General", caption: "Espacio amplio para toda la familia", position: 0 },
      { url: "/images/rooms/familiar-2.jpg", alt: "Habitación Familiar - Camas Twin", caption: "Área infantil con dos camas twin", position: 1 },
      { url: "/images/rooms/familiar-3.jpg", alt: "Habitación Familiar - Baño", caption: "Baño con bañera familiar", position: 2 },
    ]},
    { rtId: suiteEjecutiva.id, images: [
      { url: "/images/rooms/suite-exec-1.jpg", alt: "Suite Ejecutiva - Dormitorio", caption: "Dormitorio master con cama king", position: 0 },
      { url: "/images/rooms/suite-exec-2.jpg", alt: "Suite Ejecutiva - Sala", caption: "Sala de estar con sofá italiano", position: 1 },
      { url: "/images/rooms/suite-exec-3.jpg", alt: "Suite Ejecutiva - Jacuzzi", caption: "Baño con jacuzzi privado", position: 2 },
    ]},
    { rtId: suitePresidencial.id, images: [
      { url: "/images/rooms/suite-pres-1.jpg", alt: "Suite Presidencial - Vista", caption: "Vista panorámica 270° desde la suite", position: 0 },
      { url: "/images/rooms/suite-pres-2.jpg", alt: "Suite Presidencial - Sala", caption: "Sala de estar con comedor formal", position: 1 },
      { url: "/images/rooms/suite-pres-3.jpg", alt: "Suite Presidencial - Baño", caption: "Baño de mármol Carrara con bañera independiente", position: 2 },
      { url: "/images/rooms/suite-pres-4.jpg", alt: "Suite Presidencial - Dormitorio", caption: "Dormitorio master con vestidor walk-in", position: 3 },
    ]},
  ]

  for (const { rtId, images } of imageData) {
    await prisma.roomTypeImage.createMany({
      data: images.map((img) => ({ ...img, roomTypeId: rtId })),
    })
  }

  // ==================== ROOM TYPE AMENITIES ====================
  console.log("🎯 Assigning amenities to room types...")

  const amenityMap: Record<string, string[]> = {
    [standard.id]: [0, 1, 2, 4, 8, 18].map((i) => amenities[i].id),
    [superior.id]: [0, 1, 2, 3, 4, 5, 8, 9, 14, 18].map((i) => amenities[i].id),
    [familiar.id]: [0, 1, 2, 3, 4, 8, 9, 14, 16, 18].map((i) => amenities[i].id),
    [suiteEjecutiva.id]: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14, 15, 16, 18, 19].map((i) => amenities[i].id),
    [suitePresidencial.id]: amenities.map((a: any) => a.id),
  }

  for (const [rtId, amenityIds] of Object.entries(amenityMap)) {
    await prisma.roomTypeAmenity.createMany({
      data: amenityIds.map((aid) => ({ roomTypeId: rtId, amenityId: aid })),
    })
  }

  // ==================== ROOMS ====================
  console.log("🚪 Creating rooms...")

  const rooms: any[] = []
  // Standard: 101-108
  for (let i = 1; i <= 8; i++) {
    rooms.push(
      await prisma.room.create({
        data: {
          number: `${100 + i}`,
          floor: 1,
          roomTypeId: standard.id,
          status: i <= 5 ? "AVAILABLE" : i === 6 ? "OCCUPIED" : i === 7 ? "HOUSEKEEPING" : "AVAILABLE",
          lastCleaned: subDays(new Date(), Math.floor(Math.random() * 3)),
        },
      })
    )
  }
  // Superior: 201-206
  for (let i = 1; i <= 6; i++) {
    rooms.push(
      await prisma.room.create({
        data: {
          number: `${200 + i}`,
          floor: 2,
          roomTypeId: superior.id,
          status: i <= 4 ? "AVAILABLE" : i === 5 ? "OCCUPIED" : "AVAILABLE",
          lastCleaned: subDays(new Date(), Math.floor(Math.random() * 2)),
        },
      })
    )
  }
  // Familiar: 301-304
  for (let i = 1; i <= 4; i++) {
    rooms.push(
      await prisma.room.create({
        data: {
          number: `${300 + i}`,
          floor: 3,
          roomTypeId: familiar.id,
          status: i <= 3 ? "AVAILABLE" : "MAINTENANCE",
          lastCleaned: subDays(new Date(), 1),
        },
      })
    )
  }
  // Suite Ejecutiva: 401-403
  for (let i = 1; i <= 3; i++) {
    rooms.push(
      await prisma.room.create({
        data: {
          number: `${400 + i}`,
          floor: 4,
          roomTypeId: suiteEjecutiva.id,
          status: i === 1 ? "OCCUPIED" : "AVAILABLE",
          lastCleaned: subDays(new Date(), 1),
        },
      })
    )
  }
  // Suite Presidencial: PRES-01
  rooms.push(
    await prisma.room.create({
      data: {
        number: "PRES-01",
        floor: 5,
        roomTypeId: suitePresidencial.id,
        status: "AVAILABLE",
        lastCleaned: new Date(),
      },
    })
  )

  // ==================== EXTRAS ====================
  console.log("🎁 Creating extras...")

  const extras = await Promise.all([
    prisma.extra.create({
      data: { name: "Desayuno Buffet Premium", description: "Buffet gourmet con productos regionales, jugos frescos y estación de huevos a la carta", price: 45, priceType: "PER_PERSON", icon: "UtensilsCrossed", available: true },
    }),
    prisma.extra.create({
      data: { name: "Cena Romántica", description: "Cena para dos con velas, vino de la casa y menú de 4 tiempos en nuestro restaurante panorámico", price: 180, priceType: "PER_STAY", icon: "Heart", available: true },
    }),
    prisma.extra.create({
      data: { name: "Transfer Aeropuerto ida y vuelta", description: "Transporte privado desde/hacia el aeropuerto de Huánuco en vehículo ejecutivo", price: 120, priceType: "PER_STAY", icon: "Car", available: true },
    }),
    prisma.extra.create({
      data: { name: "Late Check-out hasta 15:00", description: "Extiende tu estadía hasta las 3:00 PM sin cargos adicionales por noche", price: 60, priceType: "PER_STAY", icon: "Clock", available: true },
    }),
    prisma.extra.create({
      data: { name: "Early Check-in desde 10:00", description: "Acceso anticipado a tu habitación desde las 10:00 AM", price: 60, priceType: "PER_STAY", icon: "Sunrise", available: true },
    }),
    prisma.extra.create({
      data: { name: "Masaje en habitación 60min", description: "Masaje relajante de 60 minutos en la privacidad de tu suite", price: 150, priceType: "PER_PERSON", icon: "Flower2", available: true },
    }),
    prisma.extra.create({
      data: { name: "Ramo de flores + champagne", description: "Arreglo floral premium con champagne Moët & Chandon esperando en tu habitación", price: 95, priceType: "PER_STAY", icon: "Flower", available: true },
    }),
    prisma.extra.create({
      data: { name: "Cuna de bebé", description: "Cuna certificada con ropa de cama suave para los más pequeños", price: 30, priceType: "PER_NIGHT", icon: "Baby", available: true },
    }),
  ])

  // Link extras to room types (all extras available for all room types)
  for (const rt of roomTypes) {
    await prisma.roomTypeExtra.createMany({
      data: extras.map((e: any) => ({ roomTypeId: rt.id, extraId: e.id })),
    })
  }

  // ==================== SEASONAL PRICES ====================
  console.log("📅 Creating seasonal prices...")

  const currentYear = new Date().getFullYear()
  for (const rt of roomTypes) {
    await prisma.seasonalPrice.createMany({
      data: [
        { name: "Fiestas Patrias", startDate: new Date(`${currentYear}-07-20`), endDate: new Date(`${currentYear}-07-31`), multiplier: 1.4, roomTypeId: rt.id },
        { name: "Navidad y Año Nuevo", startDate: new Date(`${currentYear}-12-20`), endDate: new Date(`${currentYear + 1}-01-05`), multiplier: 1.6, roomTypeId: rt.id },
        { name: "Semana Santa", startDate: new Date(`${currentYear}-04-10`), endDate: new Date(`${currentYear}-04-20`), multiplier: 1.35, roomTypeId: rt.id },
        { name: "Temporada baja", startDate: new Date(`${currentYear}-02-01`), endDate: new Date(`${currentYear}-03-31`), multiplier: 0.85, roomTypeId: rt.id },
      ],
    })
  }

  // ==================== RESERVATIONS ====================
  console.log("📋 Creating reservations...")

  const today = startOfDay(new Date())
  const statuses = ["PENDING", "CONFIRMED", "CHECKED_IN", "CHECKED_OUT", "CANCELLED"] as const
  const sources = ["DIRECT_WEB", "WALK_IN", "PHONE", "OTA_BOOKING"] as const
  let reservationSeq = 1

  // Create 80 reservations with various dates and statuses
  for (let i = 0; i < 80; i++) {
    const guest = guests[i % guests.length]
    const rt = roomTypes[i % roomTypes.length]
    const daysOffset = Math.floor(i / 4) - 10 // Range from -10 to +10 days
    const checkIn = addDays(today, daysOffset)
    const nights = 1 + Math.floor(Math.random() * 4)
    const checkOut = addDays(checkIn, nights)
    const pricePerNight = Number(rt.basePrice)
    const roomCost = pricePerNight * nights
    const extrasCost = i % 3 === 0 ? 45 : 0
    const subtotal = roomCost + extrasCost
    const tax = Math.round(subtotal * 0.18 * 100) / 100
    const total = Math.round((subtotal + tax) * 100) / 100

    let status: typeof statuses[number]
    if (daysOffset < -3) status = "CHECKED_OUT"
    else if (daysOffset < 0) status = i % 5 === 0 ? "CHECKED_OUT" : "CHECKED_IN"
    else if (daysOffset === 0) status = i % 3 === 0 ? "CHECKED_IN" : "CONFIRMED"
    else if (daysOffset <= 5) status = "CONFIRMED"
    else status = i % 10 === 0 ? "CANCELLED" : "PENDING"

    const source = sources[i % sources.length]
    const code = `AGH-${currentYear}-${reservationSeq.toString().padStart(4, "0")}`
    reservationSeq++

    try {
      const reservation = await prisma.reservation.create({
        data: {
          confirmationCode: code,
          checkIn,
          checkOut,
          nights,
          adults: rt.maxGuests > 2 ? 2 + Math.floor(Math.random() * 2) : 2,
          children: rt.maxGuests > 2 ? Math.floor(Math.random() * 2) : 0,
          status,
          source,
          roomTypeId: rt.id,
          guestId: guest.id,
          basePricePerNight: pricePerNight,
          totalRoomCost: roomCost,
          totalExtrasCost: extrasCost,
          taxAmount: tax,
          totalAmount: total,
          checkedInAt: ["CHECKED_IN", "CHECKED_OUT"].includes(status) ? addDays(checkIn, 0) : null,
          checkedOutAt: status === "CHECKED_OUT" ? checkOut : null,
          cancelledAt: status === "CANCELLED" ? new Date() : null,
          cancellationReason: status === "CANCELLED" ? "Cambio de planes del huésped" : null,
          notes: i % 5 === 0 ? "Huésped celebra aniversario" : null,
          internalNotes: i % 7 === 0 ? "Solicita habitación alejada del ascensor" : null,
        },
      })

      // Assign a room for non-cancelled reservations
      if (status !== "CANCELLED") {
        const rtRooms = rooms.filter((r) => r.roomTypeId === rt.id)
        const roomIdx = i % rtRooms.length
        const room = rtRooms[roomIdx]
        if (room) {
          try {
            await prisma.reservationRoom.create({
              data: {
                reservationId: reservation.id,
                roomId: room.id,
              },
            })
          } catch {
            // skip duplicates
          }
        }
      }

      // Create payment for confirmed/checked-in/checked-out
      if (["CONFIRMED", "CHECKED_IN", "CHECKED_OUT"].includes(status)) {
        await prisma.payment.create({
          data: {
            amount: total,
            method: i % 3 === 0 ? "CREDIT_CARD" : i % 3 === 1 ? "YAPE" : "CASH",
            status: "COMPLETED",
            reference: `TXN-${Date.now()}-${i}`,
            reservationId: reservation.id,
          },
        })
      }

      // Add extras to some reservations
      if (i % 3 === 0 && extras.length > 0) {
        const extra = extras[i % extras.length]
        await prisma.reservationExtra.create({
          data: {
            quantity: 1,
            unitPrice: Number(extra.price),
            totalPrice: Number(extra.price),
            extraId: extra.id,
            reservationId: reservation.id,
          },
        })
      }
    } catch (e: any) {
      // Skip constraint violations
      if (!e.message?.includes("Unique")) {
        console.warn(`Warning on reservation ${code}: ${e.message}`)
      }
    }
  }

  console.log("✅ Seed completed successfully!")
  console.log("\n📋 Test Credentials:")
  console.log("  Manager:      manager@alturasgrand.pe / password123")
  console.log("  Receptionist: recepcion1@alturasgrand.pe / password123")
  console.log("  Housekeeper:  limpieza1@alturasgrand.pe / password123")
  console.log("  Guest:        ana.torres@gmail.com / password123")
}

// ==================== GUEST DATA ====================
const guestNames = [
  { name: "Ana Torres", firstName: "Ana", lastName: "Torres", email: "ana.torres@gmail.com", phone: "+51 987 654 321", nationality: "Perú", docType: "DNI", docNum: "45678901" },
  { name: "Roberto Silva", firstName: "Roberto", lastName: "Silva", email: "roberto.silva@hotmail.com", phone: "+51 912 345 678", nationality: "Perú", docType: "DNI", docNum: "12345678" },
  { name: "Carmen Vega", firstName: "Carmen", lastName: "Vega", email: "carmen.vega@yahoo.com", phone: "+51 945 678 123", nationality: "Perú", docType: "DNI", docNum: "78901234" },
  { name: "Juan Ramírez", firstName: "Juan", lastName: "Ramírez", email: "juan.ramirez@gmail.com", phone: "+51 967 890 123", nationality: "Perú", docType: "DNI", docNum: "34567890" },
  { name: "Patricia López", firstName: "Patricia", lastName: "López", email: "patricia.lopez@outlook.com", phone: "+51 923 456 789", nationality: "Perú", docType: "DNI", docNum: "56789012" },
  { name: "Miguel Hernández", firstName: "Miguel", lastName: "Hernández", email: "miguel.h@gmail.com", phone: "+51 934 567 890", nationality: "Perú", docType: "DNI", docNum: "23456789" },
  { name: "Sofia Chen", firstName: "Sofia", lastName: "Chen", email: "sofia.chen@gmail.com", phone: "+1 555 0123", nationality: "Estados Unidos", docType: "PASSPORT", docNum: "US78901234" },
  { name: "Diego Morales", firstName: "Diego", lastName: "Morales", email: "diego.morales@gmail.com", phone: "+56 9 1234 5678", nationality: "Chile", docType: "PASSPORT", docNum: "CL12345678" },
  { name: "Isabella Ríos", firstName: "Isabella", lastName: "Ríos", email: "isa.rios@hotmail.com", phone: "+51 978 901 234", nationality: "Perú", docType: "DNI", docNum: "89012345" },
  { name: "Fernando Castro", firstName: "Fernando", lastName: "Castro", email: "fernando.c@yahoo.com", phone: "+51 956 789 012", nationality: "Perú", docType: "DNI", docNum: "67890123" },
  { name: "Valentina Paredes", firstName: "Valentina", lastName: "Paredes", email: "vale.paredes@gmail.com", phone: "+51 989 012 345", nationality: "Perú", docType: "DNI", docNum: "90123456" },
  { name: "Andrés Guzmán", firstName: "Andrés", lastName: "Guzmán", email: "andres.guzman@outlook.com", phone: "+57 310 1234567", nationality: "Colombia", docType: "CE", docNum: "CO45678901" },
  { name: "Lucía Mendoza", firstName: "Lucía", lastName: "Mendoza", email: "lucia.m@gmail.com", phone: "+51 901 234 567", nationality: "Perú", docType: "DNI", docNum: "01234567" },
  { name: "Carlos Bermúdez", firstName: "Carlos", lastName: "Bermúdez", email: "carlos.b@hotmail.com", phone: "+51 943 210 987", nationality: "Perú", docType: "DNI", docNum: "10987654" },
  { name: "Emma Johnson", firstName: "Emma", lastName: "Johnson", email: "emma.j@yahoo.com", phone: "+44 7700 900000", nationality: "Reino Unido", docType: "PASSPORT", docNum: "UK98765432" },
  { name: "Ricardo Flores", firstName: "Ricardo", lastName: "Flores", email: "ricardo.f@gmail.com", phone: "+51 965 432 109", nationality: "Perú", docType: "DNI", docNum: "32109876" },
  { name: "Daniela Ortiz", firstName: "Daniela", lastName: "Ortiz", email: "daniela.o@outlook.com", phone: "+51 976 543 210", nationality: "Perú", docType: "DNI", docNum: "43210987" },
  { name: "Alejandro Vargas", firstName: "Alejandro", lastName: "Vargas", email: "alex.vargas@gmail.com", phone: "+591 70012345", nationality: "Bolivia", docType: "CE", docNum: "BO56789012" },
  { name: "Camila Ruiz", firstName: "Camila", lastName: "Ruiz", email: "camila.ruiz@hotmail.com", phone: "+51 987 321 654", nationality: "Perú", docType: "DNI", docNum: "54321098" },
  { name: "Gabriel Soto", firstName: "Gabriel", lastName: "Soto", email: "gabriel.soto@yahoo.com", phone: "+54 11 5678 9012", nationality: "Argentina", docType: "CE", docNum: "AR67890123" },
]

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
