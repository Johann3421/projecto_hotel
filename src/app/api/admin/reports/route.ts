import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
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
      reservationCount,
      avgStayLength,
      sourceBreakdown,
      roomTypeRevenue,
      dailyRevenue,
      occupancyData,
    ] = await Promise.all([
      // Total revenue
      prisma.payment.aggregate({
        where: { status: "COMPLETED", createdAt: { gte: startDate } },
        _sum: { amount: true },
        _count: true,
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
        _count: true,
        _sum: { totalAmount: true },
      }),
      // Revenue by room type
      prisma.$queryRaw`
        SELECT rt.name, COUNT(rr.id)::int as bookings, SUM(r."totalAmount")::float as revenue
        FROM "Reservation" r
        JOIN "ReservationRoom" rr ON rr."reservationId" = r.id
        JOIN "Room" rm ON rm.id = rr."roomId"
        JOIN "RoomType" rt ON rt.id = rm."typeId"
        WHERE r."createdAt" >= ${startDate} AND r.status != 'CANCELLED'
        GROUP BY rt.name
        ORDER BY revenue DESC
      ` as Promise<{ name: string; bookings: number; revenue: number }[]>,
      // Daily revenue (last 30 days)
      prisma.$queryRaw`
        SELECT DATE(p."createdAt") as date, SUM(p.amount)::float as revenue
        FROM "Payment" p
        WHERE p.status = 'COMPLETED' AND p."createdAt" >= ${startDate}
        GROUP BY DATE(p."createdAt")
        ORDER BY date ASC
      ` as Promise<{ date: Date; revenue: number }[]>,
      // Total rooms for occupancy
      prisma.room.count(),
    ])

    const avgNights = avgStayLength.length > 0
      ? (avgStayLength.reduce((sum: any, r: any) => {
          return sum + Math.ceil((r.checkOut.getTime() - r.checkIn.getTime()) / (1000 * 60 * 60 * 24))
        }, 0) / avgStayLength.length).toFixed(1)
      : "0"

    return NextResponse.json({
      summary: {
        totalRevenue: Number(totalRevenue._sum.amount || 0),
        paymentCount: totalRevenue._count,
        reservationCount,
        averageStayNights: parseFloat(avgNights),
        period,
      },
      sourceBreakdown: sourceBreakdown.map((s: any) => ({
        source: s.source,
        count: s._count,
        revenue: Number(s._sum.totalAmount || 0),
      })),
      roomTypeRevenue: roomTypeRevenue || [],
      dailyRevenue: (dailyRevenue || []).map((d: any) => ({
        date: d.date,
        revenue: d.revenue || 0,
      })),
    })
  } catch (error) {
    console.error("Reports error:", error)
    return NextResponse.json({ error: "Error al generar reportes" }, { status: 500 })
  }
}
