import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { ensureDb, jsonError } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";

type Params = { params: Promise<{ id: string }> };

const ALLOWED_STATUSES = ["received", "preparing", "in_transit", "delivered", "cancelled"];

export async function PATCH(request: NextRequest, { params }: Params) {
  await ensureDb();
  const session = await getSession();
  if (!session) {
    return jsonError("No autorizado", 403);
  }

  const { id } = await params;
  const body = await request.json();
  
  if (!body.status || !ALLOWED_STATUSES.includes(body.status)) {
    return jsonError("Estado no válido", 400);
  }

  try {
    // Verificar que el pedido existe y pertenece al usuario (o usuario es admin)
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, Number(id)));
    
    if (!order) {
      return jsonError("Pedido no encontrado", 404);
    }
    
    // Solo administradores pueden actualizar cualquier pedido
    // Usuarios normales solo pueden actualizar sus propios pedidos
    if (session.role !== "admin" && order.userId !== session.userId) {
      return jsonError("No autorizado", 403);
    }

    await db
      .update(orders)
      .set({ status: body.status })
      .where(eq(orders.id, Number(id)));

    return Response.json({ 
      ok: true, 
      message: `Estado actualizado a: ${body.status}` 
    });
  } catch (error) {
    console.error("Error al actualizar estado:", error);
    return jsonError("Error interno del servidor", 500);
  }
}