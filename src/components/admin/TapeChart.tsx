"use client"

import { useMemo } from "react"

interface TapeChartRoom {
  roomId: string
  roomNumber: string
  floor: number
  typeName: string
  status: string
  reservations: {
    id: string
    confirmationCode: string
    guestName: string
    checkIn: string
    checkOut: string
    status: string
    nights: number
  }[]
  blocks: {
    id: string
    reason: string
    startDate: string
    endDate: string
  }[]
}

interface TapeChartProps {
  data: TapeChartRoom[]
  startDate: string
  days: number
  onReservationClick?: (reservationId: string) => void
}

const STATUS_COLORS: Record<string, string> = {
  CONFIRMED: "bg-blue-400",
  CHECKED_IN: "bg-green-500",
  CHECKED_OUT: "bg-amber-400",
  blocked: "bg-red-300",
}

export default function TapeChart({ data, startDate, days, onReservationClick }: TapeChartProps) {
  const dates = useMemo(() => {
    const result: string[] = []
    const start = new Date(startDate)
    for (let i = 0; i < days; i++) {
      const d = new Date(start)
      d.setDate(d.getDate() + i)
      result.push(d.toISOString().split("T")[0])
    }
    return result
  }, [startDate, days])

  const today = new Date().toISOString().split("T")[0]

  return (
    <div className="overflow-x-auto border border-ivory-200 rounded-xl">
      <table className="min-w-full border-collapse">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-navy-900 text-white px-4 py-3 text-left text-xs font-sans font-medium min-w-[140px]">
              Habitación
            </th>
            {dates.map((date) => {
              const d = new Date(date)
              const isToday = date === today
              const dayName = d.toLocaleDateString("es-PE", { weekday: "short" })
              const dayNum = d.getDate()
              return (
                <th
                  key={date}
                  className={`px-1 py-2 text-center text-xs font-sans min-w-[50px] ${
                    isToday ? "bg-gold-100 text-gold-700 font-bold" : "bg-ivory-50 text-slate-500"
                  }`}
                >
                  <div>{dayName}</div>
                  <div className="font-bold">{dayNum}</div>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {data.map((room) => (
            <tr key={room.roomId} className="border-t border-ivory-100">
              <td className="sticky left-0 z-10 bg-white px-4 py-2 border-r border-ivory-200">
                <p className="font-sans text-sm font-bold text-navy-900">{room.roomNumber}</p>
                <p className="font-sans text-xs text-slate-400">{room.typeName}</p>
              </td>
              {dates.map((date) => {
                // Check for reservation on this date
                const reservation = room.reservations.find((r) => {
                  return date >= r.checkIn && date < r.checkOut
                })
                const block = room.blocks.find((b) => {
                  return date >= b.startDate && date < b.endDate
                })

                if (reservation) {
                  const isStart = date === reservation.checkIn
                  return (
                    <td
                      key={date}
                      className={`p-0 ${STATUS_COLORS[reservation.status] || "bg-blue-200"} cursor-pointer hover:opacity-80 transition-opacity ${
                        isStart ? "rounded-l" : ""
                      }`}
                      title={`${reservation.guestName} (${reservation.confirmationCode})`}
                      onClick={() => onReservationClick?.(reservation.id)}
                    >
                      {isStart && (
                        <p className="text-white text-[10px] font-sans font-bold px-1 truncate">
                          {reservation.guestName.split(" ")[0]}
                        </p>
                      )}
                    </td>
                  )
                }

                if (block) {
                  return (
                    <td
                      key={date}
                      className="p-0 bg-red-100"
                      title={`Bloqueado: ${block.reason}`}
                    >
                      <div className="w-full h-full bg-red-200 bg-[repeating-linear-gradient(45deg,transparent,transparent_3px,rgba(220,38,38,0.2)_3px,rgba(220,38,38,0.2)_6px)]" style={{ minHeight: "32px" }} />
                    </td>
                  )
                }

                return (
                  <td
                    key={date}
                    className={`p-0 border-r border-ivory-100 ${
                      date === today ? "bg-gold-50" : "bg-white"
                    }`}
                    style={{ minHeight: "32px" }}
                  />
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
