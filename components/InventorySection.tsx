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
  badges?: string | null;
};

type InventorySectionProps = {
  products: AdminProduct[];
  onEditProduct: (product: AdminProduct) => void;
  onDeleteProduct: (id: number) => void;
  onAddProduct: () => void;
  loading: boolean;
  onShowAlert?: (title: string, message: React.ReactNode) => void;
};

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

const stockPercent = (kg: number) => Math.min(100, Math.round((kg / 50) * 100));

export default function InventorySection({
  products,
  onEditProduct,
  onDeleteProduct,
  onAddProduct,
  loading,
  onShowAlert,
}: InventorySectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  const categories = ["all", ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products
    .filter(product => {
      if (selectedCategory !== "all" && product.category !== selectedCategory) return false;
      if (!searchTerm) return true;
      
      const searchLower = searchTerm.toLowerCase();
      return (
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        (product.grade && product.grade.toLowerCase().includes(searchLower))
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name": return a.name.localeCompare(b.name);
        case "price_asc": return a.price - b.price;
        case "price_desc": return b.price - a.price;
        case "stock_asc": return a.stockKg - b.stockKg;
        case "stock_desc": return b.stockKg - a.stockKg;
        default: return 0;
      }
    });

  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stockKg), 0);
  const lowStockCount = products.filter(p => p.stockKg < 15).length;
  const outOfStockCount = products.filter(p => p.stockKg === 0).length;

  return (
    <div className="space-y-xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
        <div className="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-surface-variant/10">
          <div className="flex justify-between items-center mb-md">
            <div>
              <p className="text-secondary font-label-md text-label-md uppercase tracking-wider">
                Valor Total del Inventario
              </p>
              <h3 className="font-headline-lg text-headline-lg mt-unit text-on-surface">
                {formatCOP(totalValue)}
              </h3>
            </div>
            <div className="p-sm bg-primary/10 rounded-lg text-primary">
              <MaterialIcon name="inventory" />
            </div>
          </div>
          <p className="text-caption text-secondary">
            {products.length} productos en inventario
          </p>
        </div>

        <div className="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-surface-variant/10">
          <div className="flex justify-between items-center mb-md">
            <div>
              <p className="text-secondary font-label-md text-label-md uppercase tracking-wider">
                Stock Bajo
              </p>
              <h3 className="font-headline-lg text-headline-lg mt-unit text-on-surface">
                {lowStockCount}
              </h3>
            </div>
            <div className="p-sm bg-error/10 rounded-lg text-error">
              <MaterialIcon name="warning" />
            </div>
          </div>
          <p className="text-caption text-secondary">
            Necesitan reabastecimiento
          </p>
        </div>

        <div className="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-surface-variant/10">
          <div className="flex justify-between items-center mb-md">
            <div>
              <p className="text-secondary font-label-md text-label-md uppercase tracking-wider">
                Sin Stock
              </p>
              <h3 className="font-headline-lg text-headline-lg mt-unit text-on-surface">
                {outOfStockCount}
              </h3>
            </div>
            <div className="p-sm bg-error/10 rounded-lg text-error">
              <MaterialIcon name="block" />
            </div>
          </div>
          <p className="text-caption text-secondary">
            Requieren atención inmediata
          </p>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-variant/10 overflow-hidden">
        <div className="p-lg border-b border-surface-variant/10 flex flex-col md:flex-row justify-between items-center gap-md">
          <div className="flex items-center gap-md">
            <h2 className="font-headline-md text-headline-md text-on-surface">
              Gestión de Inventario
            </h2>
            <button
              type="button"
              onClick={onAddProduct}
              className="bg-primary text-on-primary px-lg py-sm rounded-lg font-label-md text-label-md hover:bg-primary-container transition-colors flex items-center gap-sm cursor-pointer"
            >
              <MaterialIcon name="add" className="text-[20px]" /> Agregar Producto
            </button>
          </div>
          
          <div className="flex flex-wrap gap-sm w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <MaterialIcon name="search" className="absolute left-sm top-1/2 transform -translate-y-1/2 text-secondary" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-lg pr-sm py-sm bg-surface-container rounded-lg w-full md:w-64"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-sm py-sm bg-surface-container rounded-lg"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === "all" ? "Todas las categorías" : cat}
                </option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-sm py-sm bg-surface-container rounded-lg"
            >
              <option value="name">Ordenar por: Nombre</option>
              <option value="price_asc">Precio: Menor a Mayor</option>
              <option value="price_desc">Precio: Mayor a Menor</option>
              <option value="stock_asc">Stock: Menor a Mayor</option>
              <option value="stock_desc">Stock: Mayor a Menor</option>
            </select>
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
                  Categoría
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
              {filteredProducts.map((product) => (
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
                      <p className="text-caption text-secondary line-clamp-1">
                        {product.description}
                      </p>
                    </div>
                  </td>
                  <td className="p-md">
                    <span className="bg-surface-container-highest text-secondary px-sm py-xs rounded text-caption">
                      {product.category}
                    </span>
                  </td>
                  <td className="p-md">
                    <div className="flex flex-col gap-unit">
                      <span className={`font-body-md ${product.stockKg < 15 ? "text-error" : "text-on-surface"}`}>
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
                      onClick={() => onEditProduct(product)}
                      className="text-secondary hover:text-primary transition-colors"
                      disabled={loading}
                    >
                      <MaterialIcon name="edit" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteProduct(product.id)}
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

        {filteredProducts.length === 0 && (
          <div className="p-xl text-center text-secondary">
            <MaterialIcon name="search_off" className="text-4xl mb-md mx-auto" />
            <p className="font-body-lg">No se encontraron productos</p>
            <p className="text-caption mt-sm">Intenta con otros filtros de búsqueda</p>
          </div>
        )}

        <div className="p-lg border-t border-surface-variant/10 flex justify-between items-center text-secondary">
          <p className="text-caption">
            Mostrando {filteredProducts.length} de {products.length} productos
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
              onClick={() => {
                if (onShowAlert) onShowAlert("En Desarrollo", "Función de exportar no implementada aún");
                else alert("Función de exportar no implementada aún");
              }}
            >
              <MaterialIcon name="download" className="inline mr-xs" />
              Exportar CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}