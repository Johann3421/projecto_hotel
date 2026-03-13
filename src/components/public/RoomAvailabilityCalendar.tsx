"use client"

import { useState } from "react"
import AvailabilityCalendar from "@/components/public/AvailabilityCalendar"

interface RoomAvailabilityCalendarProps {
  roomTypeId: string
}

export default function RoomAvailabilityCalendar({ roomTypeId }: RoomAvailabilityCalendarProps) {
  const [checkIn, setCheckIn] = useState<Date | null>(null)
  const [checkOut, setCheckOut] = useState<Date | null>(null)

  return (
    <AvailabilityCalendar
      roomTypeId={roomTypeId}
      checkIn={checkIn}
      checkOut={checkOut}
      onDateChange={(nextCheckIn, nextCheckOut) => {
        setCheckIn(nextCheckIn)
        setCheckOut(nextCheckOut)
      }}
    />
  )
}