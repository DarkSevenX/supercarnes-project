import { eq } from "drizzle-orm";
import { ensureDb, jsonError } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { orderItems, orders } from "@/lib/db/schema";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  await ensureDb();
  const session = await getSession();
  const { id } = await params;

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, Number(id)))
    .limit(1);

  if (!order) return jsonError("Pedido no encontrado", 404);

  if (session && session.role !== "admin" && order.userId !== session.userId) {
    return jsonError("No autorizado", 403);
  }

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id));

  return Response.json({
    ...order,
    items,
    statusTimeline: order.statusTimeline
      ? JSON.parse(order.statusTimeline)
      : [],
    shippingAddress: order.shippingAddress
      ? JSON.parse(order.shippingAddress)
      : {},
  });
}
