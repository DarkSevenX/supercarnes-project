"use server";

import { db } from "@/lib/db";
import { addresses } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// 1. OBTENER TODAS LAS DIRECCIONES DE UN USUARIO
export async function getUserAddresses(userId: number) {
  try {
    const userAddresses = await db
      .select()
      .from(addresses)
      .where(eq(addresses.userId, userId));
    return { success: true, data: userAddresses };
  } catch (error) {
    console.error("Error al obtener direcciones:", error);
    return { success: false, error: "No se pudieron cargar las direcciones." };
  }
}

// 2. CREAR UNA NUEVA DIRECCIÓN
export async function createAddress(data: {
  userId: number;
  label: string;
  street: string;
  city: string;
  state?: string;
  zip: string;
  isDefault?: boolean;
}) {
  try {
    // Si la nueva dirección se marca como predeterminada, quitamos el default a las anteriores
    if (data.isDefault) {
      await db
        .update(addresses)
        .set({ isDefault: false })
        .where(eq(addresses.userId, data.userId));
    }

    const [newAddress] = await db
      .insert(addresses)
      .values({
        userId: data.userId,
        label: data.label,
        street: data.street,
        city: data.city,
        state: data.state || "",
        zip: data.zip,
        country: "Colombia", // Cambiado dinámicamente para el negocio local
        isDefault: data.isDefault || false,
      })
      .returning();

    revalidatePath("/carrito"); // Revalida la ruta del checkout para que aparezca la nueva dirección
    return { success: true, data: newAddress };
  } catch (error) {
    console.error("Error al crear dirección:", error);
    return { success: false, error: "No se pudo guardar la dirección." };
  }
}

// 3. ACTUALIZAR UNA DIRECCIÓN EXISTENTE
export async function updateAddress(
  addressId: number,
  userId: number,
  data: Partial<typeof addresses.$inferInsert>
) {
  try {
    if (data.isDefault) {
      await db
        .update(addresses)
        .set({ isDefault: false })
        .where(eq(addresses.userId, userId));
    }

    await db
      .update(addresses)
      .set(data)
      .where(and(eq(addresses.id, addressId), eq(addresses.userId, userId)));

    revalidatePath("/carrito");
    return { success: true };
  } catch (error) {
    console.error("Error al actualizar dirección:", error);
    return { success: false, error: "No se pudo actualizar la dirección." };
  }
}

// 4. ELIMINAR UNA DIRECCIÓN
export async function deleteAddress(addressId: number, userId: number) {
  try {
    await db
      .delete(addresses)
      .where(and(eq(addresses.id, addressId), eq(addresses.userId, userId)));

    revalidatePath("/carrito");
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar dirección:", error);
    return { success: false, error: "No se pudo eliminar la dirección." };
  }
}