import { z } from "zod"

export const extraSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  description: z.string().trim().optional().nullable(),
  price: z.coerce.number().min(0, "Precio inválido"),
  priceType: z.enum(["PER_NIGHT", "PER_STAY", "PER_PERSON"]),
  icon: z.string().trim().optional().nullable(),
  available: z.coerce.boolean().default(true),
  roomTypeIds: z.array(z.string().min(1)).default([]),
})

export const seasonalPriceSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  startDate: z.string().min(1, "Fecha de inicio requerida"),
  endDate: z.string().min(1, "Fecha de fin requerida"),
  multiplier: z.coerce.number().min(0.1, "Multiplicador inválido").max(10),
  roomTypeId: z.string().min(1, "Tipo de habitación requerido"),
}).refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
  message: "La fecha final debe ser posterior o igual a la inicial",
  path: ["endDate"],
})

export type ExtraInput = z.infer<typeof extraSchema>
export type SeasonalPriceInput = z.infer<typeof seasonalPriceSchema>