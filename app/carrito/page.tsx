import CartCheckout from "@/components/CartCheckout";
import Footer from "@/components/Footer";
import TopNavBar from "@/components/TopNavBar";
import { ensureDb } from "@/lib/api";
import { getCartSessionId, getSession } from "@/lib/auth";
import { getCartCount, getCartItemsForUser } from "@/lib/cart-helpers";

export default async function CarritoPage() {
  await ensureDb();
  const session = await getSession();
  const cartSessionId = await getCartSessionId();
  const cartCount = await getCartCount(session, cartSessionId);
  const items = await getCartItemsForUser(session, cartSessionId);

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const shipping = subtotal > 0 ? 150 : 0;
  const total = subtotal + shipping;

  return (
    <>
      <TopNavBar cartCount={cartCount} showSearch={false} />
      <main className="pt-20 pb-xl max-w-container-max mx-auto px-lg">
        {/* <header className="mb-lg">
          <h1 className="font-display-lg text-display-lg text-on-surface mb-sm">
            Finalizar Compra Artesanal
          </h1>
          <p className="font-body-lg text-body-lg text-secondary">
            Finaliza tu selección de cortes premium con envío refrigerado.
          </p>
        </header> */}
        {items.length === 0 ? (
          <div className="text-center py-xl bg-surface-container-lowest rounded-xl">
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
          <CartCheckout
            items={items}
            subtotal={subtotal}
            shipping={shipping}
            total={total}
          />
        )}
      </main>
      <Footer variant="default" />
    </>
  );
}
