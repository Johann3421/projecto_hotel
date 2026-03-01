import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Dashboard stats API
export async function GET(req: NextRequest) {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const lastOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

    const [
      totalRooms,
      occupiedRooms,
      todayCheckIns,
      todayCheckOuts,
      monthRevenue,
      pendingHousekeeping,
      recentReservations,
      roomsByStatus,
    ] = await Promise.all([
      prisma.room.count(),
      prisma.reservationRoom.count({
        where: {
          reservation: {
            status: "CHECKED_IN",
            checkIn: { lte: today },
            checkOut: { gt: today },
          },
        },
      }),
      prisma.reservation.count({
        where: {
          checkIn: { gte: today, lt: tomorrow },
          status: { in: ["CONFIRMED", "CHECKED_IN"] },
        },
      }),
      prisma.reservation.count({
        where: {
          checkOut: { gte: today, lt: tomorrow },
          status: "CHECKED_IN",
        },
      }),
      prisma.payment.aggregate({
        where: {
          status: "COMPLETED",
          createdAt: { gte: firstOfMonth, lte: lastOfMonth },
        },
        _sum: { amount: true },
      }),
      prisma.room.count({
        where: { status: { in: ["HOUSEKEEPING", "MAINTENANCE"] } },
      }),
      prisma.reservation.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { guest: true, assignedRooms: { include: { room: { include: { roomType: true } } } } },
      }),
      prisma.room.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
    ])

    const occupancyRate = totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(1) : "0"

    return NextResponse.json({
      stats: {
        totalRooms,
        occupiedRooms,
        occupancyRate: parseFloat(occupancyRate),
        todayCheckIns,
        todayCheckOuts,
        monthRevenue: Number(monthRevenue._sum.amount || 0),
        pendingHousekeeping,
      },
      roomsByStatus: roomsByStatus.map((r: any) => ({
        status: r.status,
        count: r._count.status,
      })),
      recentReservations: recentReservations.map((r: any) => ({
        id: r.id,
        confirmationCode: r.confirmationCode,
        guestName: `${r.guest.firstName} ${r.guest.lastName}`,
        roomType: r.assignedRooms[0]?.room?.roomType?.name || "N/A",
        roomNumber: r.assignedRooms[0]?.room?.number || "N/A",
        checkIn: r.checkIn.toISOString().split("T")[0],
        checkOut: r.checkOut.toISOString().split("T")[0],
        status: r.status,
        total: Number(r.totalAmount),
      })),
    })
  } catch (error) {
    console.error("Dashboard error:", error)
    return NextResponse.json({ error: "Error al obtener dashboard" }, { status: 500 })
  }
}
