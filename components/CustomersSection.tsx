"use client";

import Image from "next/image";
import { useState } from "react";
import { formatCOP } from "@/lib/utils";
import MaterialIcon from "./MaterialIcon";

type Customer = {
  id: number;
  name: string;
  email: string;
  avatarUrl: string | null;
  memberSince: string;
  loyaltyPoints: number;
  totalSpent: number;
  orderCount: number;
  lastOrderDate: string | null;
};

type Order = {
  id: number;
  customerName: string;
  total: number;
  status: string;
  date: string;
};

type CustomersSectionProps = {
  customers: Customer[];
  recentOrders: Order[];
};

const STATUS_COLORS: Record<string, string> = {
  received: "bg-surface-container-highest text-secondary",
  preparing: "bg-primary-fixed text-primary",
  in_transit: "bg-primary-fixed text-primary",
  delivered: "bg-surface-container-highest text-secondary",
};

const STATUS_LABELS: Record<string, string> = {
  received: "Recibido",
  preparing: "En Preparación",
  in_transit: "En Camino",
  delivered: "Entregado",
};

export default function CustomersSection({
  customers,
  recentOrders,
}: CustomersSectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTier, setSelectedTier] = useState("all");

  const tiers = [
    { id: "all", label: "Todos los Clientes" },
    { id: "elite", label: "Elite (10,000+ puntos)", minPoints: 10000 },
    { id: "premium", label: "Premium (5,000+ puntos)", minPoints: 5000 },
    { id: "regular", label: "Regular (1,000+ puntos)", minPoints: 1000 },
    { id: "new", label: "Nuevos (< 1,000 puntos)", minPoints: 0, maxPoints: 999 },
  ];

  const filteredCustomers = customers
    .filter(customer => {
      if (!searchTerm) return true;
      
      const searchLower = searchTerm.toLowerCase();
      return (
        customer.name.toLowerCase().includes(searchLower) ||
        customer.email.toLowerCase().includes(searchLower)
      );
    })
    .filter(customer => {
      if (selectedTier === "all") return true;
      
      const tier = tiers.find(t => t.id === selectedTier);
      if (!tier) return true;
      
      if (tier.id === "new") {
        return customer.loyaltyPoints < 1000;
      }
      
      return customer.loyaltyPoints >= (tier.minPoints || 0);
    })
    .sort((a, b) => b.totalSpent - a.totalSpent);

  const totalCustomers = customers.length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const avgOrderValue = totalRevenue / customers.reduce((sum, c) => sum + c.orderCount, 1);
  const eliteCustomers = customers.filter(c => c.loyaltyPoints >= 10000).length;

  return (
    <div className="space-y-xl">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-lg">
        <div className="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-surface-variant/10">
          <div className="flex justify-between items-center mb-md">
            <div>
              <p className="text-secondary font-label-md text-label-md uppercase tracking-wider">
                Total de Clientes
              </p>
              <h3 className="font-headline-lg text-headline-lg mt-unit text-on-surface">
                {totalCustomers.toLocaleString()}
              </h3>
            </div>
            <div className="p-sm bg-primary/10 rounded-lg text-primary">
              <MaterialIcon name="group" />
            </div>
          </div>
          <p className="text-caption text-secondary">
            {eliteCustomers} clientes elite
          </p>
        </div>

        <div className="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-surface-variant/10">
          <div className="flex justify-between items-center mb-md">
            <div>
              <p className="text-secondary font-label-md text-label-md uppercase tracking-wider">
                Ingresos Totales
              </p>
              <h3 className="font-headline-lg text-headline-lg mt-unit text-on-surface">
                {formatCOP(totalRevenue)}
              </h3>
            </div>
            <div className="p-sm bg-primary/10 rounded-lg text-primary">
              <MaterialIcon name="payments" />
            </div>
          </div>
          <p className="text-caption text-secondary">
            De {customers.reduce((sum, c) => sum + c.orderCount, 0)} pedidos
          </p>
        </div>

        <div className="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-surface-variant/10">
          <div className="flex justify-between items-center mb-md">
            <div>
              <p className="text-secondary font-label-md text-label-md uppercase tracking-wider">
                Valor Promedio de Pedido
              </p>
              <h3 className="font-headline-lg text-headline-lg mt-unit text-on-surface">
                {formatCOP(avgOrderValue)}
              </h3>
            </div>
            <div className="p-sm bg-primary/10 rounded-lg text-primary">
              <MaterialIcon name="shopping_cart" />
            </div>
          </div>
          <p className="text-caption text-secondary">
            Por cliente
          </p>
        </div>

        <div className="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-surface-variant/10">
          <div className="flex justify-between items-center mb-md">
            <div>
              <p className="text-secondary font-label-md text-label-md uppercase tracking-wider">
                Retención
              </p>
              <h3 className="font-headline-lg text-headline-lg mt-unit text-on-surface">
                94.5%
              </h3>
            </div>
            <div className="p-sm bg-primary/10 rounded-lg text-primary">
              <MaterialIcon name="trending_up" />
            </div>
          </div>
          <p className="text-caption text-secondary">
            Tasa de repetición
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl shadow-sm border border-surface-variant/10 overflow-hidden">
          <div className="p-lg border-b border-surface-variant/10 flex flex-col md:flex-row justify-between items-center gap-md">
            <h2 className="font-headline-md text-headline-md text-on-surface">
              Base de Clientes
            </h2>
            
            <div className="flex flex-wrap gap-sm w-full md:w-auto">
              <div className="relative flex-1 md:flex-none">
                <MaterialIcon name="search" className="absolute left-sm top-1/2 transform -translate-y-1/2 text-secondary" />
                <input
                  type="text"
                  placeholder="Buscar clientes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-lg pr-sm py-sm bg-surface-container rounded-lg w-full md:w-64"
                />
              </div>
              
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="px-sm py-sm bg-surface-container rounded-lg"
              >
                {tiers.map(tier => (
                  <option key={tier.id} value={tier.id}>
                    {tier.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low border-b border-surface-variant/10">
                <tr>
                  <th className="p-md font-label-md text-label-md text-secondary">
                    Cliente
                  </th>
                  <th className="p-md font-label-md text-label-md text-secondary">
                    Miembro Desde
                  </th>
                  <th className="p-md font-label-md text-label-md text-secondary">
                    Puntos
                  </th>
                  <th className="p-md font-label-md text-label-md text-secondary">
                    Total Gastado
                  </th>
                  <th className="p-md font-label-md text-label-md text-secondary">
                    Pedidos
                  </th>
                  <th className="p-md font-label-md text-label-md text-secondary text-right">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-variant/10">
                {filteredCustomers.slice(0, 8).map((customer) => (
                  <tr
                    key={customer.id}
                    className="hover:bg-surface-container-low transition-colors"
                  >
                    <td className="p-md flex items-center gap-md">
                      <div className="w-10 h-10 rounded-full bg-surface-container overflow-hidden">
                        <Image
                          alt={customer.name}
                          className="w-full h-full object-cover"
                          src={customer.avatarUrl || "/placeholder-avatar.jpg"}
                          width={40}
                          height={40}
                          unoptimized
                        />
                      </div>
                      <div>
                        <p className="font-headline-md text-body-md text-on-surface">
                          {customer.name}
                        </p>
                        <p className="text-caption text-secondary">
                          {customer.email}
                        </p>
                      </div>
                    </td>
                    <td className="p-md text-secondary">
                      {customer.memberSince}
                    </td>
                    <td className="p-md">
                      <span className="bg-primary/10 text-primary px-sm py-xs rounded text-caption font-bold">
                        {customer.loyaltyPoints.toLocaleString()} pts
                      </span>
                    </td>
                    <td className="p-md font-body-md text-on-surface">
                      {formatCOP(customer.totalSpent)}
                    </td>
                    <td className="p-md text-secondary">
                      {customer.orderCount}
                    </td>
                    <td className="p-md text-right space-x-md">
                      <button
                        type="button"
                        className="text-secondary hover:text-primary transition-colors"
                        onClick={() => alert(`Ver detalles de ${customer.name}`)}
                      >
                        <MaterialIcon name="visibility" />
                      </button>
                      <button
                        type="button"
                        className="text-secondary hover:text-primary transition-colors"
                        onClick={() => alert(`Contactar a ${customer.name}`)}
                      >
                        <MaterialIcon name="mail" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCustomers.length === 0 && (
            <div className="p-xl text-center text-secondary">
              <MaterialIcon name="group_off" className="text-4xl mb-md mx-auto" />
              <p className="font-body-lg">No se encontraron clientes</p>
              <p className="text-caption mt-sm">Intenta con otros filtros de búsqueda</p>
            </div>
          )}

          <div className="p-lg border-t border-surface-variant/10 flex justify-between items-center text-secondary">
            <p className="text-caption">
              Mostrando {Math.min(filteredCustomers.length, 8)} de {filteredCustomers.length} clientes
            </p>
            <button
              type="button"
              className="text-primary hover:underline text-caption"
              onClick={() => alert("Ver todos los clientes")}
            >
              Ver Todos los Clientes →
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-lg">
          <div className="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-surface-variant/10">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-lg flex items-center justify-between">
              <span>Pedidos Recientes</span>
              <span className="text-caption text-secondary">{recentOrders.length}</span>
            </h2>
            
            <div className="space-y-md max-h-96 overflow-y-auto">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-md border border-surface-variant/10 rounded-lg hover:bg-surface-container-low transition-colors"
                >
                  <div className="flex justify-between items-start mb-sm">
                    <div>
                      <p className="font-label-md text-label-md text-on-surface">
                        {order.customerName}
                      </p>
                      <p className="text-caption text-secondary">
                        {order.date}
                      </p>
                    </div>
                    <span
                      className={`px-sm py-xs rounded-full text-[10px] font-bold ${
                        STATUS_COLORS[order.status] || "bg-surface-container-highest text-secondary"
                      }`}
                    >
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-headline-md text-headline-md text-primary">
                      {formatCOP(order.total)}
                    </span>
                    <button
                      type="button"
                      className="text-secondary hover:text-primary text-caption"
                      onClick={() => alert(`Ver pedido #${order.id}`)}
                    >
                      Detalles
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="w-full mt-lg py-sm border border-surface-variant/20 rounded-lg font-label-md text-label-md hover:bg-surface-container transition-all text-center"
              onClick={() => alert("Ver todos los pedidos")}
            >
              Ver Todos los Pedidos
            </button>
          </div>

          <div className="bg-primary-container p-lg rounded-xl text-on-primary-container">
            <h3 className="font-headline-md text-headline-md mb-md">
              Segmentación de Clientes
            </h3>
            
            <div className="space-y-md">
              <div className="flex justify-between items-center">
                <span>Clientes Elite</span>
                <span className="font-bold">{eliteCustomers}</span>
              </div>
              <div className="w-full bg-on-primary-container/20 h-1 rounded-full">
                <div 
                  className="bg-on-primary-container h-1 rounded-full" 
                  style={{ width: `${(eliteCustomers / totalCustomers) * 100}%` }}
                />
              </div>
              
              <div className="flex justify-between items-center">
                <span>Clientes Premium</span>
                <span className="font-bold">
                  {customers.filter(c => c.loyaltyPoints >= 5000 && c.loyaltyPoints < 10000).length}
                </span>
              </div>
              <div className="w-full bg-on-primary-container/20 h-1 rounded-full">
                <div 
                  className="bg-on-primary-container h-1 rounded-full" 
                  style={{ width: `${(customers.filter(c => c.loyaltyPoints >= 5000 && c.loyaltyPoints < 10000).length / totalCustomers) * 100}%` }}
                />
              </div>
              
              <div className="flex justify-between items-center">
                <span>Nuevos Clientes</span>
                <span className="font-bold">
                  {customers.filter(c => c.loyaltyPoints < 1000).length}
                </span>
              </div>
              <div className="w-full bg-on-primary-container/20 h-1 rounded-full">
                <div 
                  className="bg-on-primary-container h-1 rounded-full" 
                  style={{ width: `${(customers.filter(c => c.loyaltyPoints < 1000).length / totalCustomers) * 100}%` }}
                />
              </div>
            </div>
            
            <button
              type="button"
              className="w-full mt-lg py-sm bg-on-primary-container text-primary-container rounded-lg font-label-md hover:opacity-90 transition-opacity"
              onClick={() => alert("Crear campaña de marketing")}
            >
              Crear Campaña de Marketing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}