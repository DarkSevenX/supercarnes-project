"use client";

import Image from "next/image";
import { useState } from "react";
import { formatCOP } from "@/lib/utils";
import MaterialIcon from "./MaterialIcon";

type AdminProduct = {
  id: number;
  name: string;
  description: string;
  category: string;
  grade: string | null;
  price: number;
  priceUnit: string;
  imageUrl: string;
  stockKg: number;
};

type AdminStats = {
  totalSales: number;
  salesGrowth: string;
  newCustomers: number;
  customersGrowth: string;
  activeOrders: number;
  capacityPercent: number;
  topSelling: { rank: number; name: string; units: number }[];
  recentCustomers: {
    name: string;
    purchase: string;
    timeAgo: string;
    avatar: string;
  }[];
};

type AdminDashboardProps = {
  stats: AdminStats;
  products: AdminProduct[];
};

export default function AdminDashboard({
  stats,
  products,
}: AdminDashboardProps) {
  const [toast, setToast] = useState(false);
  const [activeNav, setActiveNav] = useState("dashboard");

  const showToast = () => {
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  const stockPercent = (kg: number) => Math.min(100, Math.round((kg / 50) * 100));

  const gradeBadge = (grade: string | null) => {
    if (!grade) return "bg-secondary-container text-on-secondary-container";
    const g = grade.toLowerCase();
    if (g.includes("prime") || g.includes("wagyu"))
      return "bg-primary/10 text-primary";
    if (g.includes("wagyu")) return "bg-tertiary-container text-on-tertiary-container";
    return "bg-secondary-container text-on-secondary-container";
  };

  const stockBarColor = (kg: number) =>
    kg < 15 ? "bg-error" : "bg-primary";

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-64 bg-inverse-surface text-on-secondary flex flex-col flex-shrink-0 shadow-xl z-30 transition-all duration-300">
        <div className="p-lg flex items-center gap-md">
          <Image
            alt="Super Carnes Logo"
            className="w-10 h-10 object-contain brightness-110"
            src="/logo.svg"
            width={40}
            height={40}
          />
          <span className="font-headline-md text-headline-md text-surface tracking-tight">
            Super Carnes
          </span>
        </div>
        <nav className="flex-1 mt-md px-md space-y-sm overflow-y-auto custom-scrollbar">
          {[
            { id: "dashboard", icon: "dashboard", label: "Panel de Control" },
            { id: "inventory", icon: "inventory_2", label: "Inventario" },
            { id: "customers", icon: "group", label: "Clientes" },
            { id: "orders", icon: "shopping_bag", label: "Pedidos" },
            { id: "analytics", icon: "analytics", label: "Analíticas" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveNav(item.id)}
              className={`w-full flex items-center gap-md px-md py-md rounded-lg transition-all group ${
                activeNav === item.id
                  ? "active-nav"
                  : "text-surface-variant hover:text-surface hover:bg-on-surface-variant/10"
              }`}
            >
              <MaterialIcon
                name={item.icon}
                className="group-hover:scale-110 transition-transform"
              />
              <span className="font-label-md text-label-md">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-lg border-t border-surface-variant/10">
          <div className="flex items-center gap-md">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary">
              <MaterialIcon name="person" />
            </div>
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-surface">
                Usuario Admin
              </span>
              <span className="text-caption text-surface-variant">
                Carnicero Maestro
              </span>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-surface-container-lowest flex items-center justify-between px-lg border-b border-surface-variant/20 shadow-sm z-20">
          <div className="flex items-center gap-md">
            <h1 className="font-headline-lg text-headline-lg text-on-surface">
              Panel de Control
            </h1>
            <span className="bg-surface-container px-sm py-unit rounded font-label-md text-caption text-secondary">
              Desempeño Q4
            </span>
          </div>
          <div className="flex items-center gap-lg">
            <div className="relative group">
              <MaterialIcon
                name="notifications"
                className="text-secondary cursor-pointer hover:text-primary transition-colors"
              />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
            </div>
            <MaterialIcon
              name="settings"
              className="text-secondary cursor-pointer hover:text-primary transition-colors"
            />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-lg space-y-xl bg-surface-container-low custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
            <div className="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-surface-variant/10 group hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-md">
                <div>
                  <p className="text-secondary font-label-md text-label-md uppercase tracking-wider">
                    Ventas Totales
                  </p>
                  <h3 className="font-headline-lg text-headline-lg mt-unit text-on-surface">
                    {formatCOP(stats.totalSales)}
                  </h3>
                </div>
                <div className="p-sm bg-primary/10 rounded-lg text-primary">
                  <MaterialIcon name="payments" />
                </div>
              </div>
              <p className="text-caption text-secondary flex items-center gap-unit">
                <span className="text-primary font-bold">
                  ↑ {stats.salesGrowth}
                </span>{" "}
                vs mes anterior
              </p>
            </div>
            <div className="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-surface-variant/10 group hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-md">
                <div>
                  <p className="text-secondary font-label-md text-label-md uppercase tracking-wider">
                    Nuevos Clientes
                  </p>
                  <h3 className="font-headline-lg text-headline-lg mt-unit text-on-surface">
                    {stats.newCustomers.toLocaleString()}
                  </h3>
                </div>
                <div className="p-sm bg-primary/10 rounded-lg text-primary">
                  <MaterialIcon name="person_add" />
                </div>
              </div>
              <p className="text-caption text-secondary flex items-center gap-unit">
                <span className="text-primary font-bold">
                  ↑ {stats.customersGrowth}
                </span>{" "}
                desde ayer
              </p>
            </div>
            <div className="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-surface-variant/10 group hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-md">
                <div>
                  <p className="text-secondary font-label-md text-label-md uppercase tracking-wider">
                    Pedidos Activos
                  </p>
                  <h3 className="font-headline-lg text-headline-lg mt-unit text-on-surface">
                    {stats.activeOrders}
                  </h3>
                </div>
                <div className="p-sm bg-primary/10 rounded-lg text-primary">
                  <MaterialIcon name="pending_actions" />
                </div>
              </div>
              <div className="w-full bg-surface-variant h-1 rounded-full mt-md">
                <div
                  className="bg-primary h-1 rounded-full"
                  style={{ width: `${stats.capacityPercent}%` }}
                />
              </div>
              <p className="text-caption text-secondary mt-unit">
                Procesando al {stats.capacityPercent}% de capacidad
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
            <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl shadow-sm border border-surface-variant/10 overflow-hidden">
              <div className="p-lg border-b border-surface-variant/10 flex justify-between items-center">
                <h2 className="font-headline-md text-headline-md text-on-surface">
                  Inventario de Productos
                </h2>
                <button
                  type="button"
                  onClick={showToast}
                  className="bg-primary text-on-primary px-lg py-sm rounded-lg font-label-md text-label-md hover:bg-primary-container transition-colors flex items-center gap-sm"
                >
                  <MaterialIcon name="add" className="text-[20px]" /> Agregar Producto
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-surface-container-low border-b border-surface-variant/10">
                    <tr>
                      <th className="p-md font-label-md text-label-md text-secondary">
                        Producto
                      </th>
                      <th className="p-md font-label-md text-label-md text-secondary">
                        Grado
                      </th>
                      <th className="p-md font-label-md text-label-md text-secondary">
                        Stock
                      </th>
                      <th className="p-md font-label-md text-label-md text-secondary">
                        Precio
                      </th>
                      <th className="p-md font-label-md text-label-md text-secondary text-right">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-variant/10">
                    {products.slice(0, 6).map((product) => (
                      <tr
                        key={product.id}
                        className="hover:bg-surface-container-low transition-colors"
                      >
                        <td className="p-md flex items-center gap-md">
                          <div className="w-12 h-12 rounded-lg bg-surface-container overflow-hidden">
                            <Image
                              alt={product.name}
                              className="w-full h-full object-cover"
                              src={product.imageUrl}
                              width={48}
                              height={48}
                              unoptimized
                            />
                          </div>
                          <div>
                            <p className="font-headline-md text-body-md text-on-surface">
                              {product.name}
                            </p>
                            <p className="text-caption text-secondary">
                              {product.description}
                            </p>
                          </div>
                        </td>
                        <td className="p-md">
                          <span
                            className={`${gradeBadge(product.grade)} text-[10px] uppercase font-bold px-sm py-unit rounded`}
                          >
                            {product.grade ?? "Standard"}
                          </span>
                        </td>
                        <td className="p-md">
                          <div className="flex flex-col gap-unit">
                            <span className="font-body-md text-on-surface">
                              {product.stockKg} kg
                            </span>
                            <div className="w-24 h-1 bg-surface-variant rounded-full overflow-hidden">
                              <div
                                className={`${stockBarColor(product.stockKg)} h-full`}
                                style={{
                                  width: `${stockPercent(product.stockKg)}%`,
                                }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="p-md font-body-md text-on-surface">
                          {formatCOP(product.price)}/{product.priceUnit}
                        </td>
                        <td className="p-md text-right space-x-md">
                          <button
                            type="button"
                            className="text-secondary hover:text-primary transition-colors"
                          >
                            <MaterialIcon name="edit" />
                          </button>
                          <button
                            type="button"
                            className="text-secondary hover:text-error transition-colors"
                          >
                            <MaterialIcon name="delete" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-col gap-lg">
              <div className="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-surface-variant/10">
                <h2 className="font-headline-md text-headline-md text-on-surface mb-lg">
                  Cortes Más Vendidos
                </h2>
                <ul className="space-y-md">
                  {stats.topSelling.map((item) => (
                    <li
                      key={item.rank}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-md">
                        <span className="text-primary font-bold">
                          {String(item.rank).padStart(2, "0")}
                        </span>
                        <span className="font-label-md text-label-md">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-secondary">{item.units} unidades</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-lg pt-lg border-t border-surface-variant/10">
                  <button
                    type="button"
                    className="w-full text-center text-primary font-label-md text-label-md hover:underline"
                  >
                    Ver Reporte Detallado
                  </button>
                </div>
              </div>

              <div className="bg-inverse-surface p-lg rounded-xl shadow-lg border border-surface-variant/10 text-surface">
                <h2 className="font-headline-md text-headline-md mb-lg">
                  Clientes Recientes
                </h2>
                <div className="space-y-md">
                  {stats.recentCustomers.map((customer) => (
                    <div
                      key={customer.name}
                      className="flex items-center gap-md group cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-full bg-surface-container-highest/20 flex items-center justify-center border border-white/10 overflow-hidden">
                        <Image
                          alt="Customer"
                          className="w-full h-full object-cover"
                          src={customer.avatar}
                          width={40}
                          height={40}
                          unoptimized
                        />
                      </div>
                      <div className="flex-1 border-b border-white/5 pb-sm group-hover:border-primary/50 transition-colors">
                        <p className="font-label-md text-label-md">
                          {customer.name}
                        </p>
                        <p className="text-caption text-surface-variant">
                          Compró: {customer.purchase}
                        </p>
                      </div>
                      <span className="text-caption text-surface-variant">
                        {customer.timeAgo}
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="w-full mt-lg py-sm border border-white/20 rounded-lg font-label-md text-label-md hover:bg-white/5 transition-all"
                >
                  Gestionar Todos los Clientes
                </button>
              </div>
            </div>
          </div>

          <footer className="pt-xl pb-lg flex flex-col md:flex-row justify-between items-center text-secondary border-t border-surface-variant/20">
            <p className="text-caption">
              © 2024 Super Carnes. Premium Butcher Atelier. Admin Portal v2.4.1
            </p>
            <div className="flex gap-lg mt-md md:mt-0">
              <a className="text-caption hover:text-primary transition-colors" href="#">
                Salud del Sistema
              </a>
              <a className="text-caption hover:text-primary transition-colors" href="#">
                Registros
              </a>
              <a className="text-caption hover:text-primary transition-colors" href="#">
                Soporte
              </a>
            </div>
          </footer>
        </div>
      </main>

      <div
        className={`fixed bottom-lg right-lg bg-inverse-surface text-surface px-lg py-md rounded-lg shadow-2xl flex items-center gap-md transform transition-transform duration-500 z-50 ${
          toast ? "translate-y-0" : "translate-y-32"
        }`}
      >
        <MaterialIcon name="check_circle" className="text-primary" />
        <span className="font-label-md">Inventario actualizado exitosamente.</span>
      </div>
    </div>
  );
}
