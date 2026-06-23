"use client";

import { useState, Fragment } from "react";
import { formatCOP, ORDER_STATUS_LABELS } from "@/lib/utils";
import MaterialIcon from "./MaterialIcon";

type Order = {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: string;
  total: number;
  itemCount: number;
  createdAt: string;
  deliveryDate: string | null;
  paymentMethod: string;
  shippingAddress: string;
};

type OrderItem = {
  id: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

type OrdersSectionProps = {
  orders: Order[];
  orderItems: Record<number, OrderItem[]>;
  onUpdateStatus: (orderId: number, newStatus: string) => void;
  loading: boolean;
};

const STATUS_COLORS: Record<string, string> = {
  received: "bg-surface-container-highest text-secondary",
  preparing: "bg-primary-fixed text-primary",
  in_transit: "bg-primary-fixed text-primary",
  delivered: "bg-secondary-container text-on-secondary-container",
  cancelled: "bg-error-container text-on-error-container",
};

const STATUS_OPTIONS = [
  { value: "received", label: "Recibido" },
  { value: "preparing", label: "En Preparación" },
  { value: "in_transit", label: "En Camino" },
  { value: "delivered", label: "Entregado" },
  { value: "cancelled", label: "Cancelado" },
];

const PAYMENT_METHODS: Record<string, string> = {
  card: "Tarjeta de Crédito/Débito",
  spei: "Transferencia SPEI",
  cash: "Efectivo",
  paypal: "PayPal",
};

export default function OrdersSection({
  orders,
  orderItems,
  onUpdateStatus,
  loading,
}: OrdersSectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedTimeframe, setSelectedTimeframe] = useState("all");
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  const statuses = ["all", ...Array.from(new Set(orders.map(o => o.status)))];

  const filteredOrders = orders
    .filter(order => {
      if (selectedStatus !== "all" && order.status !== selectedStatus) return false;
      if (!searchTerm) return true;
      
      const searchLower = searchTerm.toLowerCase();
      return (
        order.orderNumber.toLowerCase().includes(searchLower) ||
        order.customerName.toLowerCase().includes(searchLower) ||
        order.customerEmail.toLowerCase().includes(searchLower) ||
        order.shippingAddress.toLowerCase().includes(searchLower)
      );
    })
    .filter(order => {
      if (selectedTimeframe === "all") return true;
      
      const orderDate = new Date(order.createdAt);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (selectedTimeframe) {
        case "today": return daysDiff === 0;
        case "week": return daysDiff <= 7;
        case "month": return daysDiff <= 30;
        default: return true;
      }
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter(o => o.status !== "delivered" && o.status !== "cancelled").length;
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
  const recentRevenue = orders
    .filter(o => {
      const orderDate = new Date(o.createdAt);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff <= 7;
    })
    .reduce((sum, o) => sum + o.total, 0);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-MX", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    return ORDER_STATUS_LABELS[status] || status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="space-y-xl">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-lg">
        <div className="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-surface-variant/10">
          <div className="flex justify-between items-center mb-md">
            <div>
              <p className="text-secondary font-label-md text-label-md uppercase tracking-wider">
                Pedidos Totales
              </p>
              <h3 className="font-headline-lg text-headline-lg mt-unit text-on-surface">
                {orders.length}
              </h3>
            </div>
            <div className="p-sm bg-primary/10 rounded-lg text-primary">
              <MaterialIcon name="receipt_long" />
            </div>
          </div>
          <p className="text-caption text-secondary">
            {pendingOrders} pendientes
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
            {formatCOP(recentRevenue)} esta semana
          </p>
        </div>

        <div className="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-surface-variant/10">
          <div className="flex justify-between items-center mb-md">
            <div>
              <p className="text-secondary font-label-md text-label-md uppercase tracking-wider">
                Valor Promedio
              </p>
              <h3 className="font-headline-lg text-headline-lg mt-unit text-on-surface">
                {formatCOP(avgOrderValue)}
              </h3>
            </div>
            <div className="p-sm bg-primary/10 rounded-lg text-primary">
              <MaterialIcon name="analytics" />
            </div>
          </div>
          <p className="text-caption text-secondary">
            Por pedido
          </p>
        </div>

        <div className="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-surface-variant/10">
          <div className="flex justify-between items-center mb-md">
            <div>
              <p className="text-secondary font-label-md text-label-md uppercase tracking-wider">
                Tasa de Entrega
              </p>
              <h3 className="font-headline-lg text-headline-lg mt-unit text-on-surface">
                98.2%
              </h3>
            </div>
            <div className="p-sm bg-primary/10 rounded-lg text-primary">
              <MaterialIcon name="local_shipping" />
            </div>
          </div>
          <p className="text-caption text-secondary">
            En tiempo
          </p>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-variant/10 overflow-hidden">
        <div className="p-lg border-b border-surface-variant/10 flex flex-col md:flex-row justify-between items-center gap-md">
          <h2 className="font-headline-md text-headline-md text-on-surface">
            Gestión de Pedidos
          </h2>
          
          <div className="flex flex-wrap gap-sm w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <MaterialIcon name="search" className="absolute left-sm top-1/2 transform -translate-y-1/2 text-secondary" />
              <input
                type="text"
                placeholder="Buscar pedidos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-lg pr-sm py-sm bg-surface-container rounded-lg w-full md:w-64"
              />
            </div>
            
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-sm py-sm bg-surface-container rounded-lg"
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status === "all" ? "Todos los estados" : getStatusBadge(status)}
                </option>
              ))}
            </select>
            
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="px-sm py-sm bg-surface-container rounded-lg"
            >
              <option value="all">Todo el tiempo</option>
              <option value="today">Hoy</option>
              <option value="week">Esta semana</option>
              <option value="month">Este mes</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low border-b border-surface-variant/10">
              <tr>
                <th className="p-md font-label-md text-label-md text-secondary">
                  Pedido #
                </th>
                <th className="p-md font-label-md text-label-md text-secondary">
                  Cliente
                </th>
                <th className="p-md font-label-md text-label-md text-secondary">
                  Fecha
                </th>
                <th className="p-md font-label-md text-label-md text-secondary">
                  Estado
                </th>
                <th className="p-md font-label-md text-label-md text-secondary">
                  Total
                </th>
                <th className="p-md font-label-md text-label-md text-secondary text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-variant/10">
              {filteredOrders.map((order) => (
                <Fragment key={order.id}>
                  <tr
                    key={order.id}
                    className="hover:bg-surface-container-low transition-colors cursor-pointer"
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  >
                    <td className="p-md">
                      <div className="font-bold text-on-surface">
                        {order.orderNumber}
                      </div>
                      <div className="text-caption text-secondary">
                        {order.itemCount} artículos
                      </div>
                    </td>
                    <td className="p-md">
                      <div className="font-body-md text-on-surface">
                        {order.customerName}
                      </div>
                      <div className="text-caption text-secondary">
                        {order.customerEmail}
                      </div>
                    </td>
                    <td className="p-md text-secondary">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="p-md">
                      <span
                        className={`px-sm py-xs rounded-full text-[10px] font-bold ${
                          STATUS_COLORS[order.status] || "bg-surface-container-highest text-secondary"
                        }`}
                      >
                        {getStatusBadge(order.status)}
                      </span>
                    </td>
                    <td className="p-md font-body-md text-on-surface">
                      {formatCOP(order.total)}
                    </td>
                    <td className="p-md text-right space-x-md">
                      <button
                        type="button"
                        className="text-secondary hover:text-primary transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedOrder(expandedOrder === order.id ? null : order.id);
                        }}
                      >
                        <MaterialIcon name={expandedOrder === order.id ? "expand_less" : "expand_more"} />
                      </button>
                      <button
                        type="button"
                        className="text-secondary hover:text-primary transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          alert(`Ver detalles del pedido ${order.orderNumber}`);
                        }}
                      >
                        <MaterialIcon name="visibility" />
                      </button>
                    </td>
                  </tr>
                  
                  {expandedOrder === order.id && (
                    <tr className="bg-surface-container-low">
                      <td colSpan={6} className="p-md">
                        <div className="border border-surface-variant/20 rounded-lg p-lg">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg mb-lg">
                            <div>
                              <h4 className="font-label-md text-label-md text-secondary mb-sm">
                                Información del Pedido
                              </h4>
                              <div className="space-y-xs">
                                <p className="text-caption">
                                  <span className="text-secondary">Método de Pago:</span>{" "}
                                  {PAYMENT_METHODS[order.paymentMethod] || order.paymentMethod}
                                </p>
                                <p className="text-caption">
                                  <span className="text-secondary">Dirección:</span>{" "}
                                  {order.shippingAddress}
                                </p>
                                {order.deliveryDate && (
                                  <p className="text-caption">
                                    <span className="text-secondary">Fecha de Entrega:</span>{" "}
                                    {formatDate(order.deliveryDate)}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-label-md text-label-md text-secondary mb-sm">
                                Actualizar Estado
                              </h4>
                              <div className="flex gap-sm">
                                <select
                                  value={order.status}
                                  onChange={(e) => onUpdateStatus(order.id, e.target.value)}
                                  className="flex-1 px-sm py-xs bg-surface-container rounded-lg text-caption"
                                  disabled={loading}
                                >
                                  {STATUS_OPTIONS.map(option => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                                <button
                                  type="button"
                                  className="bg-primary text-on-primary px-sm py-xs rounded-lg text-caption hover:bg-primary-container transition-colors"
                                  onClick={() => window.print()}
                                >
                                  <MaterialIcon name="print" />
                                </button>
                              </div>
                            </div>
                          </div>
                          
                          <h4 className="font-label-md text-label-md text-secondary mb-sm">
                            Artículos del Pedido
                          </h4>
                          <div className="space-y-sm">
                            {(orderItems[order.id] || []).map((item) => (
                              <div
                                key={item.id}
                                className="flex justify-between items-center py-xs border-b border-surface-variant/10 last:border-0"
                              >
                                <div>
                                  <p className="font-body-md text-on-surface">
                                    {item.productName}
                                  </p>
                                  <p className="text-caption text-secondary">
                                    {item.quantity} × {formatCOP(item.unitPrice)}
                                  </p>
                                </div>
                                <span className="font-body-md text-on-surface">
                                  {formatCOP(item.total)}
                                </span>
                              </div>
                            ))}
                          </div>
                          
                          <div className="mt-lg pt-lg border-t border-surface-variant/20 flex justify-between items-center">
                            <button
                              type="button"
                              className="text-primary hover:underline text-caption"
                              onClick={() => alert(`Contactar a ${order.customerName}`)}
                            >
                              <MaterialIcon name="mail" className="inline mr-xs" />
                              Contactar Cliente
                            </button>
                            <div className="text-right">
                              <p className="text-caption text-secondary">
                                Subtotal: {formatCOP(order.total * 0.95)}
                              </p>
                              <p className="text-caption text-secondary">
                                Envío: {formatCOP(order.total * 0.05)}
                              </p>
                              <p className="font-headline-md text-headline-md text-primary">
                                Total: {formatCOP(order.total)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="p-xl text-center text-secondary">
            <MaterialIcon name="receipt_long" className="text-4xl mb-md mx-auto" />
            <p className="font-body-lg">No se encontraron pedidos</p>
            <p className="text-caption mt-sm">Intenta con otros filtros de búsqueda</p>
          </div>
        )}

        <div className="p-lg border-t border-surface-variant/10 flex justify-between items-center text-secondary">
          <p className="text-caption">
            Mostrando {filteredOrders.length} de {orders.length} pedidos
          </p>
          <div className="flex items-center gap-md">
            <button
              type="button"
              className="text-primary hover:underline text-caption"
              onClick={() => window.print()}
            >
              <MaterialIcon name="print" className="inline mr-xs" />
              Imprimir Reporte
            </button>
            <button
              type="button"
              className="text-primary hover:underline text-caption"
              onClick={() => alert("Función de exportar no implementada aún")}
            >
              <MaterialIcon name="download" className="inline mr-xs" />
              Exportar CSV
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        <div className="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-surface-variant/10">
          <h3 className="font-headline-md text-headline-md text-on-surface mb-lg">
            Distribución por Estado
          </h3>
          <div className="space-y-md">
            {STATUS_OPTIONS.map((status) => {
              const count = orders.filter(o => o.status === status.value).length;
              const percentage = orders.length > 0 ? (count / orders.length) * 100 : 0;
              
              return (
                <div key={status.value} className="space-y-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-caption text-secondary">{status.label}</span>
                    <span className="text-caption font-bold">{count} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-surface-variant h-1 rounded-full">
                    <div
                      className={`h-1 rounded-full ${STATUS_COLORS[status.value] || "bg-surface-container-highest"}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-surface-variant/10">
          <h3 className="font-headline-md text-headline-md text-on-surface mb-lg">
            Métodos de Pago
          </h3>
          <div className="space-y-md">
            {Object.entries(
              orders.reduce((acc, order) => {
                acc[order.paymentMethod] = (acc[order.paymentMethod] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            ).map(([method, count]) => {
              const percentage = orders.length > 0 ? (count / orders.length) * 100 : 0;
              
              return (
                <div key={method} className="space-y-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-caption text-secondary">
                      {PAYMENT_METHODS[method] || method}
                    </span>
                    <span className="text-caption font-bold">{count} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-surface-variant h-1 rounded-full">
                    <div
                      className="bg-primary h-1 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          
          <button
            type="button"
            className="w-full mt-lg py-sm border border-primary text-primary rounded-lg font-label-md hover:bg-primary hover:text-on-primary transition-colors text-center"
            onClick={() => alert("Configurar métodos de pago")}
          >
            <MaterialIcon name="settings" className="inline mr-xs" />
            Configurar Métodos de Pago
          </button>
        </div>
      </div>
    </div>
  );
}