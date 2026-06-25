import ProfileContent from "@/components/ProfileContent";
import Footer from "@/components/Footer";
import TopNavBar from "@/components/TopNavBar";
import { ensureDb } from "@/lib/api";
import { getCartSessionId, getSession } from "@/lib/auth";
import { getCartCount } from "@/lib/cart-helpers";
import { db } from "@/lib/db";
import {
  addresses,
  orderItems,
  orders,
  paymentMethods,
  users,
} from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function PerfilPage() {
  await ensureDb();
  const session = await getSession();
  if (!session) redirect("/auth");
  if (session.role === "admin") redirect("/admin");

  const cartSessionId = await getCartSessionId();
  const cartCount = await getCartCount(session, cartSessionId);

  const [user] = await db
    .select({
      name: users.name,
      email: users.email,
      avatarUrl: users.avatarUrl,
      memberSince: users.memberSince,
      loyaltyPoints: users.loyaltyPoints,
    })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  if (!user) redirect("/auth");

  const userOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, session.userId))
    .orderBy(desc(orders.createdAt));

  const ordersWithMeta = await Promise.all(
    userOrders.map(async (order) => {
      const items = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id));
      return {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.total,
        createdAt: order.createdAt,
        paymentMethod: order.paymentMethod,
        itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
        imageUrl: items[0]?.productImage ?? null,
      };
    }),
  );

  const userAddresses = await db
    .select()
    .from(addresses)
    .where(eq(addresses.userId, session.userId));

  const userPayments = await db
    .select()
    .from(paymentMethods)
    .where(eq(paymentMethods.userId, session.userId));

  return (
    <div className="min-h-screen flex flex-col">
      <TopNavBar activeLink="perfil" cartCount={cartCount} />
      <main className="flex-grow pt-24 pb-xl max-w-container-max mx-auto px-lg">
        <ProfileContent
          user={user}
          orders={ordersWithMeta}
          addresses={userAddresses}
          payments={userPayments}
        />
      </main>
      <Footer variant="profile" />
    </div>
  );
}
