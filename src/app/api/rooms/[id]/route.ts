import { NextRequest, NextResponse } from "next/server"
import { requireAdminRoles } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdminRoles(["MANAGER"])
  if (!authResult.ok) return authResult.response

  const { id } = await params

  try {
    const body = await req.json()
    const number = String(body.number || "").trim()
    const floor = Number(body.floor)
    const roomTypeId = String(body.roomTypeId || "").trim()
    const status = String(body.status || "AVAILABLE").trim()
    const notes = typeof body.notes === "string" ? body.notes.trim() || null : null

    if (!number || !roomTypeId || !Number.isInteger(floor) || floor < 1) {
      return NextResponse.json({ error: "Datos de habitación inválidos" }, { status: 400 })
    }

    const room = await prisma.room.update({
      where: { id },
      data: {
        number,
        floor,
        roomTypeId,
        status,
        notes,
      },
      include: {
        roomType: { select: { id: true, name: true, slug: true } },
      },
    })

    return NextResponse.json({
      room: {
        ...room,
        type: room.roomType,
      },
    })
  } catch (error) {
    console.error("Error updating room:", error)
    return NextResponse.json({ error: "No se pudo actualizar la habitación" }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdminRoles(["MANAGER"])
  if (!authResult.ok) return authResult.response

  const { id } = await params

  try {
    const assignments = await prisma.reservationRoom.count({ where: { roomId: id } })
    if (assignments > 0) {
      return NextResponse.json({ error: "No se puede eliminar una habitación con reservas asociadas" }, { status: 409 })
    }

    await prisma.roomStatusLog.deleteMany({ where: { roomId: id } })
    await prisma.roomBlock.deleteMany({ where: { roomId: id } })
    await prisma.room.delete({ where: { id } })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error deleting room:", error)
    return NextResponse.json({ error: "No se pudo eliminar la habitación" }, { status: 500 })
  }
}