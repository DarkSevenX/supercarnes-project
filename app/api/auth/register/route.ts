import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { ensureDb, jsonError } from "@/lib/api";
import { createSession, getOrCreateCartSessionId } from "@/lib/auth";
import { mergeGuestCartToUser } from "@/lib/cart-helpers";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export async function POST(request: NextRequest) {
  await ensureDb();
  const { name, email, password } = await request.json();

  if (!name || !email || !password) {
    return jsonError("Todos los campos son requeridos");
  }

  if (password.length < 8) {
    return jsonError("La contraseña debe tener al menos 8 caracteres");
  }

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing[0]) {
    return jsonError("El correo ya está registrado", 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db
    .insert(users)
    .values({
      name,
      email,
      passwordHash,
      role: "customer",
      loyaltyPoints: 100,
      memberSince: String(new Date().getFullYear()),
    })
    .returning();

  const cartSessionId = await getOrCreateCartSessionId();
  await mergeGuestCartToUser(user.id, cartSessionId);

  await createSession({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  return Response.json({ user: { id: user.id, name: user.name, email: user.email } });
}
