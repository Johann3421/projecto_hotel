"use client"
import { create } from "zustand"
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware"
import { GuestFormData, ExtraSelection, RoomSelectionData } from "@/types"

interface BookingState {
  step: number
  roomTypeId: string | null
  roomTypeName: string | null
  roomTypeSlug: string | null
  roomTypeImage: string | null
  checkIn: string | null
  checkOut: string | null
  adults: number
  children: number
  nights: number
  pricePerNight: number
  roomCost: number
  guestData: GuestFormData | null
  selectedExtras: ExtraSelection[]
  extrasCost: number
  subtotal: number
  taxRate: number
  taxAmount: number
  totalAmount: number
  // Actions
  setStep: (step: number) => void
  setRoomSelection: (data: RoomSelectionData & { roomTypeSlug?: string; roomTypeImage?: string }) => void
  setGuestData: (data: GuestFormData) => void
  addExtra: (extra: ExtraSelection) => void
  removeExtra: (extraId: string) => void
  updateExtraQuantity: (extraId: string, qty: number) => void
  recalculateTotals: () => void
  clearBooking: () => void
}

const TAX_RATE = 0.18

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      step: 1,
      roomTypeId: null,
      roomTypeName: null,
      roomTypeSlug: null,
      roomTypeImage: null,
      checkIn: null,
      checkOut: null,
      adults: 2,
      children: 0,
      nights: 0,
      pricePerNight: 0,
      roomCost: 0,
      guestData: null,
      selectedExtras: [],
      extrasCost: 0,
      subtotal: 0,
      taxRate: TAX_RATE,
      taxAmount: 0,
      totalAmount: 0,

      setStep: (step) => set({ step }),

      setRoomSelection: (data) => {
        const roomCost = data.pricePerNight * data.nights
        const state = get()
        const extrasCost = state.extrasCost
        const subtotal = roomCost + extrasCost
        const taxAmount = Math.round(subtotal * TAX_RATE * 100) / 100
        const totalAmount = Math.round((subtotal + taxAmount) * 100) / 100

        set({
          roomTypeId: data.roomTypeId,
          roomTypeName: data.roomTypeName,
          roomTypeSlug: data.roomTypeSlug || null,
          roomTypeImage: data.roomTypeImage || null,
          checkIn: data.checkIn,
          checkOut: data.checkOut,
          adults: data.adults,
          children: data.children,
          nights: data.nights,
          pricePerNight: data.pricePerNight,
          roomCost,
          subtotal,
          taxAmount,
          totalAmount,
          step: 2,
        })
      },

      setGuestData: (data) => set({ guestData: data, step: 3 }),

      addExtra: (extra) => {
        const state = get()
        const existing = state.selectedExtras.find((e) => e.extraId === extra.extraId)
        if (existing) return

        const newExtras = [...state.selectedExtras, extra]
        set({ selectedExtras: newExtras })
        get().recalculateTotals()
      },

      removeExtra: (extraId) => {
        const state = get()
        const newExtras = state.selectedExtras.filter((e) => e.extraId !== extraId)
        set({ selectedExtras: newExtras })
        get().recalculateTotals()
      },

      updateExtraQuantity: (extraId, qty) => {
        const state = get()
        const newExtras = state.selectedExtras.map((e) =>
          e.extraId === extraId ? { ...e, quantity: qty } : e
        )
        set({ selectedExtras: newExtras })
        get().recalculateTotals()
      },

      recalculateTotals: () => {
        const state = get()
        const extrasCost = state.selectedExtras.reduce((sum, e) => {
          switch (e.priceType) {
            case "PER_NIGHT":
              return sum + e.unitPrice * e.quantity * state.nights
            case "PER_PERSON":
              return sum + e.unitPrice * e.quantity * state.adults
            case "PER_STAY":
              return sum + e.unitPrice * e.quantity
            default:
              return sum + e.unitPrice * e.quantity
          }
        }, 0)
        const subtotal = state.roomCost + extrasCost
        const taxAmount = Math.round(subtotal * TAX_RATE * 100) / 100
        const totalAmount = Math.round((subtotal + taxAmount) * 100) / 100

        set({ extrasCost, subtotal, taxAmount, totalAmount })
      },

      clearBooking: () =>
        set({
          step: 1,
          roomTypeId: null,
          roomTypeName: null,
          roomTypeSlug: null,
          roomTypeImage: null,
          checkIn: null,
          checkOut: null,
          adults: 2,
          children: 0,
          nights: 0,
          pricePerNight: 0,
          roomCost: 0,
          guestData: null,
          selectedExtras: [],
          extrasCost: 0,
          subtotal: 0,
          taxAmount: 0,
          totalAmount: 0,
        }),
    }),
    {
      name: "alturas-booking",
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? noopStorage : window.sessionStorage
      ),
    }
  )
)
