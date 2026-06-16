'use server'

import { eq, count, sum, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { products, orders, users, orderItems } from "@/lib/db/schema"

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
