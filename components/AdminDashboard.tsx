"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatCOP, ORDER_STATUS_LABELS, ORDER_STATUS_BADGE } from "@/lib/utils";
import { logoutAction } from "@/lib/actions/auth-actions";
import { 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  updateOrderStatus,
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
  uploadImageAction,
} from "@/lib/actions/admin-actions";
import MaterialIcon from "./MaterialIcon";
import ProductFormModal from "./ProductFormModal";
import ConfirmModal from "./ConfirmModal";
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

type AdminCategory = {
  id: number;
  name: string;
  slug: string;
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
  categories: AdminCategory[];
  orders?: any[];
  orderItems?: Record<number, any[]>;
  customers?: any[];
  recentOrders?: any[];
};

export default function AdminDashboard({
  stats,
  products,
  categories,
  orders = [],
  orderItems = {},
  customers = [],
  recentOrders = [],
}: AdminDashboardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState({ show: false, message: "" });
  const [activeNav, setActiveNav] = useState("dashboard");
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [currentProducts, setCurrentProducts] = useState<AdminProduct[]>(products);
  const [currentCategories, setCurrentCategories] = useState<AdminCategory[]>(categories);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: React.ReactNode;
    type: "alert" | "confirm" | "info";
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "confirm"
  });

  const showAlert = (title: string, message: React.ReactNode, type: "alert" | "info" = "info") => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      type,
      onConfirm: undefined,
    });
  };

  const showToast = (message: string = "Inventario actualizado exitosamente.") => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 3000);
  };

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  const handleAddCategory = () => {
    const name = prompt("Ingrese el nombre de la nueva categoría:");
    if (!name || !name.trim()) return;

    startTransition(async () => {
      const result = await createCategoryAction(name.trim());
      if (result.success && result.category) {
        setCurrentCategories([...currentCategories, result.category]);
        showToast("Categoría creada exitosamente");
      } else {
        showToast(result.error || "Error al crear la categoría");
      }
    });
  };

  const handleEditCategory = (category: AdminCategory) => {
    const name = prompt("Ingrese el nuevo nombre para la categoría:", category.name);
    if (!name || !name.trim() || name.trim() === category.name) return;

    startTransition(async () => {
      const result = await updateCategoryAction(category.id, name.trim());
      if (result.success) {
        const slug = name
          .trim()
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");

        setCurrentCategories(currentCategories.map(c => 
          c.id === category.id ? { ...c, name: name.trim(), slug } : c
        ));
        
        // Actualizar localmente las categorías de los productos
        setCurrentProducts(currentProducts.map(p => 
          p.category === category.name ? { ...p, category: name.trim() } : p
        ));

        showToast("Categoría actualizada exitosamente");
      } else {
        showToast(result.error || "Error al actualizar la categoría");
      }
    });
  };

  const handleDeleteCategory = (category: AdminCategory) => {
    const linkedProductsCount = currentProducts.filter(p => p.category === category.name).length;
    if (linkedProductsCount > 0) {
      setConfirmModal({
        isOpen: true,
        title: "No se puede eliminar",
        message: `No se puede eliminar la categoría "${category.name}" porque tiene ${linkedProductsCount} producto(s) vinculado(s).`,
        type: "alert"
      });
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: "Eliminar Categoría",
      message: `¿Estás seguro de eliminar la categoría "${category.name}"?`,
      type: "confirm",
      onConfirm: () => {
        startTransition(async () => {
          const result = await deleteCategoryAction(category.id);
          if (result.success) {
            setCurrentCategories(currentCategories.filter(c => c.id !== category.id));
            showToast("Categoría eliminada exitosamente");
          } else {
            showToast(result.error || "Error al eliminar la categoría");
          }
        });
      }
    });
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowProductModal(true);
  };

  const handleEditProduct = (product: AdminProduct) => {
    setEditingProduct(product);
    setShowProductModal(true);
  };

  const handleDeleteProduct = (id: number) => {
    setConfirmModal({
      isOpen: true,
      title: "Eliminar Producto",
      message: "¿Estás seguro de eliminar este producto?",
      type: "confirm",
      onConfirm: () => {
        startTransition(async () => {
          try {
            await deleteProduct(id);
            setCurrentProducts(currentProducts.filter(p => p.id !== id));
            showToast("Producto eliminado exitosamente");
          } catch (error) {
            console.error("Error al eliminar producto:", error);
            showToast("Error al eliminar producto");
          }
        });
      }
    });
  };

  const handleSubmitProduct = (productData: any) => {
    startTransition(async () => {
      try {
        let finalImageUrl = productData.imageUrl;
        if (productData.imageFile) {
          const formData = new FormData();
          formData.append("file", productData.imageFile);
          
          const uploadRes = await uploadImageAction(formData);
          if (uploadRes.success) {
            finalImageUrl = uploadRes.url;
          } else {
            showToast("Error al subir imagen");
            return;
          }
        }
        
        // Remove imageFile from data sent to server actions
        const { imageFile, ...dataToSave } = productData;
        dataToSave.imageUrl = finalImageUrl;

        if (editingProduct) {
          await updateProduct(editingProduct.id, dataToSave);
          setCurrentProducts(currentProducts.map(p => 
            p.id === editingProduct.id ? { ...p, ...dataToSave } : p
          ));
          showToast("Producto actualizado exitosamente");
        } else {
          const result = await createProduct(dataToSave);
          if (result.success && result.product) {
            setCurrentProducts([...currentProducts, result.product as any]);
          }
          showToast("Producto creado exitosamente");
        }
        
        setShowProductModal(false);
        setEditingProduct(null);
      } catch (error) {
        console.error("Error al guardar producto:", error);
        showToast("Error al guardar producto");
      }
    });
  };

  const handleRefresh = () => {
    router.refresh();
    showToast("Datos actualizados");
  };

  // Datos de ejemplo para las secciones (en un proyecto real estos vendrían de APIs)
  const [timeRange, setTimeRange] = useState<"week" | "month" | "quarter" | "year">("month");
  
  // Datos para la sección de clientes
  const customerData = customers;
  const recentOrdersData = recentOrders;

  // Datos para la sección de pedidos
  const ordersData = orders;
  const orderItemsData = orderItems;

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

  const handleUpdateOrderStatus = (orderId: number, newStatus: string) => {
    startTransition(async () => {
      try {
        await updateOrderStatus(orderId, newStatus);
        showToast(`Estado del pedido actualizado a: ${newStatus}`);
      } catch (error) {
        console.error("Error al actualizar estado:", error);
        showToast("Error al actualizar estado del pedido");
      }
    });
  };

  const renderContent = () => {
    switch (activeNav) {
      case "inventory":
        return (
          <InventorySection
            products={currentProducts}
            onEditProduct={handleEditProduct}
            onDeleteProduct={handleDeleteProduct}
            onAddProduct={handleAddProduct}
            loading={isPending}
            onShowAlert={showAlert}
          />
        );
      
      case "categories":
        return (
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-variant/10 overflow-hidden">
            <div className="p-lg border-b border-surface-variant/10 flex justify-between items-center">
              <h2 className="font-headline-md text-headline-md text-on-surface">
                Gestión de Categorías
              </h2>
              <button
                type="button"
                onClick={handleAddCategory}
                className="bg-primary text-on-primary px-lg py-sm rounded-lg font-label-md text-label-md hover:bg-primary-container transition-colors flex items-center gap-sm"
                disabled={isPending}
              >
                <MaterialIcon name="add" className="text-[20px]" /> Agregar Categoría
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container-low border-b border-surface-variant/10">
                  <tr>
                    <th className="p-md font-label-md text-label-md text-secondary">
                      Nombre de la Categoría
                    </th>
                    <th className="p-md font-label-md text-label-md text-secondary">
                      Slug
                    </th>
                    <th className="p-md font-label-md text-label-md text-secondary">
                      Productos Vinculados
                    </th>
                    <th className="p-md font-label-md text-label-md text-secondary text-right">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-variant/10">
                  {currentCategories.map((category) => {
                    const productCount = currentProducts.filter(
                      (p) => p.category === category.name
                    ).length;
                    return (
                      <tr
                        key={category.id}
                        className="hover:bg-surface-container-low transition-colors"
                      >
                        <td className="p-md font-headline-md text-body-md text-on-surface">
                          {category.name}
                        </td>
                        <td className="p-md font-body-md text-secondary">
                          {category.slug}
                        </td>
                        <td className="p-md font-body-md text-on-surface">
                          <span className="bg-surface-container-highest text-secondary px-sm py-xs rounded text-caption">
                            {productCount} {productCount === 1 ? 'producto' : 'productos'}
                          </span>
                        </td>
                        <td className="p-md text-right space-x-md">
                          <button
                            type="button"
                            onClick={() => handleEditCategory(category)}
                            className="text-secondary hover:text-primary transition-colors"
                            disabled={isPending}
                            title="Editar nombre"
                          >
                            <MaterialIcon name="edit" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(category)}
                            className="text-secondary hover:text-error transition-colors"
                            disabled={isPending}
                            title="Eliminar categoría"
                          >
                            <MaterialIcon name="delete" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      
      case "customers":
        return (
          <CustomersSection
            customers={customerData}
            recentOrders={recentOrdersData}
            onShowAlert={showAlert}
          />
        );
      
      case "orders":
        return (
          <OrdersSection
            orders={ordersData}
            orderItems={orderItemsData}
            onUpdateStatus={handleUpdateOrderStatus}
            loading={isPending}
            onShowAlert={showAlert}
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
                    Pedidos Recientes
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveNav("orders")}
                    className="bg-primary text-on-primary px-lg py-sm rounded-lg font-label-md text-label-md hover:bg-primary-container transition-colors flex items-center gap-sm"
                  >
                    <MaterialIcon name="shopping_bag" className="text-[20px]" />
                    Ver Todos los Pedidos
                  </button>
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
                        <th className="p-md font-label-md text-label-md text-secondary text-right">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-variant/10">
                      {orders.slice(0, 6).map((order) => (
                        <tr
                          key={order.id}
                          className="hover:bg-surface-container-low transition-colors"
                        >
                          <td className="p-md font-bold text-on-surface">
                            {order.orderNumber}
                          </td>
                          <td className="p-md">
                            <div className="font-body-md text-on-surface">
                              {order.customerName}
                            </div>
                            <div className="text-caption text-secondary">
                              {order.customerEmail}
                            </div>
                          </td>
                          <td className="p-md text-secondary text-caption">
                            {new Date(order.createdAt).toLocaleDateString("es-MX", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </td>
                          <td className="p-md">
                            <span
                              className={`px-sm py-xs rounded-full text-[10px] font-bold ${
                                ORDER_STATUS_BADGE[order.status] ?? "bg-surface-container-highest text-secondary"
                              }`}
                            >
                              {ORDER_STATUS_LABELS[order.status] || order.status}
                            </span>
                          </td>
                          <td className="p-md text-right font-bold text-primary font-body-md">
                            {formatCOP(order.total)}
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
                    Productos Más Vendidos
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
                © 2024 Super Carnes La Victoriana. Panel de Administración v2.4.1
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
            { id: "categories", icon: "category", label: "Categorías" },
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
              disabled={isPending}
              className="text-surface-variant hover:text-surface transition-colors p-2 disabled:opacity-50"
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
            <Link
              href="/"
              className="flex items-center gap-xs text-secondary hover:text-primary transition-colors font-label-md text-label-md border border-outline-variant/30 rounded-lg px-md py-xs bg-surface-container-low"
            >
              <MaterialIcon name="store" className="text-[20px]" />
              <span>Volver a la tienda</span>
            </Link>
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
        categoriesList={currentCategories.map(c => c.name)}
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

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
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
