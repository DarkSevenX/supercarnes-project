"use client";

import { useState } from "react";
import { CUT_TYPES, GRADES } from "@/lib/utils";
import MaterialIcon from "./MaterialIcon";

type ProductFormData = {
  name: string;
  description: string;
  category: string;
  cutType: string;
  grade: string;
  price: number;
  priceUnit: string;
  imageUrl: string;
  stockKg: number;
  badges: string[];
};

type ProductFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => void;
  initialData?: Partial<ProductFormData>;
  title?: string;
  categoriesList: string[];
};

const PRICE_UNITS = ["kg", "lb", "unidad", "12oz"];

export default function ProductFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = {},
  title = "Agregar Producto",
  categoriesList = [],
}: ProductFormModalProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: initialData.name || "",
    description: initialData.description || "",
    category: initialData.category || (categoriesList.length > 0 ? categoriesList[0] : ""),
    cutType: initialData.cutType || CUT_TYPES[0],
    grade: initialData.grade || GRADES[0],
    price: initialData.price || 0,
    priceUnit: initialData.priceUnit || "kg",
    imageUrl: initialData.imageUrl || "",
    stockKg: initialData.stockKg || 0,
    badges: initialData.badges || [],
  });

  const [loading, setLoading] = useState(false);
  const [badgeInput, setBadgeInput] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Error al enviar formulario:", error);
    } finally {
      setLoading(false);
    }
  };

  const addBadge = () => {
    if (badgeInput.trim() && !formData.badges.includes(badgeInput.trim())) {
      setFormData({
        ...formData,
        badges: [...formData.badges, badgeInput.trim()],
      });
      setBadgeInput("");
    }
  };

  const removeBadge = (badge: string) => {
    setFormData({
      ...formData,
      badges: formData.badges.filter((b) => b !== badge),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-surface-container-lowest rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-lg border-b border-surface-container">
          <div className="flex justify-between items-center">
            <h2 className="font-headline-lg text-headline-lg text-on-surface">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-secondary hover:text-on-surface transition-colors"
            >
              <MaterialIcon name="close" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-lg space-y-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
            <div>
              <label className="block text-label-md text-secondary mb-2">
                Nombre del Producto *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-sm border border-outline rounded-lg bg-surface-container"
                placeholder="Ej: Ribeye Premium"
              />
            </div>

            <div>
              <label className="block text-label-md text-secondary mb-2">
                Precio (COP) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="1"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full p-sm border border-outline rounded-lg bg-surface-container"
                placeholder="Ej: 50000"
              />
            </div>

            <div>
              <label className="block text-label-md text-secondary mb-2">
                Categoría *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-sm border border-outline rounded-lg bg-surface-container"
              >
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>





            <div>
              <label className="block text-label-md text-secondary mb-2">
                Unidad de Precio
              </label>
              <select
                value={formData.priceUnit}
                onChange={(e) => setFormData({ ...formData, priceUnit: e.target.value })}
                className="w-full p-sm border border-outline rounded-lg bg-surface-container"
              >
                {PRICE_UNITS.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-label-md text-secondary mb-2">
                URL de Imagen
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full p-sm border border-outline rounded-lg bg-surface-container"
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </div>

            <div>
              <label className="block text-label-md text-secondary mb-2">
                Stock (kg)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={formData.stockKg}
                onChange={(e) => setFormData({ ...formData, stockKg: Number(e.target.value) })}
                className="w-full p-sm border border-outline rounded-lg bg-surface-container"
                placeholder="Ej: 10.5"
              />
            </div>
          </div>

          <div>
            <label className="block text-label-md text-secondary mb-2">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-sm border border-outline rounded-lg bg-surface-container min-h-[100px]"
              placeholder="Descripción detallada del producto..."
            />
          </div>

          <div>
            <label className="block text-label-md text-secondary mb-2">
              Badges/Etiquetas
            </label>
            <div className="flex gap-sm mb-md">
              <input
                type="text"
                value={badgeInput}
                onChange={(e) => setBadgeInput(e.target.value)}
                className="flex-1 p-sm border border-outline rounded-lg bg-surface-container"
                placeholder="Ej: Premium, Dry-Aged"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addBadge())}
              />
              <button
                type="button"
                onClick={addBadge}
                className="bg-primary text-on-primary px-lg py-sm rounded-lg hover:bg-primary-container transition-colors"
              >
                Agregar
              </button>
            </div>
            <div className="flex flex-wrap gap-sm">
              {formData.badges.map((badge) => (
                <span
                  key={badge}
                  className="bg-primary-container text-on-primary-container px-sm py-xs rounded-lg flex items-center gap-xs"
                >
                  {badge}
                  <button
                    type="button"
                    onClick={() => removeBadge(badge)}
                    className="text-on-primary-container hover:text-error"
                  >
                    <MaterialIcon name="close" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-md pt-lg border-t border-surface-container">
            <button
              type="button"
              onClick={onClose}
              className="px-lg py-sm border border-outline rounded-lg text-on-surface hover:bg-surface-container transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-primary text-on-primary px-lg py-sm rounded-lg hover:bg-primary-container transition-colors flex items-center gap-sm"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="animate-spin">
                    <MaterialIcon name="refresh" />
                  </span>
                  Procesando...
                </>
              ) : (
                <>
                  <MaterialIcon name="check" />
                  Guardar Producto
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}