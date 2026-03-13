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

export async function GET() {
  const authResult = await requireAdminRoles(["MANAGER"])
  if (!authResult.ok) return authResult.response

  try {
    const [extras, roomTypes] = await Promise.all([
      prisma.extra.findMany({
        include: {
          roomTypes: {
            include: {
              roomType: { select: { id: true, name: true } },
            },
          },
          _count: {
            select: {
              roomTypes: true,
              reservationExtras: true,
            },
          },
        },
        orderBy: { name: "asc" },
      }),
      prisma.roomType.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
    ])

    return NextResponse.json({
      extras: extras.map(serializeExtra),
      roomTypes,
    })
  } catch (error) {
    console.error("Error fetching extras:", error)
    return NextResponse.json({ error: "No se pudieron obtener los extras" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const authResult = await requireAdminRoles(["MANAGER"])
  if (!authResult.ok) return authResult.response

  try {
    const body = await req.json()
    const parsed = extraSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Datos inválidos" }, { status: 400 })
    }

    const extra = await prisma.$transaction(async (tx) => {
      const created = await tx.extra.create({
        data: {
          name: parsed.data.name,
          description: parsed.data.description || null,
          price: parsed.data.price,
          priceType: parsed.data.priceType,
          icon: parsed.data.icon || null,
          available: parsed.data.available,
        },
      })

      if (parsed.data.roomTypeIds.length > 0) {
        await tx.roomTypeExtra.createMany({
          data: parsed.data.roomTypeIds.map((roomTypeId) => ({ roomTypeId, extraId: created.id })),
        })
      }

      return tx.extra.findUnique({
        where: { id: created.id },
        include: {
          roomTypes: { include: { roomType: { select: { id: true, name: true } } } },
          _count: { select: { roomTypes: true, reservationExtras: true } },
        },
      })
    })

    return NextResponse.json({ extra: serializeExtra(extra) }, { status: 201 })
  } catch (error) {
    console.error("Error creating extra:", error)
    return NextResponse.json({ error: "No se pudo crear el extra" }, { status: 500 })
  }
}