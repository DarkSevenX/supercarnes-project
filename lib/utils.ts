export const CATEGORIES = [
  "Res y Ternera",
  "Cerdo y Charcutería", 
  "Aves",
  "Cordero y Caza",
] as const;

export const CUT_TYPES = ["Bistec", "Asado", "Molida", "Costillas", "Tocino"] as const;

export const GRADES = ["A5 Wagyu", "USDA Prime", "Alimentado con Pasto"] as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  received: "Recibido",
  preparing: "En Preparación",
  in_transit: "En Camino",
  delivered: "Entregado",
};

export const ORDER_STATUS_BADGE: Record<string, string> = {
  received: "bg-surface-container-highest text-secondary",
  preparing: "bg-primary-fixed text-primary",
  in_transit: "bg-primary-fixed text-primary",
  delivered: "bg-surface-container-highest text-secondary",
};

export function formatMXN(amount: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(amount);
}

export function formatCOP(amount: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function parseBadges(badges: string | null): string[] {
  if (!badges) return [];
  try {
    return JSON.parse(badges) as string[];
  } catch {
    return [];
  }
}
