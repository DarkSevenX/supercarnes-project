"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatCOP, CATEGORIES } from "@/lib/utils";
import MaterialIcon from "./MaterialIcon";
import ProductFormModal from "./ProductFormModal";
import InventorySection from "./InventorySection";
import CustomersSection from "./CustomersSection";
import OrdersSection from "./OrdersSection";
import AnalyticsSection from "./AnalyticsSection";

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
  const router = useRouter();
  const [toast, setToast] = useState({ show: false, message: "" });
  const [activeNav, setActiveNav] = useState("dashboard");
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [currentProducts, setCurrentProducts] = useState<AdminProduct[]>(products);
  const [loading, setLoading] = useState(false);

  const showToast = (message: string = "Inventario actualizado exitosamente.") => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 3000);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/auth";
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      showToast("Error al cerrar sesión");
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowProductModal(true);
  };

  const handleEditProduct = (product: AdminProduct) => {
    setEditingProduct(product);
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setCurrentProducts(currentProducts.filter(p => p.id !== id));
        showToast("Producto eliminado exitosamente");
      } else {
        showToast("Error al eliminar producto");
      }
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      showToast("Error al eliminar producto");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProduct = async (productData: any) => {
    try {
      setLoading(true);
      const url = editingProduct 
        ? `/api/admin/products/${editingProduct.id}`
        : "/api/admin/products";
      
      const method = editingProduct ? "PATCH" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        const updatedProduct = await response.json();
        
        if (editingProduct) {
          setCurrentProducts(currentProducts.map(p => 
            p.id === editingProduct.id ? { ...p, ...updatedProduct } : p
          ));
          showToast("Producto actualizado exitosamente");
        } else {
          setCurrentProducts([...currentProducts, updatedProduct]);
          showToast("Producto creado exitosamente");
        }
        
        setShowProductModal(false);
        setEditingProduct(null);
      } else {
        showToast("Error al guardar producto");
      }
    } catch (error) {
      console.error("Error al guardar producto:", error);
      showToast("Error al guardar producto");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    router.refresh();
    showToast("Datos actualizados");
  };

  // Datos de ejemplo para las secciones (en un proyecto real estos vendrían de APIs)
  const [timeRange, setTimeRange] = useState<"week" | "month" | "quarter" | "year">("month");
  
  // Datos para la sección de clientes
  const customerData = [
    {
      id: 1,
      name: "Alejandro V. Montemayor",
      email: "alejandro.v@atelier.com",
      avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAtYvY_6wGhj5Oe8w5bF-avFTKL_ilHYmzWxhsFqhep_gNP5KVSwSzsREpVGOYC1FXnJcLM6FAdAR1fGbcPaM-_lW736rUQ4ps551XO5t5Y9cQfby9nT61c5Um494RTViCDTCP7CwCxwMWBIdP2-VWEvjzzfZkrkjPRECNqGfbOcL_RdKUCfyYhjWeMlZsgE7f1GD9LDcyGdFV44DvVy_JsnkxBrfko5z7AmqRhphS5BvC1z2pLBxWDVHBXsqcfM_7WrNASHg1mvQk",
      memberSince: "2021",
      loyaltyPoints: 2450,
      totalSpent: 485000,
      orderCount: 3,
      lastOrderDate: "2023-10-24",
    },
    {
      id: 2,
      name: "María González",
      email: "maria.g@empresa.com",
      avatarUrl: null,
      memberSince: "2022",
      loyaltyPoints: 1200,
      totalSpent: 220000,
      orderCount: 2,
      lastOrderDate: "2023-10-12",
    },
    {
      id: 3,
      name: "Carlos Rodríguez",
      email: "carlos.r@consulting.com",
      avatarUrl: null,
      memberSince: "2023",
      loyaltyPoints: 500,
      totalSpent: 89000,
      orderCount: 1,
      lastOrderDate: "2023-09-15",
    },
  ];

  const recentOrdersData = [
    {
      id: 1,
      customerName: "Alejandro V. Montemayor",
      total: 485000,
      status: "in_transit",
      date: "2023-10-24",
    },
    {
      id: 2,
      customerName: "María González",
      total: 220000,
      status: "delivered",
      date: "2023-10-12",
    },
    {
      id: 3,
      customerName: "Carlos Rodríguez",
      total: 89000,
      status: "delivered",
      date: "2023-09-15",
    },
  ];

  // Datos para la sección de pedidos
  const ordersData = [
    {
      id: 1,
      orderNumber: "SC-8942",
      customerName: "Alejandro V. Montemayor",
      customerEmail: "alejandro.v@atelier.com",
      status: "in_transit",
      total: 485000,
      itemCount: 3,
      createdAt: "2023-10-24T10:00:00",
      deliveryDate: "2023-10-24T11:25:00",
      paymentMethod: "card",
      shippingAddress: "Av. Paseo de la Reforma 250, Piso 12, Juárez, Ciudad de México, 06600",
    },
    {
      id: 2,
      orderNumber: "SC-8711",
      customerName: "María González",
      customerEmail: "maria.g@empresa.com",
      status: "delivered",
      total: 220000,
      itemCount: 1,
      createdAt: "2023-10-12T14:00:00",
      deliveryDate: "2023-10-12T15:30:00",
      paymentMethod: "spei",
      shippingAddress: "Av. de los Encinos 452, Ciudad de México, 11000",
    },
    {
      id: 3,
      orderNumber: "SC-8520",
      customerName: "Carlos Rodríguez",
      customerEmail: "carlos.r@consulting.com",
      status: "delivered",
      total: 89000,
      itemCount: 1,
      createdAt: "2023-09-15T11:30:00",
      deliveryDate: "2023-09-15T13:15:00",
      paymentMethod: "card",
      shippingAddress: "Blvd. Miguel de Cervantes 123, Guadalajara, 44100",
    },
  ];

  const orderItemsData = {
    1: [
      {
        id: 1,
        productName: "Premium Wagyu Selection",
        quantity: 3,
        unitPrice: 161667,
        total: 485000,
      },
    ],
    2: [
      {
        id: 2,
        productName: "Tomahawk Dry-Aged",
        quantity: 1,
        unitPrice: 220000,
        total: 220000,
      },
    ],
    3: [
      {
        id: 3,
        productName: "Ribeye Prime Dry-Aged",
        quantity: 2,
        unitPrice: 72500,
        total: 145000,
      },
      {
        id: 4,
        productName: "Costilla Cargada Select",
        quantity: 1,
        unitPrice: 89000,
        total: 89000,
      },
    ],
  };

  // Datos para la sección de analíticas
  const salesData = [
    { date: "2023-10-01", revenue: 1250000, orders: 8, customers: 6 },
    { date: "2023-10-02", revenue: 980000, orders: 6, customers: 5 },
    { date: "2023-10-03", revenue: 1450000, orders: 9, customers: 7 },
    { date: "2023-10-04", revenue: 1100000, orders: 7, customers: 6 },
    { date: "2023-10-05", revenue: 1650000, orders: 10, customers: 8 },
    { date: "2023-10-06", revenue: 1950000, orders: 12, customers: 9 },
    { date: "2023-10-07", revenue: 2200000, orders: 14, customers: 10 },
  ];

  const topProductsData = [
    { id: 1, name: "Ribeye Premium", revenue: 485000, unitsSold: 3, growth: 15.5 },
    { id: 2, name: "Tomahawk Dry-Aged", revenue: 220000, unitsSold: 1, growth: 8.2 },
    { id: 3, name: "Wagyu A5 Striploin", revenue: 740000, unitsSold: 1, growth: 22.1 },
    { id: 4, name: "Costilla Cargada", revenue: 89000, unitsSold: 1, growth: 5.3 },
    { id: 5, name: "Lamb Chops", revenue: 136000, unitsSold: 1, growth: 12.7 },
  ];

  const customerSegmentsData = [
    { segment: "Clientes Elite", count: 15, revenue: 4500000, avgOrderValue: 300000 },
    { segment: "Clientes Premium", count: 42, revenue: 6300000, avgOrderValue: 150000 },
    { segment: "Clientes Regulares", count: 128, revenue: 6400000, avgOrderValue: 50000 },
    { segment: "Nuevos Clientes", count: 35, revenue: 875000, avgOrderValue: 25000 },
  ];

  const handleUpdateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        showToast(`Estado del pedido actualizado a: ${newStatus}`);
        // En un proyecto real, actualizarías el estado local aquí
      } else {
        showToast("Error al actualizar estado del pedido");
      }
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      showToast("Error al actualizar estado del pedido");
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeNav) {
      case "inventory":
        return (
          <InventorySection
            products={currentProducts}
            onEditProduct={handleEditProduct}
            onDeleteProduct={handleDeleteProduct}
            loading={loading}
          />
        );
      
      case "customers":
        return (
          <CustomersSection
            customers={customerData}
            recentOrders={recentOrdersData}
          />
        );
      
      case "orders":
        return (
          <OrdersSection
            orders={ordersData}
            orderItems={orderItemsData}
            onUpdateStatus={handleUpdateOrderStatus}
            loading={loading}
          />
        );
      
      case "analytics":
        return (
          <AnalyticsSection
            salesData={salesData}
            topProducts={topProductsData}
            customerSegments={customerSegmentsData}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />
        );
      
      case "dashboard":
      default:
        return (
          <div className="space-y-xl">
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
                  <div className="flex gap-sm">
                    <button
                      type="button"
                      onClick={handleRefresh}
                      className="bg-surface-container text-on-surface px-lg py-sm rounded-lg font-label-md text-label-md hover:bg-surface-container-highest transition-colors flex items-center gap-sm"
                      disabled={loading}
                    >
                      <MaterialIcon name="refresh" className="text-[20px]" />
                      Actualizar
                    </button>
                    <button
                      type="button"
                      onClick={handleAddProduct}
                      className="bg-primary text-on-primary px-lg py-sm rounded-lg font-label-md text-label-md hover:bg-primary-container transition-colors flex items-center gap-sm"
                      disabled={loading}
                    >
                      <MaterialIcon name="add" className="text-[20px]" /> Agregar Producto
                    </button>
                  </div>
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
                      {currentProducts.slice(0, 6).map((product) => (
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
                            <span className="bg-surface-container-highest text-secondary px-sm py-xs rounded text-caption">
                              {product.grade || "Standard"}
                            </span>
                          </td>
                          <td className="p-md">
                            <div className="flex flex-col gap-unit">
                              <span className="font-body-md text-on-surface">
                                {product.stockKg} kg
                              </span>
                              <div className="w-24 h-1 bg-surface-variant rounded-full overflow-hidden">
                                <div
                                  className={`${product.stockKg < 15 ? "bg-error" : "bg-primary"} h-full`}
                                  style={{
                                    width: `${Math.min(100, Math.round((product.stockKg / 50) * 100))}%`,
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
                              onClick={() => handleEditProduct(product)}
                              className="text-secondary hover:text-primary transition-colors"
                              disabled={loading}
                            >
                              <MaterialIcon name="edit" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-secondary hover:text-error transition-colors"
                              disabled={loading}
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
        );
    }
  };

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
                  ? "bg-primary/10 text-primary border-l-4 border-primary"
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
          <div className="flex items-center justify-between">
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
            <button
              type="button"
              onClick={handleLogout}
              className="text-surface-variant hover:text-surface transition-colors p-2"
              title="Cerrar sesión"
            >
              <MaterialIcon name="logout" />
            </button>
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

        <div className="flex-1 overflow-y-auto p-lg bg-surface-container-low custom-scrollbar">
          {renderContent()}
        </div>
      </main>

      <ProductFormModal
        isOpen={showProductModal}
        onClose={() => {
          setShowProductModal(false);
          setEditingProduct(null);
        }}
        onSubmit={handleSubmitProduct}
        initialData={editingProduct ? {
          name: editingProduct.name,
          description: editingProduct.description,
          category: editingProduct.category,
          grade: editingProduct.grade || "",
          price: editingProduct.price,
          priceUnit: editingProduct.priceUnit,
          imageUrl: editingProduct.imageUrl,
          stockKg: editingProduct.stockKg,
          badges: editingProduct.grade ? [editingProduct.grade] : [],
        } : {}}
        title={editingProduct ? "Editar Producto" : "Agregar Producto"}
      />

      <div
        className={`fixed bottom-lg right-lg bg-inverse-surface text-surface px-lg py-md rounded-lg shadow-2xl flex items-center gap-md transform transition-transform duration-500 z-50 ${
          toast.show ? "translate-y-0" : "translate-y-32"
        }`}
      >
        <MaterialIcon name="check_circle" className="text-primary" />
        <span className="font-label-md">{toast.message}</span>
      </div>
    </div>
  );
}
