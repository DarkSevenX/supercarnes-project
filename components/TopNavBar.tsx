"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      // Ignorar si no está visible y no hay término de búsqueda
      if (!isSearchVisible && search === "") return;

      const params = new URLSearchParams(window.location.search);
      const currentQuery = params.get("search") || "";

      // Si no ha cambiado, no hacer nada
      if (search.trim() === currentQuery && window.location.pathname === "/") return;

      if (search.trim()) {
        params.set("search", search.trim());
      } else {
        params.delete("search");
      }
      params.delete("page");

      const newQueryString = params.toString();

      if (window.location.pathname !== "/") {
        router.push(`/?${newQueryString}`);
      } else {
        window.history.replaceState(null, "", `/?${newQueryString}`);
        router.refresh();
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, router, isSearchVisible]);

  const toggleSearch = () => {
    setIsSearchVisible(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleBlur = () => {
    if (!search.trim()) {
      setTimeout(() => setIsSearchVisible(false), 200);
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-surface shadow-sm border-b border-surface-container-highest">
      <div className="w-full flex justify-between items-center px-lg py-sm h-16">
        <Link href="/" className="flex items-center gap-md">
          <Image
            alt="La Victoriana Logo"
            className="h-12 w-12 object-cover rounded-full"
            src="/logotipo.jpeg"
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
              <div
                className={`relative flex items-center transition-all duration-300 ease-out ${isSearchVisible ? "w-64" : "w-10"
                  }`}
              >
                <input
                  ref={inputRef}
                  className={`border-none outline-none focus:outline-none focus:ring-0 focus:border-transparent rounded-full py-xs text-body-md h-10 transition-all duration-300 ${isSearchVisible
                      ? "w-full pl-lg pr-10 opacity-100 bg-surface-container-low"
                      : "w-full px-0 opacity-0 bg-transparent cursor-pointer"
                    }`}
                  placeholder="Buscar..."
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onBlur={handleBlur}
                  onClick={() => !isSearchVisible && toggleSearch()}
                  readOnly={!isSearchVisible}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (isSearchVisible) {
                      if (search) setSearch("");
                      else setIsSearchVisible(false);
                    } else {
                      toggleSearch();
                    }
                  }}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-secondary hover:text-primary transition-colors p-2 flex items-center justify-center cursor-pointer"
                >
                  <MaterialIcon name={isSearchVisible && search ? "close" : "search"} className={isSearchVisible && search ? "text-[18px]" : ""} />
                </button>
              </div>
            </div>
          )}
          <Link
            href="/perfil"
            className={`flex items-center p-sm transition-colors cursor-pointer active:scale-95 ${activeLink === "perfil"
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