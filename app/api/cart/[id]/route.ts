import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { ensureDb, jsonError } from "@/lib/api";
import { db } from "@/lib/db";
import { cartItems } from "@/lib/db/schema";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  await ensureDb();
  const { id } = await params;
  const { quantity } = await request.json();

  if (!quantity || quantity < 1) {
    return jsonError("Cantidad inválida");
  }

  await db
    .update(cartItems)
    .set({ quantity })
    .where(eq(cartItems.id, Number(id)));

  return Response.json({ ok: true });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  await ensureDb();
  const { id } = await params;
  await db.delete(cartItems).where(eq(cartItems.id, Number(id)));
  return Response.json({ ok: true });
}
