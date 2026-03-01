import { z } from "zod"

export const roomSchema = z.object({
  number: z.string().min(1, "Número requerido"),
  floor: z.coerce.number().min(1).max(20),
  roomTypeId: z.string().min(1, "Tipo de habitación requerido"),
  notes: z.string().optional(),
})

export const roomTypeSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  slug: z.string().min(2, "Slug requerido"),
  description: z.string().min(10, "Descripción requerida"),
  shortDesc: z.string().optional(),
  basePrice: z.coerce.number().min(1, "Precio requerido"),
  weekendSurcharge: z.coerce.number().min(0).max(1).default(0.15),
  maxGuests: z.coerce.number().min(1).max(10),
  bedConfiguration: z.string().min(2, "Configuración de camas requerida"),
  sizeSqm: z.coerce.number().optional(),
  floor: z.string().optional(),
  view: z.string().optional(),
})

export type RoomInput = z.infer<typeof roomSchema>
export type RoomTypeInput = z.infer<typeof roomTypeSchema>
