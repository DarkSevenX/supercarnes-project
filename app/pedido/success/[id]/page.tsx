import { ensureDb } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { orderItems, orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import MaterialIcon from "@/components/MaterialIcon";
import { formatCOP } from "@/lib/utils";
import Link from "next/link";

type PageProps = {
  params: Promise<{ id: string }>;
};

const WhatsAppIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 448 512"
    className={className}
    fill="currentColor"
  >
    <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zM223.9 414.4c-32 0-63.1-8.5-90.5-24.6l-6.5-3.8-67.2 17.6 18-65.6-4.2-6.7c-17.7-28-27-60-27-92.4 0-103.5 84.3-187.8 187.9-187.8 50.2 0 97.4 19.6 132.8 55.1 35.5 35.5 55.1 82.6 55.1 132.9 0 103.6-84.3 187.8-187.9 187.8zM326.6 280.9c-5.6-2.8-33.3-16.4-38.5-18.3-5.2-1.9-9-2.8-12.8 2.8-3.8 5.6-14.5 18.3-17.8 22-3.3 3.8-6.6 4.2-12.2 1.4-5.6-2.8-23.7-8.8-45.2-28.1-16.7-15-28-33.5-31.3-39.1-3.3-5.6-.4-8.7 2.4-11.5 2.5-2.5 5.6-6.6 8.5-9.9 2.8-3.3 3.8-5.6 5.6-9.4 1.9-3.8.9-7.1-.4-9.9-1.4-2.8-12.8-30.9-17.5-42.3-4.6-11.2-9.3-9.7-12.8-9.9-3.3-.2-7.1-.2-10.8-.2-3.8 0-9.9 1.4-15 7.1-5.2 5.6-19.7 19.3-19.7 47 0 27.7 20.2 54.4 23 58.2 2.8 3.8 39.6 60.5 95.9 84.9 13.4 5.8 23.9 9.3 32 11.9 13.5 4.3 25.8 3.7 35.5 2.2 11-1.7 33.3-13.6 38-26.8 4.6-13.1 4.6-24.4 3.3-26.8-1.5-2.4-5.3-3.8-10.9-6.6z" />
  </svg>
);

