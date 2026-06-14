"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatCOP, ORDER_STATUS_LABELS } from "@/lib/utils";
import Footer from "./Footer";
import MaterialIcon from "./MaterialIcon";
import TopNavBar from "./TopNavBar";

type TimelineStep = {
  status: string;
  label: string;
  time: string;
};

type OrderItem = {
  id: number;
  productName: string;
  productImage: string | null;
  quantity: number;
  unitPrice: number;
  detail: string | null;
};

type OrderData = {
  id: number;
  orderNumber: string;
  status: string;
  subtotal: number;
  shipping: number;
  total: number;
  deliveryNotes: string | null;
  contactPhone: string | null;
  driverName: string | null;
  driverVehicle: string | null;
  driverDistance: string | null;
  estimatedDelivery: string | null;
  mapImageUrl: string | null;
  statusTimeline: TimelineStep[];
  shippingAddress: {
    street?: string;
    city?: string;
    zip?: string;
  };
  items: OrderItem[];
};

const STATUS_ORDER = ["received", "preparing", "in_transit", "delivered"];

function progressWidth(status: string) {
  const idx = STATUS_ORDER.indexOf(status);
  if (idx <= 0) return "0%";
  if (idx >= STATUS_ORDER.length - 1) return "100%";
  return `${(idx / (STATUS_ORDER.length - 1)) * 100}%`;
}

