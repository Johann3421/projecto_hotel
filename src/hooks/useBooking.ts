"use client"
import { useBookingStore } from "@/store/booking"

export function useBooking() {
  const store = useBookingStore()
  
  const canProceedToGuest = !!(store.roomTypeId && store.checkIn && store.checkOut)
  const canProceedToExtras = !!(canProceedToGuest && store.guestData)
  const canProceedToSummary = canProceedToExtras

  return {
    ...store,
    canProceedToGuest,
    canProceedToExtras,
    canProceedToSummary,
  }
}
