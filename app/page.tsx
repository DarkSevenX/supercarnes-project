import Link from "next/link";
import { Suspense } from "react";
import CatalogFilters from "@/components/CatalogFilters";
import CatalogSort from "@/components/CatalogSort";
import Footer from "@/components/Footer";
import MaterialIcon from "@/components/MaterialIcon";
import ProductCard from "@/components/ProductCard";
import TopNavBar from "@/components/TopNavBar";
import { ensureDb } from "@/lib/api";
import { getCartSessionId, getSession } from "@/lib/auth";
import { getCartCount } from "@/lib/cart-helpers";
import { queryProducts } from "@/lib/products-query";

type PageProps = {
  searchParams: Promise<{
    category?: string;
    cut?: string;
    grade?: string;
    search?: string;
    sort?: string;
    maxPrice?: string;
    page?: string;
  }>;
};

function buildPageUrl(
  searchParams: Record<string, string | undefined>,
  page: number,
) {
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value && key !== "page") params.set(key, value);
  });
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/?${qs}` : "/";
}

export default async function CatalogPage({ searchParams }: PageProps) {
  await ensureDb();
  const params = await searchParams;
  const session = await getSession();
  const cartSessionId = await getCartSessionId();
  const cartCount = await getCartCount(session, cartSessionId);

  const page = Math.max(1, Number(params.page ?? 1));
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : undefined;

  const { items, total, totalPages } = await queryProducts({
    category: params.category,
    cut: params.cut,
    grade: params.grade,
    search: params.search,
    sort: params.sort,
    maxPrice,
    page,
  });

  const filterParams = {
    category: params.category,
    cut: params.cut,
    grade: params.grade,
    search: params.search,
    sort: params.sort,
    maxPrice: params.maxPrice,
  };

  return (
    <>
      <TopNavBar activeLink="shop" cartCount={cartCount} />
      <main className="pt-32 pb-xl max-w-container-max mx-auto px-lg">
        {/* <section className="mb-xl">
          <h1 className="font-display-lg text-display-lg text-on-surface mb-sm">
            Carnicería Artesanal Maestra
          </h1>
          <p className="font-body-lg text-body-lg text-secondary max-w-2xl">
            Descubre nuestra selección curada de cortes premium de origen ético.
            Desde Wagyu añejado hasta costillas artesanales, cada pieza es cortada con
            precisión quirúrgica por nuestros maestros carniceros.
          </p>
        </section> */}

        <div className="flex flex-col lg:flex-row gap-lg">
          <Suspense fallback={<div className="w-full lg:w-64" />}>
            <CatalogFilters />
          </Suspense>

          <div className="flex-1">
            <div className="flex justify-between items-center mb-lg border-b border-surface-container-highest pb-md">
              <p className="font-body-md text-secondary">
                <span className="font-bold text-on-surface">{total}</span>{" "}
                Productos Premium Encontrados
              </p>
              <Suspense fallback={null}>
                <CatalogSort />
              </Suspense>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-lg">
              {items.map((product) => (
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

              {/* <div className="bg-primary-container text-on-primary-container rounded-lg p-lg flex flex-col justify-center items-center text-center product-card-shadow relative overflow-hidden group">
                <MaterialIcon
                  name="restaurant_menu"
                  className="text-[48px] mb-md"
                  fill
                />
                <h3 className="font-headline-lg text-headline-lg mb-sm">
                  Cortes Artesanales Personalizados
                </h3>
                <p className="text-body-md mb-lg">
                  ¿Necesitas un grosor específico o un corte especial con hueso? Habla
                  directamente con nuestros maestros carniceros.
                </p>
                <button
                  type="button"
                  className="bg-surface text-primary px-xl py-md rounded-lg font-bold hover:bg-on-primary hover:text-primary transition-all cursor-pointer"
                >
                  Solicitar Corte Personalizado
                </button>
              </div> */}
            </div>

            {totalPages > 1 && (
              <nav className="flex justify-center items-center gap-sm mt-xl">
                {page > 1 && (
                  <Link
                    href={buildPageUrl(filterParams, page - 1)}
                    className="px-md py-sm rounded-lg border border-surface-container-highest text-secondary hover:text-primary transition-colors"
                  >
                    Anterior
                  </Link>
                )}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <Link
                      key={p}
                      href={buildPageUrl(filterParams, p)}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg font-label-md transition-colors ${
                        p === page
                          ? "bg-primary text-on-primary"
                          : "text-secondary hover:bg-surface-container"
                      }`}
                    >
                      {p}
                    </Link>
                  ),
                )}
                {page < totalPages && (
                  <Link
                    href={buildPageUrl(filterParams, page + 1)}
                    className="px-md py-sm rounded-lg border border-surface-container-highest text-secondary hover:text-primary transition-colors"
                  >
                    Siguiente
                  </Link>
                )}
              </nav>
            )}
          </div>
        </div>
      </main>
      <Footer variant="default" />
    </>
  );
}
