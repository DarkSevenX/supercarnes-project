"use client";

import Image from "next/image";
import Link from "next/link";
import { useTransition } from "react";
import { formatCOP, ORDER_STATUS_BADGE, ORDER_STATUS_LABELS } from "@/lib/utils";
import { logoutAction } from "@/lib/actions/auth-actions";
import MaterialIcon from "./MaterialIcon";

type ProfileUser = {
  name: string;
  email: string;
  avatarUrl: string | null;
  memberSince: string;
  loyaltyPoints: number;
};

type ProfileOrder = {
  id: number;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  itemCount: number;
  imageUrl: string | null;
};

type ProfileAddress = {
  id: number;
  label: string;
  street: string;
  city: string;
  state: string | null;
  zip: string;
  country: string;
  isDefault: boolean;
};

type ProfilePayment = {
  id: number;
  brand: string;
  last4: string;
  expiry: string;
};

type ProfileContentProps = {
  user: ProfileUser;
  orders: ProfileOrder[];
  addresses: ProfileAddress[];
  payments: ProfilePayment[];
};

export default function ProfileContent({
  user,
  orders,
  addresses,
  payments,
}: ProfileContentProps) {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-MX", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
      <aside className="lg:col-span-4 flex flex-col gap-lg">
        <div className="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-outline-variant/30 text-center lg:text-left">
          <div className="relative w-32 h-32 mx-auto lg:mx-0 mb-md">
            {user.avatarUrl ? (
              <Image
                alt="Avatar"
                className="w-full h-full rounded-full object-cover border-4 border-primary-fixed shadow-md"
                src={user.avatarUrl}
                width={128}
                height={128}
                unoptimized
              />
            ) : (
              <div className="w-full h-full rounded-full border-4 border-primary-fixed shadow-md bg-surface-container-high flex items-center justify-center text-primary overflow-hidden">
                <span className="text-[64px] uppercase font-bold tracking-widest pl-1">
                  {user.name ? user.name.charAt(0) : "U"}
                </span>
              </div>
            )}
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-1 right-1 bg-primary text-white w-8 h-8 flex items-center justify-center rounded-full shadow-lg hover:bg-on-primary-fixed-variant transition-colors cursor-pointer"
              title="Cambiar foto de perfil"
            >
              <MaterialIcon name="edit" className="text-[16px]" />
              <input 
                type="file" 
                id="avatar-upload" 
                className="hidden" 
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // Muestra una alerta temporal, aquí se conectará la lógica de subida en el futuro
                    alert("Foto seleccionada: " + file.name + "\n(La subida de imagen aún no está conectada al servidor)");
                  }
                }}
              />
            </label>
          </div>
          <h1 className="text-headline-md font-headline-md text-on-surface mb-xs">
            {user.name}
          </h1>
          <p className="text-secondary font-body-md mb-md">{user.email}</p>
          <div className="flex flex-col gap-sm border-t border-outline-variant pt-md">
            <div className="flex items-center gap-sm text-on-surface-variant">
              <MaterialIcon name="shopping_bag" className="text-primary" />
              <span className="text-label-md font-label-md">
                {orders.length} {orders.length === 1 ? "Pedido realizado" : "Pedidos realizados"}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isPending}
            className="mt-xl w-full flex items-center justify-center gap-sm py-md px-lg text-primary border border-primary rounded-lg hover:bg-primary-fixed transition-colors font-label-md uppercase tracking-wider disabled:opacity-50"
          >
            <MaterialIcon name="logout" />
            {isPending ? "Cerrando..." : "Cerrar Sesión"}
          </button>
        </div>

        <div className="hidden lg:flex bg-surface-container p-lg rounded-xl flex-col gap-md">
          <h3 className="text-label-md font-label-md text-on-surface-variant uppercase">
            Atención Personalizada
          </h3>
          <p className="text-caption text-secondary">
            ¿Necesitas ayuda con un producto específico o pedido especial?
          </p>
          <button
            type="button"
            className="bg-on-surface text-white py-sm px-md rounded-lg text-label-md font-label-md hover:opacity-90 transition-opacity"
          >
            Contactar Asesor
          </button>
        </div>
      </aside>

      <section className="lg:col-span-8 flex flex-col gap-xl">
        <div className="space-y-md">
          <div className="flex justify-between items-end">
            <h2 className="text-xl font-bold text-on-surface">
              Mis Pedidos
            </h2>
            <a className="text-primary text-label-md font-label-md hover:underline" href="#">
              Ver Historial
            </a>
          </div>
          <div className="grid gap-md">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-surface-container-lowest p-md lg:p-lg rounded-xl shadow-sm border border-outline-variant/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-md"
              >
                <div className="flex gap-md items-center">
                  <div className="w-16 h-16 bg-surface-container-high rounded-lg flex items-center justify-center overflow-hidden">
                    {order.imageUrl && (
                      <Image
                        alt="Producto"
                        className="w-full h-full object-cover"
                        src={order.imageUrl}
                        width={64}
                        height={64}
                        unoptimized
                      />
                    )}
                  </div>
                  <div>
                    <p className="text-label-md font-label-md text-on-surface">
                      Pedido #{order.orderNumber}
                    </p>
                    <p className="text-caption text-secondary">
                      {formatDate(order.createdAt)} • {order.itemCount} artículos
                    </p>
                    <p
                      className={`font-bold mt-1 ${
                        order.status === "delivered"
                          ? "text-secondary"
                          : "text-primary"
                      }`}
                    >
                      {formatCOP(order.total)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-sm w-full md:w-auto">
                  <span
                    className={`px-sm py-1 rounded-full text-caption font-bold ${
                      ORDER_STATUS_BADGE[order.status] ??
                      "bg-surface-container-highest text-secondary"
                    }`}
                  >
                    {ORDER_STATUS_LABELS[order.status] ?? order.status}
                  </span>
                  {order.status === "in_transit" ? (
                    <Link
                      href={`/pedido/${order.id}`}
                      className="text-secondary hover:text-on-surface transition-colors flex items-center gap-1 text-label-md font-label-md"
                    >
                      Rastrear Pedido{" "}
                      <MaterialIcon name="chevron_right" className="text-[18px]" />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className="text-primary hover:text-on-primary-fixed-variant transition-colors flex items-center gap-1 text-label-md font-label-md"
                    >
                      Comprar de nuevo{" "}
                      <MaterialIcon name="replay" className="text-[18px]" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          <div className="space-y-md">
            <div className="flex justify-between items-end">
              <h2 className="text-lg font-bold text-on-surface">
                Direcciones
              </h2>
              <button
                type="button"
                className="text-primary text-label-md font-label-md flex items-center gap-1"
              >
                <MaterialIcon name="add" className="text-[18px]" /> Añadir
              </button>
            </div>
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`bg-surface-container-lowest p-md rounded-xl shadow-sm relative ${
                  addr.isDefault
                    ? "border-2 border-primary"
                    : "border border-outline-variant/30"
                }`}
              >
                {addr.isDefault && (
                  <div className="absolute top-3 right-3 text-primary">
                    <MaterialIcon name="check_circle" fill />
                  </div>
                )}
                <p className="text-label-md font-label-md text-on-surface mb-1">
                  {addr.label}
                </p>
                <p className="text-caption text-secondary">
                  {addr.street}
                  <br />
                  {addr.state ? `${addr.state}, ` : ""}CP {addr.zip}
                  <br />
                  {addr.city}, {addr.country}
                </p>
                <div className="mt-md flex gap-md">
                  <button
                    type="button"
                    className="text-secondary hover:text-on-surface text-caption font-bold underline"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="text-error/70 hover:text-error text-caption font-bold underline"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-md">
            <div className="flex justify-between items-end">
              <h2 className="text-lg font-bold text-on-surface">
                Pagos
              </h2>
              <button
                type="button"
                className="text-primary text-label-md font-label-md flex items-center gap-1"
              >
                <MaterialIcon name="add" className="text-[18px]" /> Añadir
              </button>
            </div>
            {payments.map((pm) => (
              <div
                key={pm.id}
                className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant/30 shadow-sm"
              >
                <div className="flex items-center gap-md mb-md">
                  <div className="w-12 h-8 bg-on-surface rounded flex items-center justify-center">
                    <span className="text-white font-bold italic text-[10px]">
                      {pm.brand}
                    </span>
                  </div>
                  <div>
                    <p className="text-label-md font-label-md text-on-surface">
                      •••• •••• •••• {pm.last4}
                    </p>
                    <p className="text-caption text-secondary">
                      Expira {pm.expiry}
                    </p>
                  </div>
                </div>
                <div className="flex gap-md">
                  <button
                    type="button"
                    className="text-secondary hover:text-on-surface text-caption font-bold underline"
                  >
                    Gestionar
                  </button>
                  <button
                    type="button"
                    className="text-error/70 hover:text-error text-caption font-bold underline"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden bg-primary p-lg rounded-xl text-white flex-col md:flex-row justify-between items-center gap-lg">
          <div>
            <h3 className="text-headline-md font-headline-md mb-xs">
              Ofertas Exclusivas
            </h3>
            <p className="text-body-md opacity-90">
              Recibe notificaciones sobre productos exclusivos y ediciones limitadas.
            </p>
          </div>
          <button
            type="button"
            className="bg-white text-primary px-lg py-md rounded-lg font-label-md hover:bg-primary-fixed transition-colors"
          >
            Configurar
          </button>
        </div>
      </section>
    </div>
  );
}
