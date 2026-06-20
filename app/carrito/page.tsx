import CartCheckout from "@/components/CartCheckout";
import Footer from "@/components/Footer";
import TopNavBar from "@/components/TopNavBar";
import { ensureDb } from "@/lib/api";
import { getCartSessionId, getSession } from "@/lib/auth";
import { getCartCount, getCartItemsForUser } from "@/lib/cart-helpers";
import { redirect } from "next/navigation";

export default async function CarritoPage() {
  await ensureDb();
  const session = await getSession();
  if (session && session.role === "admin") {
    redirect("/admin");
  }

  const cartSessionId = await getCartSessionId();
  const cartCount = await getCartCount(session, cartSessionId);
  const items = await getCartItemsForUser(session, cartSessionId);

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const shipping = subtotal > 0 ? 150 : 0;
  const total = subtotal + shipping;

  // Generamos una referencia única usando la fecha actual para el control de Wompi
  const orderReference = `VICTORIANA-${Date.now()}`;

  return (
    <div className="min-h-screen flex flex-col">
      <TopNavBar cartCount={cartCount} showSearch={false} />
      <main className="flex-grow pt-20 pb-xl max-w-container-max mx-auto px-lg">
        {items.length === 0 ? (
          <div className="text-center py-xl bg-surface-container-lowest rounded-xl flex flex-col justify-center items-center min-h-[calc(100vh-20rem)]">
            <p className="font-body-lg text-secondary mb-md">
              Tu carrito está vacío.
            </p>
            <a
              href="/"
              className="inline-block bg-primary text-on-primary px-xl py-md rounded-lg font-label-md hover:bg-primary-container transition-colors"
            >
              Explorar catálogo
            </a>
          </div>
        ) : (
          /* Pasamos el total y la referencia de forma directa y limpia */
          <CartCheckout
            items={items}
            subtotal={subtotal}
            shipping={shipping}
            total={total}
            isLoggedIn={!!session}
            orderReference={orderReference}
          />
        )}
      </main>
      <Footer variant="default" />
    </div>
  );
}