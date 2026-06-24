"use server";

import { db } from "@/lib/db";
import { paymentMethods } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// 1. OBTENER LOS MÉTODOS DE PAGO DE UN USUARIO
export async function getUserPaymentMethods(userId: number) {
  try {
    const methods = await db
      .select()
      .from(paymentMethods)
      .where(eq(paymentMethods.userId, userId));
    return { success: true, data: methods };
  } catch (error) {
    console.error("Error al obtener métodos de pago:", error);
    return { success: false, error: "No se pudieron cargar los métodos de pago." };
  }
}

// 2. CREAR O REGISTRAR UN NUEVO MÉTODO DE PAGO
export async function createPaymentMethod(data: {
  userId: number;
  type: string;
  brand: string;
  last4: string;
  expiry: string;
  isDefault?: boolean;
}) {
  try {
    // Si se marca como predeterminado, quitamos el default a los anteriores
    if (data.isDefault) {
      await db
        .update(paymentMethods)
        .set({ isDefault: false })
        .where(eq(paymentMethods.userId, data.userId));
    }

    const [newMethod] = await db
      .insert(paymentMethods)
      .values({
        userId: data.userId,
        type: data.type,
        brand: data.brand,
        last4: data.last4,
        expiry: data.expiry,
        isDefault: data.isDefault || false,
      })
      .returning();

    revalidatePath("/carrito");
    return { success: true, data: newMethod };
  } catch (error) {
    console.error("Error al crear método de pago:", error);
    return { success: false, error: "No se pudo guardar el método de pago." };
  }
}

// 3. ELIMINAR UN MÉTODO DE PAGO
export async function deletePaymentMethod(methodId: number, userId: number) {
  try {
    await db
      .delete(paymentMethods)
      .where(and(eq(paymentMethods.id, methodId), eq(paymentMethods.userId, userId)));

    revalidatePath("/carrito");
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar método de pago:", error);
    return { success: false, error: "No se pudo eliminar el método de pago." };
  }
}

// 4. OBTENER MÉTODOS DE PAGO DISPONIBLES EN LA TIENDA (Para el Checkout)
export async function getAvailablePaymentMethods() {
  return [
    {
      id: "bancolombia",
      name: "Transferencia Bancolombia",
      description: "Paga desde tu app usando nuestro número de cuenta de ahorros.",
      icon: "credit-card",
    },
    {
      id: "efectivo",
      name: "Efectivo Contra Entrega",
      description: "Entrégale el dinero en efectivo al domiciliario al recibir tu pedido en Montería.",
      icon: "banknote",
    }
  ];
}