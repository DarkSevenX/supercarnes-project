import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { ensureDb, jsonError } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  await ensureDb();
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return jsonError("No autorizado", 403);
  }

  const { id } = await params;
  const body = await request.json();

  await db
    .update(products)
    .set({
      name: body.name,
      price: body.price,
      stockKg: body.stockKg,
      grade: body.grade,
      description: body.description,
    })
    .where(eq(products.id, Number(id)));

  return Response.json({ ok: true });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  await ensureDb();
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return jsonError("No autorizado", 403);
  }

  const { id } = await params;
  await db.delete(products).where(eq(products.id, Number(id)));
  return Response.json({ ok: true });
}
