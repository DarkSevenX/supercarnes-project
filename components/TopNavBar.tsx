"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import MaterialIcon from "./MaterialIcon";
import CartSidebar from "./CartSidebar";

type TopNavBarProps = {
  activeLink?: "shop" | "auth" | "carrito" | "perfil";
  cartCount?: number;
  showSearch?: boolean;
};

const navLinks = [
  { key: "shop", label: "Tienda", href: "/" },
  { key: "contact", label: "Contacto", href: "/" },
];

export default function TopNavBar({
  activeLink,
  cartCount = 0,
  showSearch = true,
}: TopNavBarProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      // Actualizar la URL sin recargar la página
      const params = new URLSearchParams(window.location.search);
      params.set("search", search.trim());
      params.delete("page");
      window.history.replaceState(null, "", `/?${params.toString()}`);
      router.refresh(); // Forzar re-render del componente ClientCatalog
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-surface shadow-sm border-b border-surface-container-highest">
      <div className="w-full flex justify-between items-center px-lg py-sm h-16">
        <Link href="/" className="flex items-center gap-md">
          <Image
            alt="La Victoriana Logo"
            className="h-12 w-12 object-contain"
            src="/logotipo.png"
            width={48}
            height={48}
          />
          <span className="font-body-lg text-headline-md font-bold text-primary">
            Super Carnes La Victoriana
          </span>
        </Link>



        <div className="flex items-center gap-md">
          {showSearch && (
            <div className="relative hidden lg:flex items-center h-10">
              {isSearchVisible ? (
                <form
                  onSubmit={handleSearch}
                  className="relative flex items-center"
                >
                  <input
                    className="bg-surface-container-low border-none rounded-full pl-lg pr-10 py-xs text-body-md w-64 focus:ring-1 focus:ring-primary"
                    placeholder="Buscar..."
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onBlur={() => setTimeout(() => setIsSearchVisible(false), 200)}
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-primary"
                  >
                    <MaterialIcon name="search" />
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsSearchVisible(true)}
                  className="text-secondary hover:text-primary p-2 flex items-center justify-center cursor-pointer"
                >
                  <MaterialIcon name="search" />
                </button>
              )}
            </div>
          )}
          <Link
            href="/perfil"
            className={`flex items-center p-sm transition-colors cursor-pointer active:scale-95 ${
              activeLink === "perfil"
                ? "text-primary border-b-2 border-primary"
                : "text-secondary hover:text-primary"
            }`}
          >
            <MaterialIcon name="person" />
          </Link>
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center p-sm text-secondary hover:text-primary transition-colors cursor-pointer active:scale-95 relative"
          >
            <MaterialIcon name="shopping_cart" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 bg-primary text-on-primary text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
      
      <CartSidebar 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />
    </nav>
  );
}