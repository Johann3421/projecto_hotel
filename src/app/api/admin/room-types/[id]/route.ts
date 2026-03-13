import { NextRequest, NextResponse } from "next/server"
import type { Prisma } from "@/generated/prisma/client"
import { requireAdminRoles } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"
import { roomTypeSchema } from "@/lib/validations/room"

type RoomTypeWithCounts = Prisma.RoomTypeGetPayload<{
  include: {
    _count: {
      select: {
        rooms: true
        reservations: true
        extras: true
        seasonalPrices: true
      }
    }
  }
}>

function serializeRoomType(roomType: RoomTypeWithCounts) {
  return {
    ...roomType,
    basePrice: Number(roomType.basePrice),
    weekendSurcharge: Number(roomType.weekendSurcharge),
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdminRoles(["MANAGER"])
  if (!authResult.ok) return authResult.response

  const { id } = await params

  try {
    const body = await req.json()
    const parsed = roomTypeSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Datos inválidos" }, { status: 400 })
    }

    const roomType = await prisma.roomType.update({
      where: { id },
      data: parsed.data,
      include: {
        _count: {
          select: {
            rooms: true,
            reservations: true,
            extras: true,
            seasonalPrices: true,
          },
        },
      },
    })

    return NextResponse.json({ roomType: serializeRoomType(roomType) })
  } catch (error) {
    console.error("Error updating room type:", error)
    return NextResponse.json({ error: "No se pudo actualizar el tipo de habitación" }, { status: 500 })
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
    const [roomsCount, reservationsCount] = await Promise.all([
      prisma.room.count({ where: { roomTypeId: id } }),
      prisma.reservation.count({ where: { roomTypeId: id } }),
    ])

    if (roomsCount > 0 || reservationsCount > 0) {
      return NextResponse.json({ error: "No se puede eliminar un tipo con habitaciones o reservas asociadas" }, { status: 409 })
    }

    await prisma.$transaction([
      prisma.roomTypeImage.deleteMany({ where: { roomTypeId: id } }),
      prisma.roomTypeAmenity.deleteMany({ where: { roomTypeId: id } }),
      prisma.roomTypeExtra.deleteMany({ where: { roomTypeId: id } }),
      prisma.seasonalPrice.deleteMany({ where: { roomTypeId: id } }),
      prisma.roomType.delete({ where: { id } }),
    ])

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error deleting room type:", error)
    return NextResponse.json({ error: "No se pudo eliminar el tipo de habitación" }, { status: 500 })
  }
}