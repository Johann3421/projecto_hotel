import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()

  try {
    const room = await prisma.room.findUnique({ where: { id } })
    if (!room) {
      return NextResponse.json({ error: "Habitación no encontrada" }, { status: 404 })
    }

    const oldStatus = room.status

    const updated = await prisma.$transaction(async (tx: any) => {
      const updatedRoom = await tx.room.update({
        where: { id },
        data: {
          status: body.status,
          notes: body.notes !== undefined ? body.notes : room.notes,
        },
        include: { roomType: true },
      })

      // Log status change
      await tx.roomStatusLog.create({
        data: {
          roomId: id,
          previousStatus: oldStatus,
          newStatus: body.status,
          changedBy: body.changedBy || "system",
          notes: body.notes || null,
        },
      })

      return updatedRoom
    })

    return NextResponse.json({ room: updated })
  } catch (error) {
    console.error("Error updating room status:", error)
    return NextResponse.json({ error: "Error al actualizar la habitación" }, { status: 500 })
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        roomType: true,
        statusLogs: { orderBy: { createdAt: "desc" }, take: 10 },
      },
    })

    if (!room) {
      return NextResponse.json({ error: "Habitación no encontrada" }, { status: 404 })
    }

    return NextResponse.json({ room })
  } catch (error) {
    console.error("Error fetching room:", error)
    return NextResponse.json({ error: "Error al obtener la habitación" }, { status: 500 })
  }
}
