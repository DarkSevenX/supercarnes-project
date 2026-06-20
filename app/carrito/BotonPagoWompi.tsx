'use client'

import { useState } from "react"
import { generateWompiSignature } from "@/lib/actions/wompi-actions"

interface BotonPagoProps {
  totalOrder: number
  orderReference: string
}

export default function BotonPagoWompi({ totalOrder, orderReference }: BotonPagoProps) {
  const [loading, setLoading] = useState(false)

  const handlePayment = async () => {
    setLoading(true)
    try {
      // 1. LLAMAMOS A TU ACCIÓN DE ALEJO: Genera la firma segura en el servidor
      const res = await generateWompiSignature(orderReference, totalOrder)

      if (!res.success || !res.signature) {
        alert(res.error || "Error al preparar el pago seguro.")
        setLoading(false)
        return
      }

      // 2. Configurar el Widget de Wompi con los datos obtenidos
      const checkout = new (window as any).WidgetCheckout({
        currency: res.currency,
        amountInCents: res.amountInCents,
        reference: orderReference,
        publicKey: "pub_test_Q5cxm6S9Z6i9sc462e9A", // Llave de pruebas por defecto
        signature: {
          integrity: res.signature // Tu firma SHA256 calculada
        }
      })

      // 3. Abrir la ventana flotante con Nequi y Bancolombia
      checkout.open((result: any) => {
        const transaction = result.transaction
        
        if (transaction.status === "APPROVED") {
          alert("¡Pago aprobado con éxito! Tu pedido de carne está en preparación.")
          // Aquí redirigimos a la pantalla de éxito o refrescamos la vista
          window.location.href = `/orden/exito?ref=${orderReference}`
        } else if (transaction.status === "DECLINED") {
          alert("El pago fue rechazado. Intenta con otro método o saldo diferente.")
        } else {
          alert(`Estado del pago: ${transaction.status}`)
        }
      })

    } catch (error) {
      console.error("Error en el flujo de Wompi:", error)
      alert("Ocurrió un error inesperado al conectar con Nequi/Bancolombia.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="w-full bg-[#5C0614] text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-[#42040D] transition-colors disabled:bg-gray-400"
    >
      {loading ? "Procesando seguridad..." : "Pagar con Nequi o Bancolombia"}
    </button>
  )
}