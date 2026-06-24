import Footer from "@/components/Footer";
import TopNavBar from "@/components/TopNavBar";
import ClientCatalog from "@/components/ClientCatalog";
import { ensureDb } from "@/lib/api";
import { getCartSessionId, getSession } from "@/lib/auth";
import { getCartCount } from "@/lib/cart-helpers";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { redirect } from "next/navigation";

type PageProps = {
  searchParams: Promise<{
    search?: string;
  }>;
};

export default async function CatalogPage({ searchParams }: PageProps) {
  await ensureDb();
  const session = await getSession();
  const cartSessionId = await getCartSessionId();
  const cartCount = await getCartCount(session, cartSessionId);

  // Obtener parámetros de búsqueda
  const params = await searchParams;
  const initialSearch = params.search || "";

  // Obtener TODOS los productos de una vez
  const allProducts = await db.select().from(products);

  return (
    <div className="min-h-screen flex flex-col">
      <TopNavBar activeLink="shop" cartCount={cartCount} />
      <main className="flex-grow pt-24 pb-xl max-w-container-max w-full mx-auto px-lg">
        <ClientCatalog initialProducts={allProducts} initialSearch={initialSearch} />
      </main>
      {/* <Footer variant="default" /> */}
    </div>
  );
}