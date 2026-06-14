import { and, eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { ensureDb, jsonError } from "@/lib/api";
import { getOrCreateCartSessionId, getSession } from "@/lib/auth";
import { getCartItemsForUser } from "@/lib/cart-helpers";
import { db } from "@/lib/db";
import { cartItems, products } from "@/lib/db/schema";

export async function GET() {
  await ensureDb();
  const session = await getSession();
  const cartSessionId = await getOrCreateCartSessionId();
  const items = await getCartItemsForUser(session, cartSessionId);
  return Response.json({ items });
}

export async function POST(request: NextRequest) {
  await ensureDb();
  const session = await getSession();
  const cartSessionId = await getOrCreateCartSessionId();
  const { productId, quantity = 1 } = await request.json();

  if (!productId) return jsonError("productId requerido");

  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  if (!product) return jsonError("Producto no encontrado", 404);

  const condition = session
    ? and(eq(cartItems.userId, session.userId), eq(cartItems.productId, productId))
    : and(eq(cartItems.sessionId, cartSessionId), eq(cartItems.productId, productId));

  const [existing] = await db.select().from(cartItems).where(condition).limit(1);

  if (existing) {
    await db
      .update(cartItems)
      .set({ quantity: existing.quantity + quantity })
      .where(eq(cartItems.id, existing.id));
  } else {
    await db.insert(cartItems).values({
      userId: session?.userId ?? null,
      sessionId: session ? null : cartSessionId,
      productId,
      quantity,
    });
  }

  return Response.json({ ok: true });
}
