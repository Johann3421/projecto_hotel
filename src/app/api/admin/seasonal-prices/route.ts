import { NextRequest, NextResponse } from "next/server"
import type { Prisma } from "@/generated/prisma/client"
import { requireAdminRoles } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"
import { seasonalPriceSchema } from "@/lib/validations/catalog"

type SeasonalPriceWithRoomType = Prisma.SeasonalPriceGetPayload<{
  include: {
    roomType: {
      select: {
        id: true
        name: true
      }
    }
  }
}>

function serializeSeasonalPrice(price: SeasonalPriceWithRoomType) {
  return {
    ...price,
    multiplier: Number(price.multiplier),
  }
}

export async function GET() {
  const authResult = await requireAdminRoles(["MANAGER"])
  if (!authResult.ok) return authResult.response

  try {
    const [seasonalPrices, roomTypes] = await Promise.all([
      prisma.seasonalPrice.findMany({
        include: {
          roomType: { select: { id: true, name: true } },
        },
        orderBy: [{ startDate: "asc" }, { name: "asc" }],
      }),
      prisma.roomType.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
    ])

    return NextResponse.json({
      seasonalPrices: seasonalPrices.map(serializeSeasonalPrice),
      roomTypes,
    })
  } catch (error) {
    console.error("Error fetching seasonal prices:", error)
    return NextResponse.json({ error: "No se pudieron obtener las tarifas estacionales" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const authResult = await requireAdminRoles(["MANAGER"])
  if (!authResult.ok) return authResult.response

  try {
    const body = await req.json()
    const parsed = seasonalPriceSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Datos inválidos" }, { status: 400 })
    }

    const seasonalPrice = await prisma.seasonalPrice.create({
      data: {
        ...parsed.data,
        startDate: new Date(parsed.data.startDate),
        endDate: new Date(parsed.data.endDate),
      },
      include: {
        roomType: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ seasonalPrice: serializeSeasonalPrice(seasonalPrice) }, { status: 201 })
  } catch (error) {
    console.error("Error creating seasonal price:", error)
    return NextResponse.json({ error: "No se pudo crear la tarifa estacional" }, { status: 500 })
  }
}