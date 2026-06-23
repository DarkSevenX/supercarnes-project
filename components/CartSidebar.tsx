"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import MaterialIcon from "./MaterialIcon";
import { getCartItemsAction, updateCartItem, removeCartItem } from "@/lib/actions/cart-actions";
import { createOrder } from "@/lib/actions/order-actions";
import { formatCOP } from "@/lib/utils";

type CartSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Vista actual del Sidebar: carrito o pago
  const [view, setView] = useState<"cart" | "checkout">("cart");

  // Estados para el Checkout integrado
  const [isProductsExpanded, setIsProductsExpanded] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"transferencia" | "efectivo">("transferencia");
  const [cashAmount, setCashAmount] = useState<string>("");
  
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "Montería",
    zip: "230001",
    phone: "",
  });

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      // Reiniciamos a vista carrito cada vez que abre
      setView("cart");
      
      getCartItemsAction()
        .then((data) => {
          setItems(data);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen]);

  const handleUpdateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    startTransition(async () => {
      const res = await updateCartItem(itemId, newQuantity);
      if (res.success) {
        setItems(items.map(item => item.id === itemId ? { ...item, quantity: newQuantity } : item));
        router.refresh();
      } else {
        alert(res.error || "Error al actualizar");
      }
    });
  };

  const handleRemove = (itemId: number) => {
    startTransition(async () => {
      const res = await removeCartItem(itemId);
      if (res.success) {
        setItems(items.filter(item => item.id !== itemId));
        router.refresh();
      } else {
        alert("Error al eliminar");
      }
    });
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  // cashAmount stores only raw digits (e.g. "40000")
  const cashAmountNum = cashAmount ? parseInt(cashAmount, 10) : 0;
  const cambio = cashAmountNum > total ? cashAmountNum - total : 0;

  const handleCheckout = () => {
    if (!form.firstName || !form.lastName || !form.address || !form.phone) {
      alert("Por favor, completa todos los detalles de entrega.");
      return;
    }
    if (paymentMethod === "efectivo" && cashAmountNum < total) {
      alert("El monto ingresado en efectivo debe ser mayor o igual al total a pagar.");
      return;
    }

    startTransition(async () => {
      const result = await createOrder({
        ...form,
        paymentMethod,
      });
      if (result && !result.success) {
        if (result.error === "Debe iniciar sesión") {
          router.push("/auth?redirect=/");
          onClose();
        } else {
          alert(result.error);
        }
      } else {
        onClose();
      }
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-on-surface/50 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed top-0 right-0 h-full w-full max-w-[500px] bg-surface shadow-2xl z-50 flex flex-col animate-slide-in-right border-l border-surface-container-highest">
        
        {/* Encabezado Principal */}
        <div className="flex justify-between items-center p-md border-b border-surface-container-highest">
          {view === "cart" ? (
            <h2 className="font-body-lg text-headline-md text-on-surface font-bold flex items-center gap-sm">
              <MaterialIcon name="shopping_cart" /> Tu Carrito
            </h2>
          ) : (
            <div className="flex items-center gap-sm">
              <button 
                onClick={() => setView("cart")}
                className="p-xs hover:bg-surface-container rounded-full text-secondary hover:text-primary transition-colors"
              >
                <MaterialIcon name="arrow_back" className="text-2xl" />
              </button>
            </div>
          )}
          <div className="flex items-center gap-md">
            {view === "checkout" && (
              <span className="font-body-lg text-headline-md font-bold text-primary">{formatCOP(total)}</span>
            )}
            <button
              onClick={onClose}
              className="p-xs hover:bg-surface-container rounded-full text-secondary hover:text-primary transition-colors"
            >
              <MaterialIcon name="close" className="text-2xl" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-md space-y-lg">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <span className="text-secondary">Cargando...</span>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-secondary opacity-50 py-20">
              <MaterialIcon name="shopping_bag" className="mb-6" style={{ fontSize: "180px" }} />
              <p className="font-body-lg text-2xl font-bold text-center">Tu carrito está vacío</p>
            </div>
          ) : view === "cart" ? (
            /* ================= VISTA 1: CARRITO ================= */
            <div className="space-y-md">
              {items.map((item) => (
                <div key={item.id} className="flex gap-sm p-sm bg-surface-container-lowest rounded-lg border border-surface-container">
                  <div className="relative w-20 h-20 bg-surface-container rounded overflow-hidden flex-shrink-0">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.name} fill className="object-cover" unoptimized />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-surface-container text-secondary">
                        <MaterialIcon name="image" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-body-md font-bold text-on-surface line-clamp-1">{item.name}</h4>
                        <p className="text-caption text-secondary">{formatCOP(item.price)} / {item.priceUnit}</p>
                      </div>
                      <button
                        onClick={() => handleRemove(item.id)}
                        disabled={isPending}
                        className="text-secondary hover:text-error transition-colors p-1"
                      >
                        <MaterialIcon name="delete" className="text-[18px]" />
                      </button>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center gap-2 bg-surface-container rounded-full px-2 py-1">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={isPending || item.quantity <= 1}
                          className="text-on-surface hover:text-primary disabled:opacity-50"
                        >
                          <MaterialIcon name="remove" className="text-[16px]" />
                        </button>
                        <span className="text-body-md font-bold w-6 text-center select-none">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={isPending}
                          className="text-on-surface hover:text-primary disabled:opacity-50"
                        >
                          <MaterialIcon name="add" className="text-[16px]" />
                        </button>
                      </div>
                      <span className="font-bold text-primary">{formatCOP(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* ================= VISTA 2: CHECKOUT ================= */
            <>
              {/* Acordeón de Productos */}
              <div className="border border-surface-container rounded-lg overflow-hidden">
                <button
                  onClick={() => setIsProductsExpanded(!isProductsExpanded)}
                  className="w-full flex justify-between items-center p-md bg-surface-container-low hover:bg-surface-container transition-colors"
                >
                  <span className="font-bold text-on-surface flex items-center gap-2">
                    <MaterialIcon name="shopping_cart" className="text-[20px]" />
                    {items.length} {items.length === 1 ? "Producto" : "Productos"}
                  </span>
                  <MaterialIcon name={isProductsExpanded ? "expand_less" : "expand_more"} />
                </button>
                
                {isProductsExpanded && (
                  <div className="p-sm bg-surface-container-lowest space-y-sm max-h-[40vh] overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-sm p-sm border border-surface-container rounded-lg">
                        <div className="relative w-16 h-16 bg-surface-container rounded overflow-hidden flex-shrink-0">
                          {item.imageUrl ? (
                            <Image src={item.imageUrl} alt={item.name} fill className="object-cover" unoptimized />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-surface-container text-secondary">
                              <MaterialIcon name="image" className="text-[20px]" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-body-md font-bold text-on-surface line-clamp-1">{item.name}</h4>
                              <p className="text-caption text-secondary">{formatCOP(item.price)} / {item.priceUnit}</p>
                            </div>
                            <button
                              onClick={() => handleRemove(item.id)}
                              disabled={isPending}
                              className="text-secondary hover:text-error transition-colors p-1"
                            >
                              <MaterialIcon name="delete" className="text-[16px]" />
                            </button>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <div className="flex items-center gap-2 bg-surface-container rounded-full px-2 py-1">
                              <button
                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                disabled={isPending || item.quantity <= 1}
                                className="text-on-surface hover:text-primary disabled:opacity-50"
                              >
                                <MaterialIcon name="remove" className="text-[14px]" />
                              </button>
                              <span className="text-caption font-bold w-4 text-center select-none">{item.quantity}</span>
                              <button
                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                disabled={isPending}
                                className="text-on-surface hover:text-primary disabled:opacity-50"
                              >
                                <MaterialIcon name="add" className="text-[14px]" />
                              </button>
                            </div>
                            <span className="font-bold text-primary text-body-md">{formatCOP(item.price * item.quantity)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Formulario de Envío Integrado */}
              <div className="space-y-md">
                <h3 className="text-sm font-bold text-on-surface border-b border-surface-container pb-1">
                  Detalles de Entrega
                </h3>
                
                <div className="grid grid-cols-2 gap-md">
                  <div>
                    <label className="text-caption font-bold text-secondary block mb-1">Nombre</label>
                    <input
                      type="text"
                      className="checkout-input"
                      placeholder="Juan"
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-caption font-bold text-secondary block mb-1">Apellido</label>
                    <input
                      type="text"
                      className="checkout-input"
                      placeholder="Pérez"
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-caption font-bold text-secondary block mb-1">Dirección de Entrega</label>
                  <input
                    type="text"
                    className="checkout-input"
                    placeholder="Calle 30 # 4-50"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-md">
                  <div>
                    <label className="text-caption font-bold text-secondary block mb-1">Ciudad</label>
                    <input
                      type="text"
                      className="checkout-input bg-surface-container text-secondary"
                      value={form.city}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="text-caption font-bold text-secondary block mb-1">Teléfono</label>
                    <input
                      type="tel"
                      className="checkout-input"
                      placeholder="300 123 4567"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Métodos de Pago */}
              <div className="space-y-md">
                <h3 className="text-sm font-bold text-on-surface border-b border-surface-container pb-1">
                  Métodos de pago
                </h3>
                <div className="flex flex-col gap-sm">
                  <label className={`flex items-center gap-sm p-sm border rounded-lg cursor-pointer transition-colors text-sm ${paymentMethod === "transferencia" ? "border-primary bg-primary/5" : "border-surface-container bg-surface-container-lowest"}`}>
                    <input
                      checked={paymentMethod === "transferencia"}
                      onChange={() => setPaymentMethod("transferencia")}
                      className="w-4 h-4 text-primary focus:ring-primary rounded-full"
                      name="paymentMethod"
                      type="radio"
                    />
                    <span className={`flex-grow font-bold text-sm ${paymentMethod === "transferencia" ? "text-primary" : "text-on-surface"}`}>
                      Transferencia
                    </span>
                    <MaterialIcon name="account_balance" className={`text-[18px] ${paymentMethod === "transferencia" ? "text-primary" : "text-secondary"}`} />
                  </label>
                  
                  <label className={`flex items-center gap-sm p-sm border rounded-lg cursor-pointer transition-colors text-sm ${paymentMethod === "efectivo" ? "border-primary bg-primary/5" : "border-surface-container bg-surface-container-lowest"}`}>
                    <input
                      checked={paymentMethod === "efectivo"}
                      onChange={() => setPaymentMethod("efectivo")}
                      className="w-4 h-4 text-primary focus:ring-primary rounded-full"
                      name="paymentMethod"
                      type="radio"
                    />
                    <span className={`flex-grow font-bold text-sm ${paymentMethod === "efectivo" ? "text-primary" : "text-on-surface"}`}>
                      Efectivo
                    </span>
                    <MaterialIcon name="payments" className={`text-[18px] ${paymentMethod === "efectivo" ? "text-primary" : "text-secondary"}`} />
                  </label>
                </div>

                {paymentMethod === "efectivo" && (
                  <div className="bg-surface-container-lowest p-md border border-surface-container rounded-lg space-y-md mt-sm">
                    <div className="border-b border-surface-container pb-sm mb-sm">
                      <h4 className="font-bold text-primary flex items-center gap-2">
                        <MaterialIcon name="info" className="text-[18px]" />
                        Información de pago
                      </h4>
                      <p className="text-body-sm text-secondary mt-1">Paga con Efectivo al Recibir</p>
                    </div>
                    
                    <div>
                      <label className="text-caption font-bold text-secondary block mb-1">
                        * Ingresa con cuánto vas a pagar
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        className="checkout-input"
                        placeholder="Ej. 800.000"
                        value={cashAmount ? parseInt(cashAmount, 10).toLocaleString("es-CO") : ""}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, "");
                          setCashAmount(raw);
                        }}
                      />
                      {cashAmount && cashAmountNum < total && (
                        <p className="text-caption text-error mt-1">
                          Debe ser igual a <span className="font-bold">{formatCOP(total)}</span> o mayor
                        </p>
                      )}
                    </div>

                    <div className="space-y-sm pt-sm">
                      <div className="flex justify-between items-center text-secondary">
                        <span>Cambio:</span>
                        <span className="font-bold">{formatCOP(cambio)}</span>
                      </div>
                      <div className="flex justify-between items-center text-on-surface border-t border-surface-container pt-sm">
                        <span className="font-bold">Total:</span>
                        <span className="font-bold text-sm text-primary">{formatCOP(total)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {!isLoading && items.length > 0 && (
          <div className="border-t border-surface-container-highest p-md bg-surface-container-lowest shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
            {view === "cart" ? (
              <>
                <div className="flex justify-between items-center mb-md">
                  <span className="font-body-lg text-secondary">Subtotal:</span>
                  <span className="font-body-lg text-headline-md font-bold text-on-surface">{formatCOP(total)}</span>
                </div>
                <button
                  onClick={() => setView("checkout")}
                  className="w-full py-3 bg-primary text-on-primary rounded-xl font-label-md font-bold hover:bg-primary-container hover:text-on-primary-container transition-colors flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <MaterialIcon name="shopping_bag" /> Ir a Pagar
                </button>
              </>
            ) : (
              <button
                onClick={handleCheckout}
                disabled={isPending}
                className="w-full py-3 bg-primary text-on-primary rounded-xl font-label-md font-bold hover:bg-primary-container hover:text-on-primary-container transition-colors flex items-center justify-center gap-2 active:scale-[0.98] disabled:bg-surface-container-highest disabled:text-secondary disabled:cursor-not-allowed"
              >
                {isPending ? "Procesando..." : "Finalizar compra"}
              </button>
            )}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />
    </>
  );
}
