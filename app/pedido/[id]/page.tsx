import OrderTracking from "@/components/OrderTracking";
import { ensureDb } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { orderItems, orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PedidoPage({ params }: PageProps) {
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

  const orderData = {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    subtotal: order.subtotal,
    shipping: order.shipping,
    total: order.total,
    deliveryNotes: order.deliveryNotes,
    contactPhone: order.contactPhone,
    driverName: order.driverName,
    driverVehicle: order.driverVehicle,
    driverDistance: order.driverDistance,
    estimatedDelivery: order.estimatedDelivery,
    mapImageUrl: order.mapImageUrl,
    statusTimeline: order.statusTimeline
      ? (JSON.parse(order.statusTimeline) as {
          status: string;
          label: string;
          time: string;
        }[])
      : [],
    shippingAddress: order.shippingAddress
      ? (JSON.parse(order.shippingAddress) as {
          street?: string;
          city?: string;
          zip?: string;
        })
      : {},
    items: items.map((item) => ({
      id: item.id,
      productName: item.productName,
      productImage: item.productImage,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      detail: item.detail,
    })),
  };

  return <OrderTracking order={orderData} />;
}
