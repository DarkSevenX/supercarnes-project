"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// 1. OBTENER EL PERFIL COMPLETO DEL USUARIO
export async function getUserProfile(userId: number) {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    
    if (!user) {
      return { success: false, error: "Usuario no encontrado." };
    }

    return { success: true, data: user };
  } catch (error) {
    console.error("Error al obtener el perfil:", error);
    return { success: false, error: "No se pudo cargar el perfil del usuario." };
  }
}

// 2. ACTUALIZAR LOS DATOS DEL PERFIL 
export async function updateUserProfile(
  userId: number,
  data: {
    name?: string;
    avatarUrl?: string; // Se cambió 'image' por 'avatarUrl' según tu schema
  }
) {
  try {
    await db
      .update(users)
      .set({
        name: data.name,
        avatarUrl: data.avatarUrl,
      })
      .where(eq(users.id, userId));

    revalidatePath("/perfil");
    revalidatePath("/carrito");
    
    return { success: true };
  } catch (error) {
    console.error("Error al actualizar el perfil:", error);
    return { success: false, error: "No se pudieron guardar los cambios del perfil." };
  }
}