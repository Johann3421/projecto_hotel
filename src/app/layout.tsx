import type { Metadata } from "next"
import { Lora, Lato } from "next/font/google"
import { getPublicAppUrl } from "@/lib/env"
import "./globals.css"

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-lora",
  display: "swap",
})

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  variable: "--font-lato",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(getPublicAppUrl()),
  title: {
    default: "Alturas Grand Hotel — Hotel Boutique 4 Estrellas en Huánuco",
    template: "%s | Alturas Grand Hotel Huánuco",
  },
  description:
    "Hotel boutique 4 estrellas en el corazón de Huánuco con piscina temperada, spa y vistas al río Huallaga. Reserva directa con mejor precio garantizado. Jr. Huallaga 520.",
  keywords: [
    "hotel Huánuco", "hotel boutique Huánuco", "mejor hotel Huánuco", "hotel con piscina Huánuco",
    "alojamiento Huánuco", "hospedaje Huánuco centro", "hotel lujo Huánuco", "hotel spa Huánuco",
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${lora.variable} ${lato.variable}`}>
      <body className="font-sans antialiased bg-ivory-50 text-slate-800">
        {children}
      </body>
    </html>
  )
}
