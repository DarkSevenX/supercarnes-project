"use server";

import { resend } from "@/lib/mail";

interface OrderEmailData {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  total: number;
  paymentMethod: string;
  shippingAddress: string;
}

export async function sendOrderConfirmationEmail(order: OrderEmailData) {
  try {
    // Formateamos el total a dinero colombiano clásico ($11.700,00)
    const formattedTotal = new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 2,
    }).format(order.total);

    // Texto dinámico según el método que la dueña pidió emular de la referencia
    let paymentInstructions = "";
    if (order.paymentMethod.toLowerCase().includes("bancolombia") || order.paymentMethod.toLowerCase().includes("transferencia")) {
      paymentInstructions = `
        <div style="background-color: #fff9db; border: 1px solid #f59f00; padding: 15px; border-radius: 5px; margin-top: 15px;">
          <h3 style="color: #f59f00; margin-top: 0;">Instrucciones de Pago (Transferencia)</h3>
          <p>Para despachar tu pedido, por favor realiza la transferencia a la siguiente cuenta:</p>
          <p><strong>Banco:</strong> Bancolombia Ahorros</p>
          <p><strong>Número:</strong> 166-000011-04</p>
          <p><em>Una vez realizada, envia el comprobante por el chat de la página o WhatsApp.</em></p>
        </div>
      `;
    } else if (order.paymentMethod.toLowerCase().includes("efectivo")) {
      paymentInstructions = `
        <div style="background-color: #e3fafc; border: 1px solid #1098ad; padding: 15px; border-radius: 5px; margin-top: 15px;">
          <h3 style="color: #1098ad; margin-top: 0;">Pago Contra Entrega</h3>
          <p>Recuerda tener listo el dinero en efectivo (<strong>${formattedTotal}</strong>) para cuando el domiciliario llegue a tu dirección.</p>
        </div>
      `;
    }

    // Enviamos el correo usando Resend
    const { data, error } = await resend.emails.send({
      from: "SuperCarnes <onboarding@resend.dev>", // Dominio gratuito por defecto de Resend
      to: [order.customerEmail],
      subject: `¡Tu pedido #${order.orderNumber} ha sido recibido!`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 8px;">
          <h2 style="color: #c92a2a; text-align: center;">¡Gracias por tu compra, ${order.customerName}!</h2>
          <p>Hemos recibido tu pedido de productos cárnicos de excelente calidad. Aquí tienes el resumen de tu orden:</p>
          
          <hr style="border: 0; border-top: 1px solid #eee;" />
          
          <p><strong>Número de Pedido:</strong> #${order.orderNumber}</p>
          <p><strong>Dirección de Entrega:</strong> ${order.shippingAddress}</p>
          <p><strong>Método de Pago Seleccionado:</strong> ${order.paymentMethod}</p>
          <h3 style="color: #c92a2a;">Total a Pagar: ${formattedTotal}</h3>
          
          <hr style="border: 0; border-top: 1px solid #eee;" />
          
          ${paymentInstructions}
          
          <p style="font-size: 12px; color: #868e96; text-align: center; margin-top: 30px;">
            SuperCarnes - Alimentos de calidad a precio justo.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Error de Resend:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Error enviando el correo:", err);
    return { success: false, error: err };
  }
}