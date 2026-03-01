import { prisma } from "./prisma"
import { addDays, startOfDay } from "date-fns"
import { AvailabilityResult } from "@/types"

/**
 * REGLA FUNDAMENTAL:
 * Una habitación está NO DISPONIBLE para [checkIn, checkOut) si existe cualquier reserva
 * o bloqueo cuyo rango se solape. Solapamiento ocurre cuando:
 *   existingCheckIn < requestedCheckOut AND existingCheckOut > requestedCheckIn
 *
 * Nota: checkOut es exclusivo — un huésped que sale el día X no impide
 * que otro llegue el mismo día X (back-to-back bookings).
 */

export async function getOccupiedRoomIds(
  checkIn: Date,
  checkOut: Date,
  excludeReservationId?: string
): Promise<Set<string>> {
  const [reservedRooms, blockedRooms] = await Promise.all([
    prisma.reservationRoom.findMany({
      where: {
        reservation: {
          ...(excludeReservationId ? { id: { not: excludeReservationId } } : {}),
          status: { in: ["CONFIRMED", "CHECKED_IN", "PENDING"] },
          checkIn: { lt: checkOut },
          checkOut: { gt: checkIn },
        },
      },
      select: { roomId: true },
    }),
    prisma.roomBlock.findMany({
      where: {
        startDate: { lt: checkOut },
        endDate: { gt: checkIn },
      },
      select: { roomId: true },
    }),
  ])

  const occupied = new Set<string>()
  reservedRooms.forEach((r: any) => occupied.add(r.roomId))
  blockedRooms.forEach((b: any) => occupied.add(b.roomId))
  return occupied
}

export async function getAvailableRoomsByType(
  checkIn: Date,
  checkOut: Date,
  adults: number,
  excludeReservationId?: string
): Promise<AvailabilityResult[]> {
  const occupiedIds = await getOccupiedRoomIds(checkIn, checkOut, excludeReservationId)
  const occupiedArray = [...occupiedIds]

  const roomTypes = await prisma.roomType.findMany({
    where: {
      maxGuests: { gte: adults },
    },
    include: {
      images: { orderBy: { position: "asc" }, take: 3 },
      amenities: { include: { amenity: true }, take: 6 },
      rooms: {
        where: {
          status: { in: ["AVAILABLE", "HOUSEKEEPING"] },
          ...(occupiedArray.length > 0 ? { id: { notIn: occupiedArray } } : {}),
        },
        select: { id: true },
      },
      seasonalPrices: {
        where: {
          startDate: { lte: checkOut },
          endDate: { gte: checkIn },
        },
      },
    },
  })

  const nights = Math.ceil(
    (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
  )

  return roomTypes
    .filter((rt: any) => rt.rooms.length > 0)
    .map((rt: any) => ({
      roomType: rt as any,
      availableCount: rt.rooms.length,
      pricePerNight: calculateDynamicPrice(rt, checkIn, checkOut),
      totalPrice: calculateDynamicPrice(rt, checkIn, checkOut) * nights,
      nights,
    }))
}

export function calculateDynamicPrice(
  roomType: any,
  checkIn: Date,
  _checkOut: Date
): number {
  let price = Number(roomType.basePrice)
  const dayOfWeek = checkIn.getDay()
  const isWeekend = dayOfWeek === 5 || dayOfWeek === 6

  if (isWeekend) {
    price *= 1 + Number(roomType.weekendSurcharge)
  }

  if (roomType.seasonalPrices?.length > 0) {
    const maxMultiplier = Math.max(
      ...roomType.seasonalPrices.map((sp: any) => Number(sp.multiplier))
    )
    price *= maxMultiplier
  }

  return Math.round(price * 100) / 100
}

/**
 * VERIFICACIÓN ATÓMICA PRE-CONFIRMACIÓN
 * Debe ejecutarse dentro de una transacción de Prisma justo antes de crear la reserva.
 */
export async function verifyAndAssignRoom(
  roomTypeId: string,
  checkIn: Date,
  checkOut: Date,
  tx: any
): Promise<string> {
  const occupied = await getOccupiedRoomIds(checkIn, checkOut)
  const occupiedArray = [...occupied]

  const availableRoom = await tx.room.findFirst({
    where: {
      roomTypeId,
      status: { in: ["AVAILABLE", "HOUSEKEEPING"] },
      ...(occupiedArray.length > 0 ? { id: { notIn: occupiedArray } } : {}),
    },
    orderBy: { number: "asc" },
  })

  if (!availableRoom) {
    throw new Error(
      `OVERBOOKING_PREVENTED: No hay habitaciones disponibles del tipo solicitado para las fechas ${checkIn.toISOString()} - ${checkOut.toISOString()}`
    )
  }

  return availableRoom.id
}

/**
 * Genera el mapa de disponibilidad para el calendario de detalle de habitación.
 */
export async function getBlockedDatesForRoomType(
  roomTypeId: string,
  months: number = 12
): Promise<string[]> {
  const today = startOfDay(new Date())
  const until = addDays(today, months * 30)

  const roomType = await prisma.roomType.findUnique({
    where: { id: roomTypeId },
    include: { rooms: { select: { id: true } } },
  })

  if (!roomType) return []

  const totalRooms = roomType.rooms.length
  if (totalRooms === 0) return []

  const reservations = await prisma.reservation.findMany({
    where: {
      roomTypeId,
      status: { in: ["CONFIRMED", "CHECKED_IN", "PENDING"] },
      checkIn: { lte: until },
      checkOut: { gte: today },
    },
    select: { checkIn: true, checkOut: true },
  })

  const dayCount: Record<string, number> = {}
  reservations.forEach((r: any) => {
    let cursor = new Date(r.checkIn)
    while (cursor < r.checkOut) {
      const key = cursor.toISOString().split("T")[0]
      dayCount[key] = (dayCount[key] || 0) + 1
      cursor = addDays(cursor, 1)
    }
  })

  const blockedDates: string[] = []
  Object.entries(dayCount).forEach(([date, count]) => {
    if (count >= totalRooms) blockedDates.push(date)
  })

  return blockedDates
}
