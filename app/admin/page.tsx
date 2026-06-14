import AdminDashboard from "@/components/AdminDashboard";
import { ensureDb } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { orderItems, orders, products, users } from "@/lib/db/schema";
import { count, eq, sql, sum } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  await ensureDb();
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/auth");

  const [sales] = await db.select({ total: sum(orders.total) }).from(orders);

  const [customerCount] = await db
    .select({ count: count() })
    .from(users)
    .where(eq(users.role, "customer"));

  const [activeOrders] = await db
    .select({ count: count() })
    .from(orders)
    .where(sql`${orders.status} != 'delivered'`);

  const topProducts = await db
    .select({
      name: orderItems.productName,
      units: sql<number>`sum(${orderItems.quantity})`.as("units"),
    })
    .from(orderItems)
    .groupBy(orderItems.productName)
    .orderBy(sql`sum(${orderItems.quantity}) desc`)
    .limit(3);

  const recentCustomers = await db
    .select({
      name: users.name,
      avatarUrl: users.avatarUrl,
    })
    .from(users)
    .where(eq(users.role, "customer"))
    .orderBy(sql`${users.createdAt} desc`)
    .limit(2);

  const allProducts = await db.select().from(products);

  const stats = {
    totalSales: Number(sales?.total ?? 498368000), // Aprox 124592 * 4000
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
  };

  return (
    <AdminDashboard
      stats={stats}
      products={allProducts.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        category: p.category,
        grade: p.grade,
        price: p.price,
        priceUnit: p.priceUnit,
        imageUrl: p.imageUrl,
        stockKg: p.stockKg,
      }))}
    />
  );
}
