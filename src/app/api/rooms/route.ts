import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const rooms = await prisma.room.findMany({
      include: {
        roomType: { select: { name: true, slug: true } },
      },
      orderBy: [{ floor: "asc" }, { number: "asc" }],
    })

    return NextResponse.json({ rooms })
  } catch (error) {
    console.error("Error fetching rooms:", error)
    return NextResponse.json({ error: "Error al obtener habitaciones" }, { status: 500 })
  }
}
