import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const roomTypeId = searchParams.get("roomTypeId")

  const where: any = {}
  if (roomTypeId) {
    where.roomTypes = { some: { roomTypeId } }
  }

  try {
    const extras = await prisma.extra.findMany({
      where,
      orderBy: { price: "asc" },
    })

    return NextResponse.json({
      extras: extras.map((e: any) => ({
        id: e.id,
        name: e.name,
        description: e.description,
        price: Number(e.price),
        priceType: e.priceType,
        iconName: e.iconName,
        maxQuantity: e.maxQuantity,
      })),
    })
  } catch (error) {
    console.error("Error fetching extras:", error)
    return NextResponse.json({ error: "Error al obtener extras" }, { status: 500 })
  }
}
