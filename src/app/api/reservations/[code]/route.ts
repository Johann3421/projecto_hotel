import { NextRequest, NextResponse } from "next/server"
import { requireAdminRoles } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params

  try {
    const reservation = await prisma.reservation.findUnique({
      where: { confirmationCode: code },
      include: {
        guest: true,
        assignedRooms: {
          include: { room: { include: { roomType: true } } },
        },
        extras: {
          include: { extra: true },
        },
        payments: true,
      },
    })

    if (!reservation) {
      return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 })
    }

    const roomType = reservation.assignedRooms[0]?.room?.roomType
    const nights = Math.ceil(
      (reservation.checkOut.getTime() - reservation.checkIn.getTime()) / (1000 * 60 * 60 * 24)
    )

    return NextResponse.json({
      confirmationCode: reservation.confirmationCode,
      roomTypeName: roomType?.name || "N/A",
      checkIn: reservation.checkIn.toISOString().split("T")[0],
      checkOut: reservation.checkOut.toISOString().split("T")[0],
      nights,
      adults: reservation.adults,
      children: reservation.children,
      guestName: `${reservation.guest.firstName} ${reservation.guest.lastName}`,
      guestEmail: reservation.guest.email,
      subtotal: Number(reservation.totalRoomCost),
      tax: Number(reservation.taxAmount),
      total: Number(reservation.totalAmount),
      extras: reservation.extras.map((e) => ({
        name: e.extra.name,
        total: Number(e.totalPrice),
      })),
      status: reservation.status,
      paymentStatus: reservation.payments[0]?.status || "PENDING",
    })
  } catch (error) {
    console.error("Error fetching reservation:", error)
    return NextResponse.json({ error: "Error al obtener la reserva" }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const authResult = await requireAdminRoles(["MANAGER", "RECEPTIONIST"])
  if (!authResult.ok) return authResult.response

  const { code } = await params
  const body = await req.json()

  try {
    const reservation = await prisma.reservation.findUnique({
      where: { confirmationCode: code },
    })

    if (!reservation) {
      return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 })
    }

    const updated = await prisma.reservation.update({
      where: { id: reservation.id },
      data: {
        status: body.status || undefined,
        notes: body.specialRequests !== undefined ? body.specialRequests : undefined,
      },
    })

    return NextResponse.json({ reservation: updated })
  } catch (error) {
    console.error("Error updating reservation:", error)
    return NextResponse.json({ error: "Error al actualizar la reserva" }, { status: 500 })
  }
}
