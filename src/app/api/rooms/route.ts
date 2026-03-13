import { NextRequest, NextResponse } from "next/server"
import { requireAdminRoles } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const authResult = await requireAdminRoles(["MANAGER", "RECEPTIONIST", "HOUSEKEEPER"])
  if (!authResult.ok) return authResult.response

  try {
    const [rooms, roomTypes] = await Promise.all([
      prisma.room.findMany({
        include: {
          roomType: { select: { id: true, name: true, slug: true } },
        },
        orderBy: [{ floor: "asc" }, { number: "asc" }],
      }),
      prisma.roomType.findMany({
        select: { id: true, name: true, slug: true },
        orderBy: { name: "asc" },
      }),
    ])

    return NextResponse.json({
      rooms: rooms.map(({ roomType, ...room }) => ({
        ...room,
        roomType,
        type: roomType,
      })),
      roomTypes,
    })
  } catch (error) {
    console.error("Error fetching rooms:", error)
    return NextResponse.json({ error: "Error al obtener habitaciones" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const authResult = await requireAdminRoles(["MANAGER"])
  if (!authResult.ok) return authResult.response

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

    const room = await prisma.room.create({
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
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating room:", error)
    return NextResponse.json({ error: "No se pudo crear la habitación" }, { status: 500 })
  }
}
