import { NextRequest, NextResponse } from "next/server"
import type { Prisma } from "@/generated/prisma/client"
import { requireAdminRoles } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"

type ReservationStayRow = {
  checkIn: Date
  checkOut: Date
}

type SourceBreakdownRow = {
  source: string
  _count: {
    source: number
  }
  _sum: {
    totalAmount: Prisma.Decimal | number | null
  }
}

type DailyRevenueRow = {
  date: Date
  revenue: number | null
}

export async function GET(req: NextRequest) {
  const authResult = await requireAdminRoles(["MANAGER"])
  if (!authResult.ok) return authResult.response

  const { searchParams } = new URL(req.url)
  const period = searchParams.get("period") || "month" // month, quarter, year

  const now = new Date()
  let startDate: Date

  switch (period) {
    case "quarter":
      startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1)
      break
    case "year":
      startDate = new Date(now.getFullYear(), 0, 1)
      break
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
  }

  try {
    const [
      totalRevenue,
      paymentCount,
      reservationCount,
      avgStayLength,
      sourceBreakdown,
      roomTypeRevenue,
      dailyRevenue,
    ] = await Promise.all([
      // Total revenue
      prisma.payment.aggregate({
        where: { status: "COMPLETED", createdAt: { gte: startDate } },
        _sum: { amount: true },
      }),
      prisma.payment.count({
        where: { status: "COMPLETED", createdAt: { gte: startDate } },
      }),
      // Reservation count
      prisma.reservation.count({
        where: { createdAt: { gte: startDate }, status: { not: "CANCELLED" } },
      }),
      // Avg stay length
      prisma.reservation.findMany({
        where: { createdAt: { gte: startDate }, status: { not: "CANCELLED" } },
        select: { checkIn: true, checkOut: true },
      }),
      // Source breakdown
      prisma.reservation.groupBy({
        by: ["source"],
        where: { createdAt: { gte: startDate }, status: { not: "CANCELLED" } },
        _count: { source: true },
        _sum: { totalAmount: true },
      }),
      // Revenue by room type
      prisma.$queryRaw`
        SELECT rt.name, COUNT(rr.id)::int as bookings, SUM(r."totalAmount")::float as revenue
        FROM "reservations" r
        JOIN "reservation_rooms" rr ON rr."reservationId" = r.id
        JOIN "rooms" rm ON rm.id = rr."roomId"
        JOIN "room_types" rt ON rt.id = rm."roomTypeId"
        WHERE r."createdAt" >= ${startDate} AND r.status != 'CANCELLED'
        GROUP BY rt.name
        ORDER BY revenue DESC
      ` as Promise<{ name: string; bookings: number; revenue: number }[]>,
      // Daily revenue (last 30 days)
      prisma.$queryRaw`
        SELECT DATE(p."createdAt") as date, SUM(p.amount)::float as revenue
        FROM "payments" p
        WHERE p.status = 'COMPLETED' AND p."createdAt" >= ${startDate}
        GROUP BY DATE(p."createdAt")
        ORDER BY date ASC
      ` as Promise<{ date: Date; revenue: number }[]>,
      // Total rooms for occupancy
    ])

    const avgNights = avgStayLength.length > 0
      ? ((avgStayLength as ReservationStayRow[]).reduce((sum, r) => {
          return sum + Math.ceil((r.checkOut.getTime() - r.checkIn.getTime()) / (1000 * 60 * 60 * 24))
        }, 0) / avgStayLength.length).toFixed(1)
      : "0"

    return NextResponse.json({
      summary: {
        totalRevenue: Number(totalRevenue._sum.amount || 0),
        paymentCount,
        reservationCount,
        averageStayNights: parseFloat(avgNights),
        period,
      },
      sourceBreakdown: (sourceBreakdown as SourceBreakdownRow[]).map((s) => ({
        source: s.source,
        count: s._count?.source ?? 0,
        revenue: Number(s._sum.totalAmount || 0),
      })),
      roomTypeRevenue: roomTypeRevenue || [],
      dailyRevenue: ((dailyRevenue || []) as DailyRevenueRow[]).map((d) => ({
        date: d.date,
        revenue: d.revenue || 0,
      })),
    })
  } catch (error) {
    console.error("Reports error:", error)
    // In development return error details to help debugging
    if (process.env.NODE_ENV !== "production") {
      if (error instanceof Error) {
        return NextResponse.json({ error: "Error al generar reportes", message: error.message, stack: error.stack }, { status: 500 })
      }
    }
    return NextResponse.json({ error: "Error al generar reportes" }, { status: 500 })
  }
}