export default function OrderTracking({ order }: { order: OrderData }) {
  const [fillWidth, setFillWidth] = useState("0%");

  useEffect(() => {
    const t = setTimeout(() => setFillWidth(progressWidth(order.status)), 500);
    return () => clearTimeout(t);
  }, [order.status]);

  const currentIdx = STATUS_ORDER.indexOf(order.status);

  return (
    <>
      <TopNavBar variant="tracking" activeLink="shop" />
      <main className="pt-32 pb-24 px-lg max-w-container-max mx-auto">
        <div className="mb-xl text-center md:text-left">
          <span className="font-label-md text-label-md uppercase tracking-widest text-primary mb-sm block">
            Seguimiento en Tiempo Real
          </span>
          <h1 className="font-headline-lg text-headline-lg md:text-display-lg text-on-surface mb-md">
            Tu pedido está en camino
          </h1>
          <p className="font-body-lg text-body-lg text-secondary max-w-2xl">
            Estamos llevando la mejor selección artesanal de cortes premium
            directamente a tu puerta. Prepárate para una experiencia culinaria
            superior.
          </p>
        </div>

        <section className="bg-surface-container-lowest rounded-xl p-xl shadow-sm mb-xl relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-4 gap-sm">
            {STATUS_ORDER.map((status, idx) => {
              const step = order.statusTimeline.find((s) => s.status === status);
              const active = idx <= currentIdx;
              const current = status === order.status;
              return (
                <div
                  key={status}
                  className={`flex flex-col items-center text-center gap-md ${!active && status === "delivered" ? "opacity-40" : ""}`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white ring-8 ring-primary-container/20 ${
                      active
                        ? `bg-primary ${current ? "animate-pulse" : ""}`
                        : "bg-surface-container-highest text-secondary"
                    }`}
                  >
                    <MaterialIcon
                      name={
                        status === "received"
                          ? "receipt_long"
                          : status === "preparing"
                            ? "restaurant"
                            : status === "in_transit"
                              ? "delivery_dining"
                              : "check_circle"
                      }
                      fill={active}
                    />
                  </div>
                  <div>
                    <p
                      className={`font-label-md text-label-md ${active ? "text-primary" : "text-secondary"} ${current ? "font-bold" : ""}`}
                    >
                      {step?.label ?? ORDER_STATUS_LABELS[status]}
                    </p>
                    <p
                      className={`font-caption text-caption ${current ? "text-primary" : "text-secondary"}`}
                    >
                      {step?.time ?? ""}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="progress-line mx-24" />
          <div
            className="progress-fill mx-24"
            style={{ width: fillWidth }}
          />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
          <div className="lg:col-span-8 flex flex-col gap-lg">
            <div className="bg-surface-container-highest rounded-xl overflow-hidden aspect-video relative shadow-sm group">
              <Image
                className="w-full h-full object-cover grayscale-[20%] group-hover:scale-105 transition-transform duration-700"
                src={
                  order.mapImageUrl ??
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuB2_ANdbZ4HIHCEVmL70zXzA9SFNOYyRNsVyOoWGG7Wi4Z3FaZaIRb6UgaIFYqdEcHNIZ2uF766-ds58P9sqsfCJT4EPHr55V1Du6CkTtHfauMawLi1arOEpjL-m5WQyeZU3l72_QaI_D6nxPrvXdSkrDsH2ruXIJKMJjzCfgmlL-wfokzVSfVQsg_q-cEqznmf0odfaViTEVXFjUdyfcazO0grs9_vnXkkRiioq48bjb2rJNqzCaaDis9IhFTWXEkqjeFPZO9_0N0"
                }
                alt="Mapa de entrega"
                width={1200}
                height={675}
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
              <div className="absolute bottom-md left-md right-md bg-surface/95 backdrop-blur-md p-md rounded-lg shadow-xl flex flex-wrap items-center justify-between gap-md border border-white/20">
                <div className="flex items-center gap-md">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white">
                    <MaterialIcon name="person_pin_circle" />
                  </div>
                  <div>
                    <h4 className="font-headline-md text-headline-md text-on-surface">
                      Repartidor: {order.driverName ?? "Carlos Mendoza"}
                    </h4>
                    <p className="font-body-md text-body-md text-secondary">
                      {order.driverVehicle ?? "En motocicleta"} • Distancia:{" "}
                      {order.driverDistance ?? "1.2 km"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-label-md text-label-md text-primary uppercase">
                    Entrega Estimada
                  </span>
                  <span className="font-headline-lg text-headline-lg text-on-surface">
                    {order.estimatedDelivery ?? "11:25 AM"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-lg shadow-sm border border-surface-container-high">
              <div className="flex justify-between items-center mb-lg border-b border-surface-container pb-md">
                <h3 className="font-headline-md text-headline-md text-on-surface">
                  Resumen de Pedido #{order.orderNumber}
                </h3>
                <span className="font-label-md text-label-md px-md py-sm bg-primary-container/10 text-primary rounded-full">
                  Procesado
                </span>
              </div>
              <ul className="flex flex-col gap-md">
                {order.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex justify-between items-center py-sm border-b border-surface-container/50 last:border-0"
                  >
                    <div className="flex items-center gap-md">
                      <div className="w-16 h-16 rounded overflow-hidden bg-surface-container">
                        {item.productImage && (
                          <Image
                            className="w-full h-full object-cover"
                            src={item.productImage}
                            alt={item.productName}
                            width={64}
                            height={64}
                            unoptimized
                          />
                        )}
                      </div>
                      <div>
                        <h5 className="font-headline-md text-[18px] text-on-surface">
                          {item.productName}
                        </h5>
                        <p className="font-caption text-caption text-secondary">
                          {item.detail}
                        </p>
                      </div>
                    </div>
                    <span className="font-body-lg text-body-lg font-bold text-on-surface">
                      {formatCOP(item.unitPrice * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-lg pt-lg border-t-2 border-dashed border-surface-container-highest flex flex-col gap-sm">
                <div className="flex justify-between text-secondary">
                  <span className="font-body-md text-body-md">Subtotal</span>
                  <span className="font-body-md text-body-md">
                    {formatCOP(order.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-secondary">
                  <span className="font-body-md text-body-md">
                    Envío Premium (Refrigerado)
                  </span>
                  <span className="font-body-md text-body-md">
                    {formatCOP(order.shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-on-surface mt-sm">
                  <span className="font-headline-md text-headline-md">Total</span>
                  <span className="font-headline-md text-headline-md text-primary">
                    {formatCOP(order.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <aside className="lg:col-span-4 flex flex-col gap-lg">
            <div className="bg-surface-container-lowest rounded-xl p-lg shadow-sm border border-surface-container-high">
              <h3 className="font-headline-md text-headline-md text-on-surface mb-lg">
                Detalles de Entrega
              </h3>
              <div className="flex flex-col gap-md">
                <div className="flex gap-md">
                  <MaterialIcon name="location_on" className="text-primary" />
                  <div>
                    <p className="font-label-md text-label-md text-on-surface">
                      Dirección de Envío
                    </p>
                    <p className="font-body-md text-body-md text-secondary">
                      {order.shippingAddress.street}
                      <br />
                      {order.shippingAddress.city}
                      {order.shippingAddress.zip
                        ? `, ${order.shippingAddress.zip}`
                        : ""}
                    </p>
                  </div>
                </div>
                {order.deliveryNotes && (
                  <div className="flex gap-md">
                    <MaterialIcon name="notes" className="text-primary" />
                    <div>
                      <p className="font-label-md text-label-md text-on-surface">
                        Notas Especiales
                      </p>
                      <p className="font-body-md text-body-md text-secondary">
                        {order.deliveryNotes}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex gap-md">
                  <MaterialIcon name="phone" className="text-primary" />
                  <div>
                    <p className="font-label-md text-label-md text-on-surface">
                      Contacto
                    </p>
                    <p className="font-body-md text-body-md text-secondary">
                      {order.contactPhone ?? "+52 55 1234 5678"}
                    </p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="w-full mt-lg py-md bg-secondary text-white font-label-md rounded-lg hover:bg-on-surface transition-colors flex items-center justify-center gap-sm group"
              >
                <MaterialIcon
                  name="support_agent"
                  className="text-[20px] group-hover:rotate-12 transition-transform"
                />
                Contactar Soporte
              </button>
            </div>

            <div className="bg-primary-container rounded-xl p-lg text-on-primary shadow-sm relative overflow-hidden group">
              <div className="relative z-10">
                <h4 className="font-headline-md text-headline-md mb-md">
                  Garantía de Calidad
                </h4>
                <p className="font-body-md text-body-md text-on-primary-container mb-lg">
                  Todos nuestros cortes viajan en empaque de vacío y cadena de
                  frío controlada para asegurar la frescura desde nuestro taller
                  hasta tu mesa.
                </p>
                <div className="flex items-center gap-sm">
                  <MaterialIcon name="verified" />
                  <span className="font-label-md text-label-md">
                    Certificación TIF
                  </span>
                </div>
              </div>
              <div className="absolute -right-8 -bottom-8 opacity-10 scale-150 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                <MaterialIcon name="restaurant" className="text-[160px]" />
              </div>
            </div>

            <button
              type="button"
              className="w-full py-md border-2 border-primary text-primary font-label-md rounded-lg hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-sm"
            >
              <MaterialIcon name="download" className="text-[20px]" />
              Descargar Recibo PDF
            </button>
          </aside>
        </div>
      </main>
      <Footer variant="tracking" />
    </>
  );
}
