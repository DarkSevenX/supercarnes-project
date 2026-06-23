'use server'

import { eq, count, sum, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { products, orders, users, orderItems, categories } from "@/lib/db/schema"

// Verificar si el usuario es admin
async function requireAdmin() {
  const session = await getSession()
  if (!session || session.role !== "admin") {
    throw new Error("No autorizado")
  }
  return session
}

// Productos
export async function createProduct(data: {
  name: string
  description?: string
  category: string
  cutType?: string
  grade?: string | null
  price: number
  priceUnit?: string
  imageUrl?: string
  stockKg?: number
  badges?: string[]
}) {
  await requireAdmin()

  const slug = data.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")

  const [product] = await db
    .insert(products)
    .values({
      name: data.name,
      slug,
      description: data.description ?? "",
      category: data.category,
      cutType: data.cutType ?? "Steak",
      grade: data.grade ?? null,
      price: data.price,
      priceUnit: data.priceUnit ?? "kg",
      imageUrl: data.imageUrl ?? "/placeholder.jpg",
      stockKg: data.stockKg ?? 0,
      badges: JSON.stringify(data.badges ?? []),
    })
    .returning()

  revalidatePath('/admin')
  return { success: true, product }
}

export async function updateProduct(id: number, data: {
  name?: string
  description?: string
  price?: number
  stockKg?: number
  grade?: string
}) {
  await requireAdmin()

  await db
    .update(products)
    .set({
      name: data.name,
      price: data.price,
      stockKg: data.stockKg,
      grade: data.grade,
      description: data.description,
    })
    .where(eq(products.id, id))

  revalidatePath('/admin')
  return { success: true }
}

export async function deleteProduct(id: number) {
  await requireAdmin()

  await db.delete(products).where(eq(products.id, id))

  revalidatePath('/admin')
  return { success: true }
}

// Stats
export async function getAdminStats() {
  await requireAdmin()

  const [sales] = await db
    .select({ total: sum(orders.total) })
    .from(orders)

  const [customerCount] = await db
    .select({ count: count() })
    .from(users)
    .where(eq(users.role, "customer"))

  const [activeOrders] = await db
    .select({ count: count() })
    .from(orders)
    .where(sql`${orders.status} != 'delivered'`)

  const topProducts = await db
    .select({
      name: orderItems.productName,
      units: sql<number>`sum(${orderItems.quantity})`.as("units"),
    })
    .from(orderItems)
    .groupBy(orderItems.productName)
    .orderBy(sql`sum(${orderItems.quantity}) desc`)
    .limit(3)

  const recentCustomers = await db
    .select({
      name: users.name,
      avatarUrl: users.avatarUrl,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.role, "customer"))
    .orderBy(sql`${users.createdAt} desc`)
    .limit(2)

  return {
    totalSales: sales?.total ?? 498368000,
    salesGrowth: "12%",
    newCustomers: customerCount?.count ?? 1248,
    customersGrowth: "5.4%",
    activeOrders: activeOrders?.count ?? 42,
    capacityPercent: 65,
    topSelling: topProducts.map((p, i) => ({
      rank: i + 1,
      name: p.name,
      units: p.units ?? 0,
    })),
    recentCustomers: recentCustomers.map((c) => ({
      name: c.name,
      purchase: "Compra reciente",
      timeAgo: "hace 2m",
      avatar:
        c.avatarUrl ??
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAnqZZDyEAM_Ms6ytPlaai68CjTYDnmHIe1-PXLovyQItl_Xi-zwKWyTCIytlxqfcluSawdKJS_5trIiMw6bPZ3Rk6Nqdybqu3M-6iPDaO7yaQvBAZn2diYplOi8AfqHAkp-CGt-nUXt4VQWFmVj3VWRVy5aGFjQnFEEiM7GrmgCnJm9CQDlh_OXUjHu9SyU5DQ_Ez_Bn1i9OUrbZrhpljYZe9j9KRaY69oEENzFO2LTreadPsQJqINbP5mLDxGjxAOUDL_VK2MGzU",
    })),
  }
}

export async function updateOrderStatus(orderId: number, status: string) {
  await requireAdmin()

  await db
    .update(orders)
    .set({ status: status as any })
    .where(eq(orders.id, orderId))

  revalidatePath('/admin')
  revalidatePath(`/pedido/${orderId}`)
  return { success: true }
}

// Categorías
export async function createCategoryAction(name: string) {
  await requireAdmin();

  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  try {
    const [category] = await db
      .insert(categories)
      .values({ name, slug })
      .returning();

    revalidatePath("/admin");
    return { success: true, category };
  } catch (error: any) {
    console.error("Error al crear categoría:", error);
    return { success: false, error: "La categoría ya existe o es inválida." };
  }
}

export async function updateCategoryAction(id: number, name: string) {
  await requireAdmin();

  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  try {
    await db
      .update(categories)
      .set({ name, slug })
      .where(eq(categories.id, id));

    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Error al actualizar categoría:", error);
    return { success: false, error: "Error al actualizar la categoría." };
  }
}

export async function deleteCategoryAction(id: number) {
  await requireAdmin();

  try {
    await db.delete(categories).where(eq(categories.id, id));
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Error al eliminar categoría:", error);
    return { 
      success: false, 
      error: "No se puede eliminar la categoría porque tiene productos vinculados." 
    };
  }
}

export async function getAdminOrdersAndCustomers() {
  await requireAdmin()

  // Fetch all orders with customer info
  const dbOrders = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      customerName: users.name,
      customerEmail: users.email,
      status: orders.status,
      total: orders.total,
      paymentMethod: orders.paymentMethod,
      shippingAddress: orders.shippingAddress,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .innerJoin(users, eq(orders.userId, users.id))
    .orderBy(sql`${orders.createdAt} desc`)

  // Fetch all order items grouped by orderId
  const dbOrderItems = await db
    .select()
    .from(orderItems)

  const orderItemsMap: Record<number, any[]> = {}
  dbOrderItems.forEach(item => {
    if (!orderItemsMap[item.orderId]) {
      orderItemsMap[item.orderId] = []
    }
    orderItemsMap[item.orderId].push({
      id: item.id,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.quantity * item.unitPrice,
    })
  })

  // Format orders for frontend
  const ordersList = dbOrders.map(order => {
    // Parse shipping address if it's JSON
    let addressStr = order.shippingAddress
    try {
      const parsed = JSON.parse(order.shippingAddress)
      addressStr = `${parsed.street}, ${parsed.city}${parsed.zip ? `, CP ${parsed.zip}` : ''}`
    } catch {
      // Keep original
    }

    const items = orderItemsMap[order.id] || []
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      status: order.status,
      total: order.total,
      itemCount,
      createdAt: order.createdAt,
      paymentMethod: order.paymentMethod,
      shippingAddress: addressStr,
    }
  })

  // Fetch customers with total orders, total spent, and last order date
  const dbCustomers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      avatarUrl: users.avatarUrl,
      memberSince: users.memberSince,
      loyaltyPoints: users.loyaltyPoints,
    })
    .from(users)
    .where(eq(users.role, "customer"))

  // For each customer, get count of orders, sum of totals, and max of createdAt
  const customersList = await Promise.all(
    dbCustomers.map(async (customer) => {
      const [orderStats] = await db
        .select({
          count: count(),
          spent: sum(orders.total),
          lastOrder: sql<string>`max(${orders.createdAt})`,
        })
        .from(orders)
        .where(eq(orders.userId, customer.id))

      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        avatarUrl: customer.avatarUrl,
        memberSince: customer.memberSince,
        loyaltyPoints: customer.loyaltyPoints,
        totalSpent: Number(orderStats?.spent ?? 0),
        orderCount: orderStats?.count ?? 0,
        lastOrderDate: orderStats?.lastOrder || "Sin compras",
      }
    })
  )

  // Construct recent orders for the customer tab
  const recentOrdersData = ordersList.slice(0, 5).map(o => ({
    id: o.id,
    customerName: o.customerName,
    total: o.total,
    status: o.status,
    date: o.createdAt.split('T')[0],
  }))

  return {
    orders: ordersList,
    orderItems: orderItemsMap,
    customers: customersList,
    recentOrders: recentOrdersData,
  }
}
