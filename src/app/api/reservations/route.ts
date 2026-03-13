import { NextRequest, NextResponse } from "next/server"
import type { Prisma } from "@/generated/prisma/client"
import { requireAdminRoles } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"
import { verifyAndAssignRoom } from "@/lib/availability"
import { generateConfirmationCode } from "@/lib/pricing"
import { TAX_RATE } from "@/lib/utils"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { roomTypeId, checkIn, checkOut, adults, children, guestData, extras, paymentMethod } = body

    if (!roomTypeId || !checkIn || !checkOut || !guestData) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })
    }

    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))

    if (nights <= 0) {
      return NextResponse.json({ error: "Fechas inválidas" }, { status: 400 })
    }

    // Find or create guest
    let guest = await prisma.guest.findFirst({
      where: {
        documentType: guestData.documentType,
        documentNumber: guestData.documentNumber,
      },
    })

    if (!guest) {
      guest = await prisma.guest.create({
        data: {
          firstName: guestData.firstName,
          lastName: guestData.lastName,
          email: guestData.email,
          phone: guestData.phone,
          documentType: guestData.documentType,
          documentNumber: guestData.documentNumber,
          nationality: guestData.nationality || "PE",
        },
      })
    }

    // Verify and assign room (anti-overbooking) — done inside transaction below

    // Get room type for pricing
    const roomType = await prisma.roomType.findUnique({ where: { id: roomTypeId } })
    if (!roomType) {
      return NextResponse.json({ error: "Tipo de habitación no encontrado" }, { status: 404 })
    }

    // Calculate pricing
    const basePrice = Number(roomType.basePrice)
    const roomSubtotal = basePrice * nights

    // Process extras
    let extrasTotal = 0
    const extrasData: { extraId: string; quantity: number; unitPrice: number; totalPrice: number }[] = []
    if (extras && extras.length > 0) {
      for (const ext of extras) {
        const extra = await prisma.extra.findUnique({ where: { id: ext.extraId } })
        if (extra) {
          const unitPrice = Number(extra.price)
          const totalPrice = extra.priceType === "PER_NIGHT"
            ? unitPrice * ext.quantity * nights
            : unitPrice * ext.quantity
          extrasTotal += totalPrice
          extrasData.push({
            extraId: ext.extraId,
            quantity: ext.quantity,
            unitPrice,
            totalPrice,
          })
        }
      }
    }

    const subtotal = roomSubtotal + extrasTotal
    const tax = subtotal * TAX_RATE
    const total = subtotal + tax

    // Count existing reservations to generate sequence number
    const reservationCount = await prisma.reservation.count()
    const confirmationCode = generateConfirmationCode(reservationCount + 1)

    // Create reservation with all related data in a transaction
    const reservation = await prisma.$transaction(async (tx) => {
      // Verify and assign room inside the transaction (anti-overbooking)
      const assignedRoomId = await verifyAndAssignRoom(roomTypeId, checkInDate, checkOutDate, tx)

      const res = await tx.reservation.create({
        data: {
          confirmationCode,
          guestId: guest.id,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          adults: adults || 2,
          children: children || 0,
          status: "CONFIRMED",
          source: "DIRECT_WEB",
          notes: guestData.specialRequests || null,
          totalRoomCost: roomSubtotal,
          totalExtrasCost: extrasTotal,
          basePricePerNight: basePrice,
          nights: nights,
          taxAmount: tax,
          totalAmount: total,
          assignedRooms: {
            create: {
              roomId: assignedRoomId,
            },
          },
          extras: extrasData.length > 0
            ? {
                create: extrasData.map((e) => ({
                  extraId: e.extraId,
                  quantity: e.quantity,
                  unitPrice: e.unitPrice,
                  totalPrice: e.totalPrice,
                })),
              }
            : undefined,
          payments: {
            create: {
              amount: total,
              method: paymentMethod || "CREDIT_CARD",
              status: "COMPLETED",
              reference: `SIM-${Date.now()}`,
            },
          },
        },
      })

      return res
    })

    return NextResponse.json({
      confirmationCode: reservation.confirmationCode,
      reservationId: reservation.id,
    })
  } catch (error) {
    console.error("Reservation error:", error)
    return NextResponse.json({ error: "Error al crear la reserva" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const authResult = await requireAdminRoles(["MANAGER", "RECEPTIONIST"])
  if (!authResult.ok) return authResult.response

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "20")
  const status = searchParams.get("status")
  const search = searchParams.get("search")

  const where: Prisma.ReservationWhereInput = {}
  if (status) where.status = status
  if (search) {
    where.OR = [
      { confirmationCode: { contains: search, mode: "insensitive" } },
      { guest: { firstName: { contains: search, mode: "insensitive" } } },
      { guest: { lastName: { contains: search, mode: "insensitive" } } },
    ]
  }

  const [reservations, total] = await Promise.all([
    prisma.reservation.findMany({
      where,
      include: {
        guest: true,
        assignedRooms: { include: { room: { include: { roomType: true } } } },
        payments: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.reservation.count({ where }),
  ])

  return NextResponse.json({
    reservations: reservations.map((reservation) => ({
      ...reservation,
      subtotal: Number(reservation.totalRoomCost) + Number(reservation.totalExtrasCost),
      totalAmount: Number(reservation.totalAmount),
      taxAmount: Number(reservation.taxAmount),
      rooms: reservation.assignedRooms.map(({ room }) => ({
        room: {
          id: room.id,
          number: room.number,
          type: {
            name: room.roomType.name,
          },
        },
      })),
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  })
}
