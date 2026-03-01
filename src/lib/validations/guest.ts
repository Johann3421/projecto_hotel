import { z } from "zod"

export const guestSchema = z.object({
  firstName: z.string().min(2, "Mínimo 2 caracteres"),
  lastName: z.string().min(2, "Mínimo 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(6, "Teléfono requerido").optional(),
  nationality: z.string().min(2, "País requerido").optional(),
  documentType: z.enum(["DNI", "PASSPORT", "CE", "RUC"]).default("DNI"),
  documentNumber: z.string().min(4, "Documento requerido").optional(),
  birthDate: z.string().optional(),
  vipStatus: z.boolean().default(false),
  notes: z.string().optional(),
})

export type GuestInput = z.infer<typeof guestSchema>
