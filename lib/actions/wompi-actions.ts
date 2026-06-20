'use server'

import crypto from "crypto" // Librería nativa para encriptar con SHA256
import { db } from "@/lib/db"

export async function generateWompiSignature(reference: string, amountInPesos: number) {
  try {
    // 1. REGLA DEL PDF: Pasar el monto a centavos (Multiplicar por 100) 
    const amountInCents = amountInPesos * 100

    // 2. Moneda fija para Colombia [cite: 171]
    const currency = "COP"

    // 3. Traer el secreto de las variables de entorno (.env.local) [cite: 58]
    // NOTA: Reemplazar por la variable real cuando David configure el Dashboard [cite: 58]
    const integritySecret = process.env.WOMPI_INTEGRITY_SECRET || "test_integrity_secret"

    // 4. REGLA DEL PDF: Concatenar en el orden estricto: <Referencia><Monto><Moneda><Secreto> [cite: 89]
    const cadenaConcatenada = `${reference}${amountInCents}${currency}${integritySecret}`

    // 5. Cifrar la cadena usando el algoritmo SHA256 
    const hashHex = crypto
      .createHash("sha256")
      .update(cadenaConcatenada)
      .digest("hex")

    // Retornamos los datos limpios para el Widget [cite: 144, 176]
    return {
      success: true,
      signature: hashHex,
      amountInCents,
      currency
    }

  } catch (error) {
    console.error("Error generando la firma de Wompi:", error)
    return { success: false, error: "No se pudo procesar la firma de seguridad." }
  }
}