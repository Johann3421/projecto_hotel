import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "20")
  const search = searchParams.get("search")

  const where: any = {}
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { documentNumber: { contains: search, mode: "insensitive" } },
    ]
  }

  try {
    const [guests, total] = await Promise.all([
      prisma.guest.findMany({
        where,
        include: {
          reservations: {
            select: { id: true, confirmationCode: true, status: true, checkIn: true, checkOut: true, totalAmount: true },
            orderBy: { createdAt: "desc" },
            take: 5,
          },
          _count: { select: { reservations: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.guest.count({ where }),
    ])

    return NextResponse.json({
      guests,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error("Error fetching guests:", error)
    return NextResponse.json({ error: "Error al obtener huéspedes" }, { status: 500 })
  }
}
