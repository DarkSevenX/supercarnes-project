import AdminDashboard from "@/components/AdminDashboard";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAdminStats } from "@/lib/actions/admin-actions";
import { db } from "@/lib/db";
import { products, categories } from "@/lib/db/schema";

export default async function AdminPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/auth");

  const stats = await getAdminStats();
  const productsData = await db.select().from(products);
  const categoriesData = await db.select().from(categories);

  const parsedStats = {
    ...stats,
    totalSales: Number(stats.totalSales),
  };

  return (
    <AdminDashboard
      stats={parsedStats}
      products={productsData.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description ?? "",
        category: p.category,
        grade: p.grade,
        price: p.price,
        priceUnit: p.priceUnit,
        imageUrl: p.imageUrl,
        stockKg: p.stockKg,
      }))}
      categories={categoriesData.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
      }))}
    />
  );
}
