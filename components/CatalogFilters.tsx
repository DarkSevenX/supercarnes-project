"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { CATEGORIES, CUT_TYPES } from "@/lib/utils";

export default function CatalogFilters() {
  const router = useRouter();
  const pathname = usePathname();
  
  // Estado local sincronizado con la URL
  const [filters, setFilters] = useState({
    categories: [""],
    cuts: ["Steak"],
    maxPrice: 5000000
  });

  // Sincronizar estado con la URL cuando cambia
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const params = new URLSearchParams(window.location.search);
    const categoryParam = params.get("category");
    const cutParam = params.get("cut");
    const maxPriceParam = params.get("maxPrice");

    setFilters({
      categories: categoryParam ? categoryParam.split(",") : ["Beef & Veal"],
      cuts: cutParam ? cutParam.split(",") : ["Steak"],
      maxPrice: maxPriceParam ? Number(maxPriceParam) : 5000000
    });
  }, []); // Solo se ejecuta una vez al montar

  // Función para actualizar la URL y el estado
  const updateFilters = useCallback((newFilters: Partial<typeof filters>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    
    const params = new URLSearchParams();
    
    if (updated.categories.length) {
      params.set("category", updated.categories.join(","));
    }
    
    if (updated.cuts.length) {
      params.set("cut", updated.cuts.join(","));
    }
    
    if (updated.maxPrice < 5000000) {
      params.set("maxPrice", String(updated.maxPrice));
    }
    
    // Usar replaceState para cambiar la URL sin recargar la página
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    window.history.replaceState(null, "", newUrl);
    
    // Forzar un refresh del router
    router.refresh();
  }, [filters, pathname, router]);

  const toggleCategory = useCallback((cat: string) => {
    const next = filters.categories.includes(cat)
      ? filters.categories.filter((c) => c !== cat)
      : [...filters.categories, cat];
    updateFilters({ categories: next });
  }, [filters.categories, updateFilters]);

  const toggleCut = useCallback((cut: string) => {
    const next = filters.cuts.includes(cut)
      ? filters.cuts.filter((c) => c !== cut)
      : [...filters.cuts, cut];
    updateFilters({ cuts: next });
  }, [filters.cuts, updateFilters]);

  const handlePriceChange = useCallback((price: number) => {
    updateFilters({ maxPrice: price });
  }, [updateFilters]);

  return (
    <aside className="w-full lg:w-64 flex-shrink-0">
      <div className="sticky top-24 space-y-lg">
        <div>
          <h3 className="font-label-md text-label-md text-on-surface uppercase tracking-wider mb-md">
            Categorías
          </h3>
          <ul className="space-y-sm">
            {CATEGORIES.map((cat) => (
              <li key={cat}>
                <label className="flex items-center gap-sm cursor-pointer group">
                  <input
                    checked={filters.categories.includes(cat)}
                    onChange={() => toggleCategory(cat)}
                    className="rounded-sm border-secondary-fixed-dim text-primary focus:ring-primary"
                    type="checkbox"
                  />
                  <span
                    className={`text-body-md transition-colors ${
                      filters.categories.includes(cat)
                        ? "text-on-surface group-hover:text-primary"
                        : "text-secondary group-hover:text-primary"
                    }`}
                  >
                    {cat}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-label-md text-label-md text-on-surface uppercase tracking-wider mb-md">
            Cortes
          </h3>
          <div className="flex flex-wrap gap-xs">
            {CUT_TYPES.map((cut) => (
              <button
                key={cut}
                type="button"
                onClick={() => toggleCut(cut)}
                className={
                  filters.cuts.includes(cut)
                    ? "bg-primary-container text-on-primary-container px-sm py-xs rounded-lg text-caption font-semibold cursor-pointer"
                    : "bg-surface-container text-on-surface-variant px-sm py-xs rounded-lg text-caption font-semibold hover:bg-primary-container hover:text-on-primary-container transition-colors cursor-pointer"
                }
              >
                {cut}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-label-md text-label-md text-on-surface uppercase tracking-wider mb-md">
            Rango de Precios
          </h3>
          <input
            className="w-full accent-primary bg-surface-container-highest h-1 rounded-full appearance-none cursor-pointer"
            type="range"
            min={0}
            max={5000000}
            value={filters.maxPrice}
            onChange={(e) => handlePriceChange(Number(e.target.value))}
          />
          <div className="flex justify-between mt-sm text-caption text-secondary">
            <span>$0</span>
            <span>$5.000.000+</span>
          </div>
        </div>
      </div>
    </aside>
  );
}