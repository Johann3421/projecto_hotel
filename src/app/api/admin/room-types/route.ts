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

export async function GET() {
  const authResult = await requireAdminRoles(["MANAGER"])
  if (!authResult.ok) return authResult.response

  try {
    const roomTypes = await prisma.roomType.findMany({
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
      orderBy: { basePrice: "asc" },
    })

    return NextResponse.json({ roomTypes: roomTypes.map(serializeRoomType) })
  } catch (error) {
    console.error("Error fetching room types:", error)
    return NextResponse.json({ error: "No se pudieron obtener los tipos de habitación" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const authResult = await requireAdminRoles(["MANAGER"])
  if (!authResult.ok) return authResult.response

  try {
    const body = await req.json()
    const parsed = roomTypeSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Datos inválidos" }, { status: 400 })
    }

    const roomType = await prisma.roomType.create({
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

    return NextResponse.json({ roomType: serializeRoomType(roomType) }, { status: 201 })
  } catch (error) {
    console.error("Error creating room type:", error)
    return NextResponse.json({ error: "No se pudo crear el tipo de habitación" }, { status: 500 })
  }
}