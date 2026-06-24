import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    // 1. Leemos el paquete de datos que nos manda Wompi
    const body = await request.json();
    
    // 2. Traemos el secreto de integridad guardado en tu .env.local
    const integritySecret = process.env.WOMPI_INTEGRITY_SECRET || "test_integrity_secret";

    // 3. Wompi nos manda los datos clave de la transacción
    const { transaction } = body.data;
    const { id, reference, amount_in_cents, status } = transaction;

    // 4. REGLA DE ORO DE SEGURIDAD: Validar que el aviso venga de Wompi real
    const chain = `${id}${amount_in_cents}${transaction.currency}${status}${integritySecret}`;
    const hashHex = crypto
      .createHash("sha256")
      .update(chain)
      .digest("hex");

    // Si la firma que calculamos no coincide con la de Wompi, rechazamos
    if (hashHex !== body.signature.checksum) {
      console.error("Alerta: Firma de Webhook inválida. Intento de fraude.");
      return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
    }

    console.log(`Webhook recibido con éxito para la orden: ${reference}, Estado: ${status}`);

    // 5. Si el pago fue aprobado, actualizamos usando los campos reales de David
    if (status === "APPROVED") {
      await db
        .update(orders)
        .set({ 
          status: "received" // Ponemos "received" que es el estado inicial permitido en su enum
        })
        .where(eq(orders.orderNumber, reference)); // Buscamos por orderNumber en lugar de reference
        
      console.log(`Base de datos actualizada: Orden ${reference} marcada como recibida.`);
    }

    // Le respondemos a Wompi con un 200 OK
    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error) {
    console.error("Error procesando el Webhook de Wompi:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}