export default async function SuccessPage({ params }: PageProps) {
  await ensureDb();
  const session = await getSession();
  if (!session) redirect("/auth");

  const { id } = await params;

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, Number(id)))
    .limit(1);

  if (!order) notFound();

  if (session.role !== "admin" && order.userId !== session.userId) {
    redirect("/perfil");
  }

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id));

  const shippingAddress = order.shippingAddress
    ? (JSON.parse(order.shippingAddress) as {
      name?: string;
      street?: string;
      city?: string;
      zip?: string;
      cashAmount?: number;
    })
    : {};

  // Formatear mensaje para WhatsApp
  let message = `Nuevo pedido (Surtidelicias Food Service SAS)\n\n---- Pedido: *${order.orderNumber.replace('SC-', '')}* ----\n\n`;

  items.forEach(item => {
    message += `${item.quantity} x ${item.productName} - (${formatCOP(item.unitPrice)})\n`;
  });

  message += `\n*Subtotal:* ${formatCOP(order.subtotal)}\n`;
  message += `*Delivery:* ${formatCOP(order.shipping)}\n`;
  
  const isTransferencia = order.paymentMethod === "transferencia";
  
  if (!isTransferencia && shippingAddress.cashAmount) {
    message += `*Efectivo:* ${formatCOP(shippingAddress.cashAmount)}\n`;
  }
  
  message += `*Total:* ${formatCOP(order.total)}\n`;
  message += `*Forma de pago:* ${isTransferencia ? "Transferencia Bancolombia" : "Efectivo"}\n\n`;

  message += `*Forma de entrega:* DOMICILIO\n\n`;

  message += `*Nombre:* ${shippingAddress.name || ''}\n`;
  message += `*Celular:* ${order.contactPhone}\n`;
  message += `*Zona de Entrega:* ${shippingAddress.city || 'Montería Urbano'}\n`;
  message += `*Dirección de Entrega:* ${shippingAddress.street || ''}\n`;
  message += `*Entrega Programada:*\n`;
  message += `Fecha: Lo antes posible\n`;
  message += `Hora: Pendiente\n`;

  message += `\n-----------------------------\n(Mensaje para el Cliente)\n\nRecuerde que debe pagar con:\n`;
  if (isTransferencia) {
    message += `Desde la App Bancolombia o Cajero, debes transferir a Cuenta Ahorros Bancolombia 166-000011-84\n`;
  } else {
    message += `Paga con Efectivo al Recibir\n`;
  }
  message += `*Total:* ${formatCOP(order.total)}`;

  const encodedMessage = encodeURIComponent(message);
  const whatsappNumber = "573145368150"; // Replace with real number if needed, usually just leaving a link is fine but wait, we need a number. Let's use a dummy or a config one.
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

  return (
    <div className="min-h-screen bg-surface py-10 px-4 flex flex-col items-center">
      <div className="max-w-2xl w-full flex flex-col items-center">

        {/* Success Header */}
        <div className="w-16 h-16 bg-[#e6f4ea] text-[#137333] rounded-full flex items-center justify-center mb-6">
          <MaterialIcon name="check" className="text-4xl" />
        </div>

        <h1 className="text-2xl font-bold text-on-surface mb-2">¡Tu pedido está casi listo!</h1>
        <p className="text-error font-bold mb-4">Pedido: #{order.orderNumber.replace('SC-', '')}</p>
        <p className="text-secondary mb-8">Completa el proceso notificando al comercio por WhatsApp.</p>

        {/* Top WhatsApp Button */}
        <div className="w-full bg-[#f8f9fa] border border-surface-container rounded-lg p-4 flex flex-col items-center mb-8">
          <p className="text-sm text-secondary mb-3">Tu pedido #{order.orderNumber.replace('SC-', '')} está listo. Haz clic para notificar al comercio:</p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 bg-[#25D366] text-white rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-[#1da851] transition-colors"
          >
            <WhatsAppIcon /> Enviar pedido por WhatsApp
          </a>
        </div>

        {/* Order Summary */}
        <div className="w-full bg-white border border-surface-container rounded-lg mb-8">
          <div className="flex justify-between items-center p-4 border-b border-surface-container">
            <h2 className="font-bold text-on-surface">Resumen del pedido</h2>
            <span className="text-sm text-secondary">{items.length} productos</span>
          </div>
          <div className="p-4 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 items-center border-b border-surface-container pb-4 last:border-0 last:pb-0">
                <div className="relative w-16 h-16 bg-surface-container rounded overflow-hidden flex-shrink-0">
                  {item.productImage ? (
                    <Image src={item.productImage} alt={item.productName} fill className="object-cover" unoptimized />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-secondary">
                      <MaterialIcon name="image" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm text-on-surface">{item.productName}</h3>
                  <p className="text-xs text-secondary mt-1">Cant: {item.quantity} × {formatCOP(item.unitPrice)}</p>
                </div>
                <div className="font-bold text-sm">
                  {formatCOP(item.unitPrice * item.quantity)}
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 bg-[#f8f9fa] rounded-b-lg space-y-2">
            <div className="flex justify-between text-sm text-secondary">
              <span>Subtotal</span>
              <span>{formatCOP(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-secondary">
              <span>Envío</span>
              <span>{formatCOP(order.shipping)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-error mt-2 pt-2 border-t border-surface-container">
              <span>Total</span>
              <span>{formatCOP(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Delivery Information */}
        <div className="w-full bg-white border border-surface-container rounded-lg mb-8">
          <div className="p-4 border-b border-surface-container">
            <h2 className="font-bold text-on-surface">Información de entrega</h2>
          </div>
          <div className="p-4 space-y-3 text-sm">
            <div className="grid grid-cols-[100px_1fr] gap-4">
              <span className="text-secondary">Nombre:</span>
              <span className="font-bold">{shippingAddress.name || ''}</span>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-4">
              <span className="text-secondary">Teléfono:</span>
              <span className="font-bold">{order.contactPhone}</span>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-4">
              <span className="text-secondary">Zona:</span>
              <span className="font-bold">{shippingAddress.city || 'Montería Urbano'}</span>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-4">
              <span className="text-secondary">Dirección:</span>
              <span className="font-bold">{shippingAddress.street || ''}</span>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-4">
              <span className="text-secondary">Pago:</span>
              <span className="font-bold">{isTransferencia ? "Transferencia Bancolombia" : "Efectivo"}</span>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="w-full flex flex-col gap-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 bg-error text-white rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-red-700 transition-colors"
          >
            <WhatsAppIcon /> Enviar pedido por WhatsApp
          </a>
          <Link
            href="/"
            className="w-full py-3 bg-white text-on-surface border border-surface-container rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-surface-container-low transition-colors"
          >
            <MaterialIcon name="arrow_back" /> Volver a la tienda
          </Link>
        </div>

        <p className="text-xs text-secondary mt-8">
          Gracias por tu compra en Surtidelicias Food Service SAS
        </p>

      </div>
    </div>
  );
}
