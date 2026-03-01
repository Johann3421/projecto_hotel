import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const startDate = searchParams.get("startDate")
  const days = parseInt(searchParams.get("days") || "14")

  const start = startDate ? new Date(startDate) : new Date()
  start.setHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setDate(end.getDate() + days)

  try {
    const rooms = await prisma.room.findMany({
      include: { roomType: true },
      orderBy: [{ floor: "asc" }, { number: "asc" }],
    })

    const reservations = await prisma.reservation.findMany({
      where: {
        status: { in: ["CONFIRMED", "CHECKED_IN"] },
        checkIn: { lt: end },
        checkOut: { gt: start },
      },
      include: {
        guest: true,
        assignedRooms: { select: { roomId: true } },
      },
    })

    const blocks = await prisma.roomBlock.findMany({
      where: {
        startDate: { lt: end },
        endDate: { gt: start },
      },
    })

    // Build tape chart data
    const tapeChart = rooms.map((room: any) => {
      const roomReservations = reservations
        .filter((r: any) => r.assignedRooms.some((rr: any) => rr.roomId === room.id))
        .map((r: any) => ({
          id: r.id,
          confirmationCode: r.confirmationCode,
          guestName: `${r.guest.firstName} ${r.guest.lastName}`,
          checkIn: r.checkIn.toISOString().split("T")[0],
          checkOut: r.checkOut.toISOString().split("T")[0],
          status: r.status,
          nights: Math.ceil(
            (r.checkOut.getTime() - r.checkIn.getTime()) / (1000 * 60 * 60 * 24)
          ),
        }))

      const roomBlocks = blocks
        .filter((b: any) => b.roomId === room.id)
        .map((b: any) => ({
          id: b.id,
          reason: b.reason,
          startDate: b.startDate.toISOString().split("T")[0],
          endDate: b.endDate.toISOString().split("T")[0],
        }))

      return {
        roomId: room.id,
        roomNumber: room.number,
        floor: room.floor,
        typeName: room.roomType.name,
        status: room.status,
        reservations: roomReservations,
        blocks: roomBlocks,
      }
    })

    return NextResponse.json({
      tapeChart,
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
      days,
    })
  } catch (error) {
    console.error("Tape chart error:", error)
    return NextResponse.json({ error: "Error al generar tape chart" }, { status: 500 })
  }
}
