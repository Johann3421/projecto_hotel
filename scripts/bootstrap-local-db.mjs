import "dotenv/config"
import bcrypt from "bcryptjs"
import { Client } from "pg"

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error("Missing DATABASE_URL")
}

const users = [
  { email: "manager@alturasgrand.pe", name: "Carlos Mendoza", role: "MANAGER" },
  { email: "recepcion1@alturasgrand.pe", name: "María García", role: "RECEPTIONIST" },
  { email: "recepcion2@alturasgrand.pe", name: "José Pérez", role: "RECEPTIONIST" },
  { email: "limpieza1@alturasgrand.pe", name: "Rosa Huamán", role: "HOUSEKEEPER" },
  { email: "limpieza2@alturasgrand.pe", name: "Lucía Espinoza", role: "HOUSEKEEPER" },
]

const amenities = [
  { id: "amenity-wifi", name: "WiFi", icon: "Wifi", category: "ROOM" },
  { id: "amenity-air", name: "Aire Acondicionado", icon: "Wind", category: "ROOM" },
  { id: "amenity-tv", name: "TV", icon: "Tv", category: "ENTERTAINMENT" },
  { id: "amenity-minibar", name: "Minibar", icon: "Coffee", category: "FOOD_DRINK" },
  { id: "amenity-bath", name: "Bañera", icon: "Bath", category: "BATHROOM" },
  { id: "amenity-river", name: "Vista al Río", icon: "Mountain", category: "ROOM" },
]

const roomTypes = [
  {
    id: "rt-estandar",
    name: "Estándar",
    slug: "estandar",
    description: "Habitación acogedora con cama queen, escritorio y acabados cálidos para una estadía cómoda en el centro de Huánuco.",
    shortDesc: "Confort esencial con diseño cálido.",
    basePrice: 180,
    weekendSurcharge: 0.15,
    maxGuests: 2,
    bedConfiguration: "1 cama queen",
    sizeSqm: 24,
    floorNumber: 1,
    floor: "Piso 1",
    view: "Vista interior",
    image: "/images/rooms/placeholder.jpg",
    amenities: ["amenity-wifi", "amenity-tv", "amenity-air"],
    rooms: ["101", "102", "103", "104", "105", "106", "107", "108"],
  },
  {
    id: "rt-superior",
    name: "Superior Vista Río",
    slug: "superior-vista-rio",
    description: "Habitación superior con ventanales amplios, cama king y una vista abierta al río Huallaga.",
    shortDesc: "Más amplitud y vista abierta al río.",
    basePrice: 260,
    weekendSurcharge: 0.15,
    maxGuests: 3,
    bedConfiguration: "1 cama king + sofá cama",
    sizeSqm: 32,
    floorNumber: 2,
    floor: "Piso 2",
    view: "Vista al río",
    image: "/images/rooms/placeholder.jpg",
    amenities: ["amenity-wifi", "amenity-tv", "amenity-air", "amenity-river"],
    rooms: ["201", "202", "203", "204", "205", "206"],
  },
  {
    id: "rt-familiar",
    name: "Familiar",
    slug: "familiar",
    description: "Espacio amplio para familias con dos zonas de descanso y capacidad para hasta cinco huéspedes.",
    shortDesc: "Amplitud y comodidad para toda la familia.",
    basePrice: 320,
    weekendSurcharge: 0.2,
    maxGuests: 5,
    bedConfiguration: "2 camas dobles + sofá cama",
    sizeSqm: 40,
    floorNumber: 3,
    floor: "Piso 3",
    view: "Vista a la ciudad",
    image: "/images/rooms/placeholder.jpg",
    amenities: ["amenity-wifi", "amenity-tv", "amenity-air", "amenity-minibar"],
    rooms: ["301", "302", "303", "304"],
  },
  {
    id: "rt-suite-ejecutiva",
    name: "Suite Ejecutiva",
    slug: "suite-ejecutiva",
    description: "Suite premium con sala integrada, escritorio ejecutivo y baño amplio para viajes de trabajo o descanso de alto nivel.",
    shortDesc: "Confort premium con área ejecutiva integrada.",
    basePrice: 480,
    weekendSurcharge: 0.15,
    maxGuests: 3,
    bedConfiguration: "1 cama king",
    sizeSqm: 55,
    floorNumber: 4,
    floor: "Piso 4",
    view: "Vista panorámica",
    image: "/images/rooms/placeholder.jpg",
    amenities: ["amenity-wifi", "amenity-tv", "amenity-air", "amenity-minibar", "amenity-bath"],
    rooms: ["401", "402", "403"],
  },
  {
    id: "rt-suite-presidencial",
    name: "Suite Presidencial",
    slug: "suite-presidencial",
    description: "La suite insignia del hotel, con amplios ambientes, vista panorámica y experiencia premium de principio a fin.",
    shortDesc: "La experiencia más exclusiva del hotel.",
    basePrice: 850,
    weekendSurcharge: 0.1,
    maxGuests: 4,
    bedConfiguration: "1 cama king + lounge privado",
    sizeSqm: 90,
    floorNumber: 5,
    floor: "Piso 5",
    view: "Vista panorámica 270°",
    image: "/images/rooms/placeholder.jpg",
    amenities: ["amenity-wifi", "amenity-tv", "amenity-air", "amenity-minibar", "amenity-bath", "amenity-river"],
    rooms: ["PRES-01"],
  },
]

