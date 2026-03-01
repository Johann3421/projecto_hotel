import { TAX_RATE } from "./utils"

export function calculateReservationTotal(
  pricePerNight: number,
  nights: number,
  extras: Array<{ price: number; quantity: number; priceType: string; nights: number; people: number }>
): {
  roomCost: number
  extrasCost: number
  subtotal: number
  tax: number
  total: number
} {
  const roomCost = pricePerNight * nights

  const extrasCost = extras.reduce((sum, e) => {
    switch (e.priceType) {
      case "PER_NIGHT":
        return sum + e.price * e.quantity * e.nights
      case "PER_PERSON":
        return sum + e.price * e.quantity * e.people
      case "PER_STAY":
        return sum + e.price * e.quantity
      default:
        return sum + e.price * e.quantity
    }
  }, 0)

  const subtotal = roomCost + extrasCost
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100
  const total = Math.round((subtotal + tax) * 100) / 100

  return { roomCost, extrasCost, subtotal, tax, total }
}

export function generateConfirmationCode(sequence: number): string {
  const year = new Date().getFullYear()
  const padded = sequence.toString().padStart(4, "0")
  return `AGH-${year}-${padded}`
}
