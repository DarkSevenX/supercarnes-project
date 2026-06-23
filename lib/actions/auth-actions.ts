'use server'

import { eq } from "drizzle-orm"
import { hash, compare } from "bcryptjs"
import { redirect } from "next/navigation"
import { clearSession, createSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { mergeGuestCartToUser } from "@/lib/cart-helpers"
import { cookies } from "next/headers"

type LoginData = {
  email: string
  password: string
}

type RegisterData = {
  name: string
  email: string
  password: string
}

export async function loginAction(data: LoginData, redirectTo: string = "/") {
  const { email, password } = data

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1)

  if (!user) {
    return { success: false, error: "Credenciales inválidas" }
  }

  // Google-only users can't login with password
  if (user.passwordHash === "__google_oauth__") {
    return { success: false, error: "Esta cuenta usa Google. Inicia sesión con el botón de Google." }
  }

  const valid = await compare(password, user.passwordHash)
  if (!valid) {
    return { success: false, error: "Credenciales inválidas" }
  }

  await createSession({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })

  // Fusionar carrito de invitado si existe
  const cookieStore = await cookies()
  const cartSessionId = cookieStore.get("cart_session")?.value
  if (cartSessionId) {
    await mergeGuestCartToUser(user.id, cartSessionId)
  }

  if (user.role === "admin") {
    redirect("/admin")
  } else {
    redirect(redirectTo)
  }
}

export async function registerAction(data: RegisterData, redirectTo: string = "/") {
  const { name, email, password } = data

  // Verificar si el usuario ya existe
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1)

  if (existing) {
    return { success: false, error: "El email ya está registrado" }
  }

  // Hash de la contraseña
  const passwordHash = await hash(password, 10)

  // Crear usuario
  const [user] = await db
    .insert(users)
    .values({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: "customer",
      loyaltyPoints: 0,
      memberSince: new Date().toISOString(),
    })
    .returning()

  // Crear sesión
  await createSession({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })

  // Fusionar carrito de invitado si existe
  const cookieStore = await cookies()
  const cartSessionId = cookieStore.get("cart_session")?.value
  if (cartSessionId) {
    await mergeGuestCartToUser(user.id, cartSessionId)
  }

  redirect(redirectTo)
}

export async function logoutAction() {
  await clearSession()
  redirect("/auth")
}