const client = new Client({ connectionString })

async function main() {
  await client.connect()
  const passwordHash = await bcrypt.hash("password123", 12)

  const existingRoomTypes = await client.query("SELECT COUNT(*)::int AS count FROM room_types")

  if (existingRoomTypes.rows[0].count > 0) {
    console.log(`Database already has ${existingRoomTypes.rows[0].count} room types. Skipping bootstrap.`)
    await client.end()
    return
  }

  await client.query("BEGIN")

  try {
    for (const user of users) {
      await client.query(
        `INSERT INTO users (id, name, email, password, role, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5::"Role", NOW(), NOW()) ON CONFLICT (email) DO NOTHING`,
        [`user-${user.role.toLowerCase()}`, user.name, user.email, passwordHash, user.role]
      )
    }

    for (const amenity of amenities) {
      await client.query(
        `INSERT INTO amenities (id, name, icon, category) VALUES ($1, $2, $3, $4::"AmenityCategory")`,
        [amenity.id, amenity.name, amenity.icon, amenity.category]
      )
    }

    for (const roomType of roomTypes) {
      await client.query(
        `INSERT INTO room_types (id, name, slug, description, "shortDesc", "basePrice", "weekendSurcharge", "maxGuests", "bedConfiguration", "sizeSqm", floor, view, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())`,
        [
          roomType.id,
          roomType.name,
          roomType.slug,
          roomType.description,
          roomType.shortDesc,
          roomType.basePrice,
          roomType.weekendSurcharge,
          roomType.maxGuests,
          roomType.bedConfiguration,
          roomType.sizeSqm,
          roomType.floor,
          roomType.view,
        ]
      )

      await client.query(
        `INSERT INTO room_type_images (id, url, alt, caption, position, "roomTypeId") VALUES ($1, $2, $3, $4, 0, $5)`,
        [`img-${roomType.id}`, roomType.image, roomType.name, roomType.shortDesc, roomType.id]
      )

      for (const amenityId of roomType.amenities) {
        await client.query(
          `INSERT INTO room_type_amenities ("roomTypeId", "amenityId") VALUES ($1, $2)`,
          [roomType.id, amenityId]
        )
      }

      for (const roomNumber of roomType.rooms) {
        await client.query(
          `INSERT INTO rooms (id, number, floor, status, "roomTypeId", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4::"RoomStatus", $5, NOW(), NOW())`,
          [`room-${roomNumber.toLowerCase()}`, roomNumber, roomType.floorNumber, "AVAILABLE", roomType.id]
        )
      }
    }

    await client.query("COMMIT")
    console.log(`Bootstrapped ${roomTypes.length} room types and ${users.length} users into ${new URL(connectionString).pathname.slice(1)}`)
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    await client.end()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})