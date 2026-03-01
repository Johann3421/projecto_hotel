import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params

  try {
    const reservation = await prisma.reservation.findUnique({
      where: { confirmationCode: code },
      include: {
        guest: true,
        assignedRooms: {
          include: { room: { include: { roomType: true } } },
        },
        extras: { include: { extra: true } },
        payments: true,
      },
    })

    if (!reservation) {
      return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 })
    }

    const roomType = (reservation as any).assignedRooms[0]?.room?.roomType
    const nights = Math.ceil(
      (reservation.checkOut.getTime() - reservation.checkIn.getTime()) / (1000 * 60 * 60 * 24)
    )

    // Generate a simple PDF-like response (HTML for now, can be replaced with @react-pdf/renderer)
    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Comprobante - ${reservation.confirmationCode}</title>
  <style>
    body { font-family: 'Helvetica', sans-serif; max-width: 700px; margin: 0 auto; padding: 40px; color: #1a1a2e; }
    .header { text-align: center; border-bottom: 2px solid #c9a84c; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { font-size: 24px; color: #1a1a2e; margin: 0; }
    .header p { color: #666; font-size: 12px; margin: 5px 0; }
    .code { font-size: 18px; font-weight: bold; color: #c9a84c; margin: 15px 0; }
    .section { margin-bottom: 20px; }
    .section h2 { font-size: 14px; color: #c9a84c; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .label { font-size: 11px; color: #999; }
    .value { font-size: 13px; font-weight: bold; }
    .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; }
    .total-row.final { border-top: 2px solid #1a1a2e; font-size: 16px; font-weight: bold; color: #c9a84c; }
    .footer { text-align: center; margin-top: 40px; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Alturas Grand Hotel</h1>
    <p>Jr. Huallaga 520, Huánuco 10001, Perú</p>
    <p>+51 62 000 0000 · reservas@alturasgrand.pe</p>
    <div class="code">${reservation.confirmationCode}</div>
  </div>

  <div class="section">
    <h2>Detalles de la Reserva</h2>
    <div class="grid">
      <div><div class="label">Habitación</div><div class="value">${roomType?.name || "N/A"}</div></div>
      <div><div class="label">Noches</div><div class="value">${nights}</div></div>
      <div><div class="label">Check-in</div><div class="value">${reservation.checkIn.toLocaleDateString("es-PE")}</div></div>
      <div><div class="label">Check-out</div><div class="value">${reservation.checkOut.toLocaleDateString("es-PE")}</div></div>
      <div><div class="label">Adultos</div><div class="value">${reservation.adults}</div></div>
      <div><div class="label">Niños</div><div class="value">${reservation.children}</div></div>
    </div>
  </div>

  <div class="section">
    <h2>Huésped</h2>
    <div class="grid">
      <div><div class="label">Nombre</div><div class="value">${(reservation as any).guest.firstName} ${(reservation as any).guest.lastName}</div></div>
      <div><div class="label">Email</div><div class="value">${(reservation as any).guest.email}</div></div>
      <div><div class="label">Documento</div><div class="value">${(reservation as any).guest.documentType} ${(reservation as any).guest.documentNumber}</div></div>
      <div><div class="label">Teléfono</div><div class="value">${(reservation as any).guest.phone || "N/A"}</div></div>
    </div>
  </div>

  <div class="section">
    <h2>Desglose de Pago</h2>
    <div class="total-row">
      <span>Subtotal (${nights} noches × S/ ${roomType ? (Number((reservation as any).totalRoomCost) / nights).toFixed(2) : "0.00"})</span>
      <span>S/ ${Number((reservation as any).totalRoomCost).toFixed(2)}</span>
    </div>
    ${reservation.extras.map((e: any) => `
    <div class="total-row">
      <span>${e.extra.name} × ${e.quantity}</span>
      <span>S/ ${Number(e.totalPrice).toFixed(2)}</span>
    </div>`).join("")}
    <div class="total-row">
      <span>IGV (18%)</span>
      <span>S/ ${Number(reservation.taxAmount).toFixed(2)}</span>
    </div>
    <div class="total-row final">
      <span>TOTAL</span>
      <span>S/ ${Number(reservation.totalAmount).toFixed(2)}</span>
    </div>
  </div>

  <div class="footer">
    <p>Este comprobante es válido como confirmación de reserva.</p>
    <p>Alturas Grand Hotel · RUC: 20000000001 · Huánuco, Perú</p>
    <p>Generado el ${new Date().toLocaleDateString("es-PE")} a las ${new Date().toLocaleTimeString("es-PE")}</p>
  </div>
</body>
</html>`

    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `inline; filename="reserva-${code}.html"`,
      },
    })
  } catch (error) {
    console.error("Error generating invoice:", error)
    return NextResponse.json({ error: "Error al generar comprobante" }, { status: 500 })
  }
}
