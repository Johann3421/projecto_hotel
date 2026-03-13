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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdminRoles(["MANAGER"])
  if (!authResult.ok) return authResult.response

  const { id } = await params

  try {
    const body = await req.json()
    const parsed = seasonalPriceSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Datos inválidos" }, { status: 400 })
    }

    const seasonalPrice = await prisma.seasonalPrice.update({
      where: { id },
      data: {
        ...parsed.data,
        startDate: new Date(parsed.data.startDate),
        endDate: new Date(parsed.data.endDate),
      },
      include: {
        roomType: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ seasonalPrice: serializeSeasonalPrice(seasonalPrice) })
  } catch (error) {
    console.error("Error updating seasonal price:", error)
    return NextResponse.json({ error: "No se pudo actualizar la tarifa estacional" }, { status: 500 })
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
    await prisma.seasonalPrice.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error deleting seasonal price:", error)
    return NextResponse.json({ error: "No se pudo eliminar la tarifa estacional" }, { status: 500 })
  }
}