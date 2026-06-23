'use server'

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getOrCreateCartSessionId, getSession } from "@/lib/auth"
import { getCartItemsForUser } from "@/lib/cart-helpers"
import { db } from "@/lib/db"
import { cartItems, orderItems, orders, users } from "@/lib/db/schema"

type CheckoutData = {
  firstName: string
  address: string
  city: string
  zip: string
  phone: string
  paymentMethod?: string
}

export async function createOrder(data: CheckoutData) {
  const session = await getSession()
  
  if (!session) {
    return { success: false, error: "Debe iniciar sesión" }
  }

  const cartSessionId = await getOrCreateCartSessionId()
  const items = await getCartItemsForUser(session, cartSessionId)

  if (!items.length) {
    return { success: false, error: "El carrito está vacío" }
  }

  const {
    firstName,
    address,
    city,
    zip,
    phone,
    paymentMethod = "card",
  } = data

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  )
  const shipping = 0
  const total = subtotal + shipping

  const orderNumber = `SC-${Date.now().toString().slice(-5)}`

  // Crear orden
  const [order] = await db
    .insert(orders)
    .values({
      userId: session.userId,
      orderNumber,
      status: "received",
      subtotal,
      shipping,
      total,
      paymentMethod,
      shippingAddress: JSON.stringify({
        name: firstName,
        street: address,
        city,
        zip,
      }),
      contactPhone: phone,
      deliveryNotes: "",
      driverName: "Carlos Mendoza",
      driverVehicle: "En motocicleta",
      driverDistance: "1.2 km",
      estimatedDelivery: "11:25 AM",
      mapImageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuB2_ANdbZ4HIHCEVmL70zXzA9SFNOYyRNsVyOoWGG7Wi4Z3FaZaIRb6UgaIFYqdEcHNIZ2uF766-ds58P9sqsfCJT4EPHr55V1Du6CkTtHfauMawLi1arOEpjL-m5WQyeZU3l72_QaI_D6nxPrvXdSkrDsH2ruXIJKMJjzCfgmlL-wfokzVSfVQsg_q-cEqznmf0odfaViTEVXFjUdyfcazO0grs9_vnXkkRiioq48bjb2rJNqzCaaDis9IhFTWXEkqjeFPZO9_0N0",
      statusTimeline: JSON.stringify([
        { status: "received", label: "Pedido Recibido", time: "10:15 AM" },
        { status: "preparing", label: "En Preparación", time: "10:45 AM" },
        { status: "in_transit", label: "En Camino", time: "En Tránsito" },
        { status: "delivered", label: "Entregado", time: "Pendiente" },
      ]),
    })
    .returning()

  // Crear items de la orden
  for (const item of items) {
    await db.insert(orderItems).values({
      orderId: order.id,
      productId: item.productId,
      productName: item.name,
      productImage: item.imageUrl,
      quantity: item.quantity,
      unitPrice: item.price,
      detail: item.category,
    })
  }

  // Limpiar carrito
  await db.delete(cartItems).where(eq(cartItems.userId, session.userId))

  // Actualizar puntos de lealtad
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1)

  if (user) {
    await db
      .update(users)
      .set({ loyaltyPoints: user.loyaltyPoints + Math.floor(total / 10) })
      .where(eq(users.id, session.userId))
  }

  revalidatePath('/carrito')
  revalidatePath('/perfil')
  
  // Redirigir a la página del pedido
  redirect(`/pedido/${order.id}`)
}
