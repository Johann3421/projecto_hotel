import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getOccupiedRoomIds, calculateDynamicPrice } from "@/lib/availability"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const checkIn = searchParams.get("checkIn")
  const checkOut = searchParams.get("checkOut")
  const adults = parseInt(searchParams.get("adults") || "2")
  const children = parseInt(searchParams.get("children") || "0")

  if (!checkIn || !checkOut) {
    return NextResponse.json({ error: "checkIn y checkOut son requeridos" }, { status: 400 })
  }

  const checkInDate = new Date(checkIn)
  const checkOutDate = new Date(checkOut)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (checkInDate < today) {
    return NextResponse.json({ error: "La fecha de check-in no puede ser en el pasado" }, { status: 400 })
  }
  if (checkOutDate <= checkInDate) {
    return NextResponse.json({ error: "La fecha de check-out debe ser posterior al check-in" }, { status: 400 })
  }

  const totalGuests = adults + children

  try {
    const occupiedIds = await getOccupiedRoomIds(checkInDate, checkOutDate)
    const occupiedArray = [...occupiedIds]

    const roomTypes = await prisma.roomType.findMany({
      where: { maxGuests: { gte: totalGuests } },
      include: {
        images: { take: 1, orderBy: { position: "asc" } },
        amenities: { take: 5, include: { amenity: true } },
        rooms: {
          where: {
            status: { in: ["AVAILABLE", "HOUSEKEEPING"] },
            ...(occupiedArray.length > 0 ? { id: { notIn: occupiedArray } } : {}),
          },
          select: { id: true },
        },
        seasonalPrices: {
          where: {
            startDate: { lte: checkOutDate },
            endDate: { gte: checkInDate },
          },
        },
      },
      orderBy: { basePrice: "asc" },
    })

    const nights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    const results = roomTypes.map((rt: any) => {
      const pricePerNight = calculateDynamicPrice(rt, checkInDate, checkOutDate)
      return {
        id: rt.id,
        name: rt.name,
        slug: rt.slug,
        shortDesc: rt.shortDesc,
        basePrice: Number(rt.basePrice),
        maxGuests: rt.maxGuests,
        sizeSqm: rt.sizeSqm,
        bedConfiguration: rt.bedConfiguration,
        availableCount: rt.rooms.length,
        pricePerNight,
        totalPrice: pricePerNight * nights,
        nights,
        imageUrl: rt.images[0]?.url || null,
        amenities: rt.amenities.map((a: any) => a.amenity.name),
      }
    })

    return NextResponse.json({ roomTypes: results })
  } catch (error) {
    console.error("Availability error:", error)
    return NextResponse.json({ error: "Error al verificar disponibilidad" }, { status: 500 })
  }
}
