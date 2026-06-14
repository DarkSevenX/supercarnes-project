import { and, eq, isNull, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { cartItems, products } from "@/lib/db/schema";
import type { SessionPayload } from "@/lib/auth";

export async function getCartItemsForUser(
  session: SessionPayload | null,
  cartSessionId: string | null,
) {
  let condition;
  if (session) {
    condition = cartSessionId
      ? or(
          eq(cartItems.userId, session.userId),
          eq(cartItems.sessionId, cartSessionId),
        )
      : eq(cartItems.userId, session.userId);
  } else if (!cartSessionId) {
    return [];
  } else {
    condition = eq(cartItems.sessionId, cartSessionId);
  }

  const items = await db
    .select({
      id: cartItems.id,
      quantity: cartItems.quantity,
      productId: products.id,
      name: products.name,
      price: products.price,
      priceUnit: products.priceUnit,
      imageUrl: products.imageUrl,
      subcategory: products.subcategory,
      badges: products.badges,
      category: products.category,
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(condition);

  return items;
}

export async function getCartCount(
  session: SessionPayload | null,
  cartSessionId: string | null,
) {
  const items = await getCartItemsForUser(session, cartSessionId);
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export async function mergeGuestCartToUser(
  userId: number,
  cartSessionId: string,
) {
  const guestItems = await db
    .select()
    .from(cartItems)
    .where(
      and(eq(cartItems.sessionId, cartSessionId), isNull(cartItems.userId)),
    );

  for (const item of guestItems) {
    const existing = await db
      .select()
      .from(cartItems)
      .where(
        and(eq(cartItems.userId, userId), eq(cartItems.productId, item.productId)),
      )
      .limit(1);

    if (existing[0]) {
      await db
        .update(cartItems)
        .set({ quantity: existing[0].quantity + item.quantity })
        .where(eq(cartItems.id, existing[0].id));
      await db.delete(cartItems).where(eq(cartItems.id, item.id));
    } else {
      await db
        .update(cartItems)
        .set({ userId, sessionId: null })
        .where(eq(cartItems.id, item.id));
    }
  }
}
