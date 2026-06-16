import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { ensureDb, jsonError } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";

export async function GET() {
  await ensureDb();
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return jsonError("No autorizado", 403);
  }

  const items = await db.select().from(products);
  return Response.json({ items });
}

export async function POST(request: NextRequest) {
  await ensureDb();
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return jsonError("No autorizado", 403);
  }

  try {
    const body = await request.json();
    
    // Validar campos requeridos
    if (!body.name || !body.price || !body.category) {
      return jsonError("Nombre, precio y categoría son requeridos", 400);
    }

    const [product] = await db
      .insert(products)
      .values({
        name: body.name,
        slug: body.slug ?? body.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        description: body.description ?? "",
        category: body.category,
        cutType: body.cutType ?? "Steak",
        grade: body.grade ?? null,
        price: body.price,
        priceUnit: body.priceUnit ?? "kg",
        imageUrl: body.imageUrl ?? "/placeholder.jpg",
        stockKg: body.stockKg ?? 0,
        badges: JSON.stringify(body.badges ?? []),
      })
      .returning();

    return Response.json(product, { status: 201 });
  } catch (error) {
    console.error("Error al crear producto:", error);
    return jsonError("Error interno del servidor", 500);
  }
}
