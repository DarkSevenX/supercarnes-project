"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatCOP } from "@/lib/utils";
import MaterialIcon from "./MaterialIcon";

type CartItem = {
  id: number;
  quantity: number;
  productId: number;
  name: string;
  price: number;
  priceUnit: string;
  imageUrl: string;
  subcategory: string | null;
  badges: string | null;
  category: string;
};

type CartCheckoutProps = {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
};

export default function CartCheckout({
  items,
  subtotal,
  shipping,
  total,
}: CartCheckoutProps) {
  const router = useRouter();
  const [step, setStep] = useState<"shipping" | "payment" | "review">("shipping");
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    zip: "",
    phone: "",
  });

  const updateQuantity = async (id: number, quantity: number) => {
    if (quantity < 1) return;
    await fetch(`/api/cart/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
    router.refresh();
  };

  const removeItem = async (id: number) => {
    await fetch(`/api/cart/${id}`, { method: "DELETE" });
    router.refresh();
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          paymentMethod,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push(`/pedido/${data.orderId}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const badgeLabel = (item: CartItem) => {
    if (item.badges) {
      try {
        const parsed = JSON.parse(item.badges) as string[];
        if (parsed[0]) return parsed[0];
      } catch {
        /* ignore */
      }
    }
    return item.category;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-xl mt-xl">
      <section className="lg:w-7/12 space-y-lg">
        <h1 className="font-headline-lg text-headline-lg mb-md">
          Tu Carrito
        </h1>
        <div className="space-y-md">
          {items.length === 0 ? (
            <p className="text-secondary text-body-md">
              Tu carrito está vacío.{" "}
              <Link href="/" className="text-primary underline">
                Explorar productos
              </Link>
            </p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="bg-surface-container-lowest p-md rounded-lg flex gap-md shadow-sm border border-surface-container"
              >
                <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    className="w-full h-full object-cover"
                    src={item.imageUrl}
                    alt={item.name}
                    width={96}
                    height={96}
                    unoptimized
                  />
                </div>
                <div className="flex-grow flex flex-col justify-between">
                  <div className="flex justify-between">
                    <div>
                      <span className="text-[10px] font-label-md uppercase text-primary tracking-widest">
                        {badgeLabel(item)}
                      </span>
                      <h3 className="font-headline-md text-headline-md mt-1">
                        {item.name}
                      </h3>
                    </div>
                    <p className="font-bold text-primary">
                      {formatCOP(item.price * item.quantity)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-sm">
                    <div className="flex items-center border border-outline rounded-md">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-3 py-1 hover:bg-surface-variant transition-colors"
                      >
                        <MaterialIcon name="remove" className="text-sm" />
                      </button>
                      <span className="px-4 font-bold">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-3 py-1 hover:bg-surface-variant transition-colors"
                      >
                        <MaterialIcon name="add" className="text-sm" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-secondary hover:text-error transition-colors flex items-center gap-1"
                    >
                      <MaterialIcon name="delete" className="text-md" />
                      <span className="text-caption">Eliminar</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="pt-lg border-t border-surface-container-highest space-y-sm">
            <div className="flex justify-between text-secondary">
              <p>Subtotal</p>
              <p>{formatCOP(subtotal)}</p>
            </div>
            <div className="flex justify-between text-secondary">
              <p>Envío Gourmet</p>
              <p>{formatCOP(shipping)}</p>
            </div>
            <div className="flex justify-between text-headline-md font-bold text-on-surface pt-md">
              <p>Total</p>
              <p>{formatCOP(total)}</p>
            </div>
          </div>
        )}
      </section>

      <section className="lg:w-5/12">
        <div className="bg-surface-container-lowest p-lg rounded-xl shadow-lg border border-surface-container">
          <div className="flex justify-between mb-xl border-b border-surface-container pb-md">
            <button
              type="button"
              onClick={() => setStep("shipping")}
              className={`text-caption tracking-widest uppercase ${
                step === "shipping" ? "step-active" : "text-secondary hover:text-primary transition-colors"
              }`}
            >
              1. Envío
            </button>
            <button
              type="button"
              onClick={() => setStep("payment")}
              className={`text-caption tracking-widest uppercase ${
                step === "payment" ? "step-active" : "text-secondary hover:text-primary transition-colors"
              }`}
            >
              2. Pago
            </button>
            <button
              type="button"
              onClick={() => setStep("review")}
              className={`text-caption tracking-widest uppercase ${
                step === "review" ? "step-active" : "text-secondary hover:text-primary transition-colors"
              }`}
            >
              3. Revisión
            </button>
          </div>

          <form className="space-y-lg" onSubmit={handleCheckout}>
            <div className="space-y-md">
              <h2 className="font-headline-md text-headline-md text-primary">
                Detalles de Entrega
              </h2>
              <div className="grid grid-cols-2 gap-md">
                <div>
                  <label className="text-caption font-label-md text-secondary block mb-1">
                    Nombre
                  </label>
                  <input
                    className="checkout-input"
                    placeholder="Juan"
                    type="text"
                    value={form.firstName}
                    onChange={(e) =>
                      setForm({ ...form, firstName: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="text-caption font-label-md text-secondary block mb-1">
                    Apellido
                  </label>
                  <input
                    className="checkout-input"
                    placeholder="Pérez"
                    type="text"
                    value={form.lastName}
                    onChange={(e) =>
                      setForm({ ...form, lastName: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-caption font-label-md text-secondary block mb-1">
                  Dirección de Entrega
                </label>
                <input
                  className="checkout-input"
                  placeholder="Av. Paseo de la Reforma 123"
                  type="text"
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-md">
                <div>
                  <label className="text-caption font-label-md text-secondary block mb-1">
                    Ciudad
                  </label>
                  <input
                    className="checkout-input"
                    placeholder="CDMX"
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-caption font-label-md text-secondary block mb-1">
                    Código Postal
                  </label>
                  <input
                    className="checkout-input"
                    placeholder="01234"
                    type="text"
                    value={form.zip}
                    onChange={(e) => setForm({ ...form, zip: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-caption font-label-md text-secondary block mb-1">
                  Teléfono
                </label>
                <input
                  className="checkout-input"
                  placeholder="+52 55 1234 5678"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-md pt-md border-t border-surface-container">
              <h3 className="font-label-md text-secondary uppercase tracking-widest">
                Método de Pago
              </h3>
              <div className="flex flex-col gap-sm">
                <label className="flex items-center gap-md p-md border border-outline-variant rounded-lg cursor-pointer hover:bg-surface-container transition-colors">
                  <input
                    checked={paymentMethod === "card"}
                    onChange={() => setPaymentMethod("card")}
                    className="w-4 h-4 text-primary focus:ring-primary rounded-sm"
                    name="payment"
                    type="radio"
                  />
                  <span className="flex-grow font-bold">
                    Tarjeta de Crédito / Débito
                  </span>
                  <MaterialIcon name="credit_card" className="text-secondary" />
                </label>
                <label className="flex items-center gap-md p-md border border-outline-variant rounded-lg cursor-pointer hover:bg-surface-container transition-colors">
                  <input
                    checked={paymentMethod === "spei"}
                    onChange={() => setPaymentMethod("spei")}
                    className="w-4 h-4 text-primary focus:ring-primary rounded-sm"
                    name="payment"
                    type="radio"
                  />
                  <span className="flex-grow font-bold">Transferencia SPEI</span>
                  <MaterialIcon name="account_balance" className="text-secondary" />
                </label>
              </div>
            </div>

            <div className="pt-lg">
              <button
                type="submit"
                disabled={loading || items.length === 0}
                className="w-full bg-primary text-on-primary py-4 rounded-lg font-bold text-lg hover:bg-primary-container transition-all active:scale-95 shadow-md disabled:opacity-50"
              >
                Pagar Ahora ({formatCOP(total)})
              </button>
              <p className="text-[10px] text-center text-secondary mt-md flex items-center justify-center gap-2">
                <MaterialIcon name="lock" className="text-xs" fill />
                Transacción Encriptada y Segura SSL
              </p>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
