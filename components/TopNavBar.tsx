"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import MaterialIcon from "./MaterialIcon";

type TopNavBarProps = {
  activeLink?: "shop" | "auth" | "carrito" | "perfil";
  cartCount?: number;
  showSearch?: boolean;
};

const navLinks = [
  { key: "shop", label: "Tienda", href: "/" },
  { key: "categories", label: "Categorías", href: "/" },
  { key: "story", label: "Nuestra Historia", href: "/" },
  { key: "contact", label: "Contacto", href: "/" },
];

export default function TopNavBar({
  activeLink,
  cartCount = 0,
  showSearch = true,
}: TopNavBarProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");

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
      <div className="max-w-container-max mx-auto flex justify-between items-center px-lg py-md h-20">
        <Link href="/" className="flex items-center gap-md">
          <Image
            alt="La Victoriana Logo"
            className="h-12 w-12 object-contain"
            src="/logotipo.png"
            width={48}
            height={48}
          />
          <span className="font-headline-md text-headline-md font-bold text-primary">
            Super Carnes La Victoriana
          </span>
        </Link>

        <div className="hidden md:flex gap-lg items-center">
          {navLinks.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              className={
                activeLink === "shop" && link.key === "shop"
                  ? "text-primary font-bold border-b-2 border-primary pb-1 font-label-md cursor-pointer active:scale-95 transition-colors duration-200"
                  : "text-secondary hover:text-primary font-label-md cursor-pointer active:scale-95 transition-colors duration-200"
              }
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-md">
          {showSearch && (
            <form
              onSubmit={handleSearch}
              className="relative hidden lg:block"
            >
              <input
                className="bg-surface-container-low border-none rounded-full pl-lg pr-10 py-xs text-body-md w-64 focus:ring-1 focus:ring-primary"
                placeholder="Buscar..."
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    const params = new URLSearchParams(window.location.search);
                    params.delete("search");
                    window.history.replaceState(null, "", `/?${params.toString()}`);
                    router.refresh();
                  }}
                  className="absolute right-10 top-1/2 -translate-y-1/2 text-secondary hover:text-primary"
                >
                  <MaterialIcon name="close" />
                </button>
              )}
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-primary"
              >
                <MaterialIcon name="search" />
              </button>
            </form>
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
          <Link
            href="/carrito"
            className="flex items-center p-sm text-secondary hover:text-primary transition-colors cursor-pointer active:scale-95 relative"
          >
            <MaterialIcon name="shopping_cart" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 bg-primary text-on-primary text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}