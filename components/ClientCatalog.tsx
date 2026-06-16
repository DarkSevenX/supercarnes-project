"use client";

import { useState, useEffect, useMemo } from "react";
import ProductCard from "./ProductCard";
import ClientCatalogFilters from "./ClientCatalogFilters";

type Product = {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  priceUnit: string;
  imageUrl: string;
  badges: string | null;
  cutType?: string | null;
  grade?: string | null;
  subcategory?: string | null;
};

type ClientCatalogProps = {
  initialProducts: Product[];
  initialSearch?: string;
};

export default function ClientCatalog({ initialProducts, initialSearch = "" }: ClientCatalogProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(initialProducts);
  
  // Estados para los filtros - empezar sin filtros
  const [categories, setCategories] = useState<string[]>([]);
  const [cuts, setCuts] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(5000000);
  const [searchTerm, setSearchTerm] = useState<string>(initialSearch);

  // Aplicar filtros cuando cambien
  useEffect(() => {
    let result = [...products];
    
    // Filtrar por categorías
    if (categories.length > 0) {
      result = result.filter(product => {
        // Si la categoría del producto es null/undefined, no filtrarlo
        if (!product.category) return true;
        return categories.includes(product.category);
      });
    }
    
    // Filtrar por cortes usando cutType
    if (cuts.length > 0) {
      result = result.filter(product => {
        if (!product.cutType) return false;
        return cuts.some(cut => product.cutType?.toLowerCase().includes(cut.toLowerCase()));
      });
    }
    
    // Filtrar por precio máximo
    result = result.filter(product => product.price <= maxPrice);
    
    // Filtrar por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(product => 
        product.name.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term)
      );
    }
    
    setFilteredProducts(result);
  }, [products, categories, cuts, maxPrice, searchTerm]);

  const handleCategoryToggle = (category: string) => {
    setCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  const handleCutToggle = (cut: string) => {
    setCuts(prev => {
      if (prev.includes(cut)) {
        return prev.filter(c => c !== cut);
      } else {
        return [...prev, cut];
      }
    });
  };

  const handlePriceChange = (price: number) => {
    setMaxPrice(price);
  };

  // Escuchar cambios en la URL para actualizar búsqueda
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleUrlChange = () => {
      const params = new URLSearchParams(window.location.search);
      const searchParam = params.get("search") || "";
      if (searchParam !== searchTerm) {
        setSearchTerm(searchParam);
      }
    };
    
    // Verificar inicialmente
    handleUrlChange();
    
    // Escuchar eventos de popstate (cuando cambia la URL con history API)
    window.addEventListener('popstate', handleUrlChange);
    
    // También verificar periódicamente (para cambios con replaceState)
    const interval = setInterval(handleUrlChange, 100);
    
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      clearInterval(interval);
    };
  }, [searchTerm]);

  // Extraer categorías únicas de los productos
  const availableCategories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return Array.from(cats);
  }, [products]);

  return (
    <div className="flex flex-col lg:flex-row">
      <div className="lg:w-64 flex-shrink-0">
        <ClientCatalogFilters 
          categories={categories}
          cuts={cuts}
          maxPrice={maxPrice}
          availableCategories={availableCategories}
          onCategoryToggle={handleCategoryToggle}
          onCutToggle={handleCutToggle}
          onPriceChange={handlePriceChange}
        />
      </div>
      
      <div className="flex-1 lg:pl-lg">
        <div className="flex justify-between items-center mb-lg border-b border-surface-container-highest pb-md">
          <p className="font-body-md text-secondary">
            <span className="font-bold text-on-surface">{filteredProducts.length}</span>{" "}
            Productos Premium Encontrados
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-lg">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              category={product.category}
              description={product.description}
              price={product.price}
              priceUnit={product.priceUnit}
              imageUrl={product.imageUrl}
              badges={product.badges}
            />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-body-lg text-secondary">
              No se encontraron productos con los filtros seleccionados.
            </p>
            <button
              onClick={() => {
                setCategories([]);
                setCuts([]);
                setMaxPrice(5000000);
                setSearchTerm("");
                // También limpiar la URL
                if (typeof window !== 'undefined') {
                  const params = new URLSearchParams(window.location.search);
                  params.delete("search");
                  window.history.replaceState(null, "", `/?${params.toString()}`);
                }
              }}
              className="mt-4 px-6 py-2 bg-primary text-on-primary rounded-lg hover:bg-primary-container transition-colors"
            >
              Restablecer filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}