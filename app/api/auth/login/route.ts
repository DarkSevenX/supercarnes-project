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
  const { email, password } = await request.json();

  if (!email || !password) {
    return jsonError("Correo y contraseña requeridos");
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return jsonError("Credenciales inválidas", 401);
  }

  const cartSessionId = await getOrCreateCartSessionId();
  await mergeGuestCartToUser(user.id, cartSessionId);

  await createSession({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  return Response.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    role: user.role,
  });
}
