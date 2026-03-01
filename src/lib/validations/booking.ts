import { z } from "zod"

export const bookingSearchSchema = z.object({
  checkIn: z.string().refine((val) => !isNaN(Date.parse(val)), "Fecha inválida"),
  checkOut: z.string().refine((val) => !isNaN(Date.parse(val)), "Fecha inválida"),
  adults: z.coerce.number().min(1).max(10),
  children: z.coerce.number().min(0).max(6).optional().default(0),
}).refine((data) => {
  const ci = new Date(data.checkIn)
  const co = new Date(data.checkOut)
  return co > ci
}, { message: "La fecha de salida debe ser posterior a la de entrada", path: ["checkOut"] })

export const confirmBookingSchema = z.object({
  roomTypeId: z.string().min(1, "Seleccione un tipo de habitación"),
  checkIn: z.string().refine((val) => !isNaN(Date.parse(val)), "Fecha inválida"),
  checkOut: z.string().refine((val) => !isNaN(Date.parse(val)), "Fecha inválida"),
  adults: z.coerce.number().min(1).max(10),
  children: z.coerce.number().min(0).max(6).default(0),
  guest: z.object({
    firstName: z.string().min(2, "Mínimo 2 caracteres"),
    lastName: z.string().min(2, "Mínimo 2 caracteres"),
    email: z.string().email("Email inválido"),
    phone: z.string().min(6, "Teléfono requerido"),
    nationality: z.string().min(2, "País requerido"),
    documentType: z.enum(["DNI", "PASSPORT", "CE", "RUC"]),
    documentNumber: z.string().min(4, "Documento requerido"),
    notes: z.string().optional(),
  }),
  extras: z.array(z.object({
    extraId: z.string(),
    quantity: z.number().min(1),
  })).optional().default([]),
  paymentMethod: z.enum(["CREDIT_CARD", "DEBIT_CARD", "YAPE", "PLIN", "BANK_TRANSFER", "CASH"]),
  acceptTerms: z.literal(true, "Debe aceptar los términos"),
})

export type BookingSearchInput = z.infer<typeof bookingSearchSchema>
export type ConfirmBookingInput = z.infer<typeof confirmBookingSchema>
