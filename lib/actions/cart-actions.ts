'use server'

import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { getOrCreateCartSessionId, getSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { cartItems, products } from "@/lib/db/schema"
// primer cambio de alejo
export async function addToCart(productId: number, quantity: number = 1) {
  const session = await getSession()
  const cartSessionId = await getOrCreateCartSessionId()

// Verificar que el producto existe y validar stock físico
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1)

  if (!product) {
    return { success: false, error: "Producto no encontrado" }
  }

  // VALIDACIÓN DE ALEJO: Controlar que no pidan más carne de la que hay en nevera
  if (product.stockKg !== undefined && product.stockKg < quantity) {
    return { 
      success: false, 
      error: `Solo quedan ${product.stockKg} kg disponibles de este producto.` 
    }
  }
  // Buscar si ya existe en el carrito
  const condition = session
    ? and(eq(cartItems.userId, session.userId), eq(cartItems.productId, productId))
    : and(eq(cartItems.sessionId, cartSessionId), eq(cartItems.productId, productId))

  const [existing] = await db.select().from(cartItems).where(condition).limit(1)

  if (existing) {
    // Actualizar cantidad
    await db
      .update(cartItems)
      .set({ quantity: existing.quantity + quantity })
      .where(eq(cartItems.id, existing.id))
  } else {
    // Crear nuevo item
    await db.insert(cartItems).values({
      userId: session?.userId ?? null,
      sessionId: session ? null : cartSessionId,
      productId,
      quantity,
    })
  }

  revalidatePath('/carrito')
  return { success: true }
}
export async function updateCartItem(itemId: number, quantity: number) {
  if (quantity < 1) {
    return { success: false, error: "Cantidad debe ser mayor a 0" }
  }

  // 1. Buscar el producto que está amarrado a este item del carrito
  const [cartItem] = await db
    .select({
      productId: cartItems.productId,
      stockKg: products.stockKg,
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.id, itemId))
    .limit(1)

  if (!cartItem) {
    return { success: false, error: "Item no encontrado en el carrito" }
  }

  // 2. VALIDACIÓN DE ALEJO: Verificar que el stock en nevera aguante el cambio
  if (cartItem.stockKg !== null && cartItem.stockKg < quantity) {
    return { 
      success: false, 
      error: `No puedes subir la cantidad. Solo quedan ${cartItem.stockKg} kg disponibles.` 
    }
  }

  // 3. Si todo está bien, actualizar la cantidad con seguridad
  await db
    .update(cartItems)
    .set({ quantity })
    .where(eq(cartItems.id, itemId))

  revalidatePath('/carrito')
  return { success: true }
}

export async function removeCartItem(itemId: number) {
  await db.delete(cartItems).where(eq(cartItems.id, itemId))
  
  revalidatePath('/carrito')
  return { success: true }
}
