import { NextRequest, NextResponse } from "next/server"
import type { Prisma } from "@/generated/prisma/client"
import { requireAdminRoles } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"
import { extraSchema } from "@/lib/validations/catalog"

type ExtraWithRelations = Prisma.ExtraGetPayload<{
  include: {
    roomTypes: {
      include: {
        roomType: {
          select: {
            id: true
            name: true
          }
        }
      }
    }
    _count: {
      select: {
        roomTypes: true
        reservationExtras: true
      }
    }
  }
}>

function serializeExtra(extra: ExtraWithRelations) {
  return {
    ...extra,
    price: Number(extra.price),
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
    const parsed = extraSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Datos inválidos" }, { status: 400 })
    }

    const extra = await prisma.$transaction(async (tx) => {
      await tx.extra.update({
        where: { id },
        data: {
          name: parsed.data.name,
          description: parsed.data.description || null,
          price: parsed.data.price,
          priceType: parsed.data.priceType,
          icon: parsed.data.icon || null,
          available: parsed.data.available,
        },
      })

      await tx.roomTypeExtra.deleteMany({ where: { extraId: id } })

      if (parsed.data.roomTypeIds.length > 0) {
        await tx.roomTypeExtra.createMany({
          data: parsed.data.roomTypeIds.map((roomTypeId) => ({ roomTypeId, extraId: id })),
        })
      }

      return tx.extra.findUnique({
        where: { id },
        include: {
          roomTypes: { include: { roomType: { select: { id: true, name: true } } } },
          _count: { select: { roomTypes: true, reservationExtras: true } },
        },
      })
    })

    return NextResponse.json({ extra: serializeExtra(extra) })
  } catch (error) {
    console.error("Error updating extra:", error)
    return NextResponse.json({ error: "No se pudo actualizar el extra" }, { status: 500 })
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
    const reservationUsage = await prisma.reservationExtra.count({ where: { extraId: id } })
    if (reservationUsage > 0) {
      return NextResponse.json({ error: "No se puede eliminar un extra ya usado en reservas" }, { status: 409 })
    }

    await prisma.$transaction([
      prisma.roomTypeExtra.deleteMany({ where: { extraId: id } }),
      prisma.extra.delete({ where: { id } }),
    ])

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error deleting extra:", error)
    return NextResponse.json({ error: "No se pudo eliminar el extra" }, { status: 500 })
  }
}