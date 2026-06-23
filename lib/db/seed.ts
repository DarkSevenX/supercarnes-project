import bcrypt from "bcryptjs";
import { db } from "./index";
import {
  addresses,
  cartItems,
  categories,
  orderItems,
  orders,
  paymentMethods,
  products,
  users,
} from "./schema";

const IMG = {
  ribeye:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCDL8BlVZOU8LKFw8WNvvkbcMhr4hSAzonGzWavFRrtoluUIEtNUubKNiWq726u1q9g7T8GSQXQ1mZhx2jqh21Vzn8aiSKZzUMlTJQF_IWECqgVYnMHZiUPwtiI-8SynyEvlqZwtBht0qHaUp4r7ASngDwPWSQIYxsokCCPVSOSphRYGhF7imNnNm6aKRl7ndLM8DGq9jFvmpQ4M_X9_wQHmmQMDBs3vyYutF11b9wIoWw8eQd2gFYiFMJ1vzpWBO0GW9uU_eN8s4c",
  wagyu:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAmeuBnCKIddtqaxs6JOAWgJxdUkAbpOSXwSy_aGgFzlNf9u4r74l9f4_aJpAeg5YZwnPjf2ivhkoIAIzFlG4fjLpBQ7L--Wxq7mtyRXeDh9NFM0umPu36gYkCCxLkThbl5pm9Gg6sEbmez9Fj-2bOWpBEsKlA9iGMijw5pkMNq3obXwwMuX_RWeBehUmdbcLbFFlUfyV1g_I9xg84-RUQsNZgLOLe9uN3PRtVxRBSPd6Wdf86OHusG5GWtb9-T-teic3yBo2bkDco",
  brisket:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuADcLc1aehfYHKe9By0kzSsusnT8HCRQKL2UOkIl1yJBMwf9GZZslOnx5yhwqiejhb_PAZVrsWzkbOGPC4UhRLGdRPQK64y7KOeOan53y8hTA2ifjVklPT4sKy28NyXu0nmuDLVMcIXDGnEL_9nMv0oPgqybqqifNCIa4xymIZc6u2o1DSCn1QjzYHvZDjYquvpm0oR40HBS0jsZ1zzUs9ygonE00SafLwvQtOtTDQW1aSS7i2465yQJTBXu-s4h-uMQPAzN6bWoMQ",
  lamb:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBRz5i3vnHk6enBGidqbj8RZMbvVe4EMXlrrU4t2gHCSOuf_Kib7hJuRDV-KemhPXg5hDJr1gDY2Ov3KDBHWHcC6nmcztObROQglkQfF_BtgVHRuO1f-mjq6Ec2Mb2JQhr3s4c9-VeKCm_ckzDVt8Epm8mP0bz6gR6YFglxJYF0GC_Hi8TjkuKIdcvxx8Wmx2E8kgwfh2pH1orq144yxydilIUyXsnSmudQz9lxbyoGwgwYiiM_NrVZOhiYP5WtvfvmUXLd_hBc7so",
  porterhouse:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuD-PYSrdvtIqdecrGluE837jRIcP_QGNZyaZS_9dNh0dDoP_GlNAm8kvg_s8pV3VdTZOwP4a6Vmab9QCuYqo4gtgEb8_RePwPdlIVpZGbSKJtL7bn4N-oXNq3V2xOZaU0YQk4_-XPEYRLBrclpFL0ECw4QMh7rBQaUJmbmGDRXBkEulXo4WgY5R-KcRRc7i4-aXoRkg75dNM3MtaT7OXRSK2BzKw32cNFS69mHQNYVhostdAImnJTF6W7Ns9pRJSHNWNZyyWspdQ-0",
  cartRibeye:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDs6Xx6DBw6DsWzp3pxoejShU-WBTvG6dzpnBh2592Ko7BpIH78w7ovft0yJf23BSNcKxzYPo3SAjGAHKT38YwF1ZcO2Ss2Z_B9nx29eFLpPffqO32vcKp_XDa7EXMrRRKRHShrvq3wldvlgeFFKmL-otTLkJvg_oXj8xmjKQMNOG5mfQ4cRuXADZZvveELRdfnceXBtF8hKeFvUKhlFaK1z9A85QEwOeqxAoxZ8NpIqfDb9vg4raA7hqszL2CvrM7SqyMxRiB1QDc",
  cartStrip:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuA0HLMVjuLJDvYuQuxBbpZS7mvhqy7d1LQYjenDBTTqn61H9xxayoFd2ke_5nOySjLOS3BTq62nFs1iN-5sFI5iWo5R9vl3Xl5cBnyZCsEtriKP5f6evi4woBCU76nxpNwbPJLaWW4et2FO_lPZI3wR5l1oVM-ah_uIjpmSAcre2E6aLaRpFHnNI8O2J8pIP3UHinT-wNNXXFEIWWf5AudBsHCpR2_K7idMCpUWJBAjxf7wG9cnukDBUCAaVm6GeYyjzbqEfeYMfy0",
  avatar:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAtYvY_6wGhj5Oe8w5bF-avFTKL_ilHYmzWxhsFqhep_gNP5KVSwSzsREpVGOYC1FXnJcLM6FAdAR1fGbcPaM-_lW736rUQ4ps551XO5t5Y9cQfby9nT61c5Um494RTViCDTCP7CwCxwMWBIdP2-VWEvjzzfZkrkjPRECNqGfbOcL_RdKUCfyYhjWeMlZsgE7f1GD9LDcyGdFV44DvVy_JsnkxBrfko5z7AmqRhphS5BvC1z2pLBxWDVHBXsqcfM_7WrNASHg1mvQk",
  map: "https://lh3.googleusercontent.com/aida-public/AB6AXuB2_ANdbZ4HIHCEVmL70zXzA9SFNOYyRNsVyOoWGG7Wi4Z3FaZaIRb6UgaIFYqdEcHNIZ2uF766-ds58P9sqsfCJT4EPHr55V1Du6CkTtHfauMawLi1arOEpjL-m5WQyeZU3l72_QaI_D6nxPrvXdSkrDsH2ruXIJKMJjzCfgmlL-wfokzVSfVQsg_q-cEqznmf0odfaViTEVXFjUdyfcazO0grs9_vnXkkRiioq48bjb2rJNqzCaaDis9IhFTWXEkqjeFPZO9_0N0",
};

export async function seedDatabase() {
  const passwordHash = await bcrypt.hash("password123", 10);
  const adminHash = await bcrypt.hash("admin123", 10);

  const [admin] = await db
    .insert(users)
    .values({
      email: "admin@supercarnes.com",
      passwordHash: adminHash,
      name: "Admin User",
      role: "admin",
      loyaltyPoints: 0,
      memberSince: "2020",
    })
    .returning();

  const [customer] = await db
    .insert(users)
    .values({
      email: "alejandro.v@supercarnes.com",
      passwordHash,
      name: "Alejandro V. Montemayor",
      avatarUrl: IMG.avatar,
      role: "customer",
      loyaltyPoints: 2450,
      memberSince: "2021",
    })
    .returning();

  await db.insert(addresses).values({
    userId: customer.id,
    label: "Residencial Las Lomas",
    street: "Av. de los Encinos 452, Int 4C",
    city: "Ciudad de México",
    state: "Lomas de Chapultepec",
    zip: "11000",
    country: "México",
    isDefault: true,
  });

  await db.insert(paymentMethods).values({
    userId: customer.id,
    type: "card",
    brand: "VISA",
    last4: "4290",
    expiry: "09/26",
    isDefault: true,
  });

  const productRows = [
    {
      name: "Premium Black Angus Ribeye",
      slug: "premium-black-angus-ribeye",
      description:
        "28-day dry-aged ribeye with exceptional marbling and deep, nutty flavor profiles.",
      category: "Beef & Veal",
      cutType: "Steak",
      grade: "USDA Prime",
      price: 168000,
      priceUnit: "lb",
      imageUrl: IMG.ribeye,
      stockKg: 45.5,
      badges: JSON.stringify(["Prime", "Dry-Aged"]),
      featured: true,
    },
    {
      name: "Miyazaki A5 Wagyu Striploin",
      slug: "miyazaki-a5-wagyu-striploin",
      description:
        "Authentic Japanese Miyazaki Wagyu with legendary marbling that melts at room temperature.",
      category: "Japanese Import",
      cutType: "Steak",
      grade: "A5 Wagyu",
      price: 740000,
      priceUnit: "12oz",
      imageUrl: IMG.wagyu,
      stockKg: 8.2,
      badges: JSON.stringify(["Exclusive: A5 Wagyu"]),
      featured: true,
    },
    {
      name: "Artisan Whole Beef Brisket",
      slug: "artisan-whole-beef-brisket",
      description:
        "Perfect for low and slow smoking. Hand-trimmed by our butchers for optimal fat-to-meat ratio.",
      category: "Slow Cook Cuts",
      cutType: "Roast",
      grade: "Grass-Fed",
      price: 50000,
      priceUnit: "lb",
      imageUrl: IMG.brisket,
      stockKg: 30,
      badges: JSON.stringify(["Pitmaster Select"]),
    },
    {
      name: "Colorado Lamb Loin Chops",
      slug: "colorado-lamb-loin-chops",
      description:
        "Grass-fed lamb chops with a delicate, clean flavor profile. Hand-selected for uniform size.",
      category: "Lamb",
      cutType: "Steak",
      grade: "Grass-Fed",
      price: 136000,
      priceUnit: "lb",
      imageUrl: IMG.lamb,
      stockKg: 12,
      badges: JSON.stringify([]),
    },
    {
      name: "Aged Porterhouse Steak",
      slug: "aged-porterhouse-steak",
      description:
        "The best of both worlds: Filet Mignon and NY Strip in one monumental bone-in cut.",
      category: "Beef & Veal",
      cutType: "Steak",
      grade: "USDA Prime",
      price: 192000,
      priceUnit: "lb",
      imageUrl: IMG.porterhouse,
      stockKg: 22,
      badges: JSON.stringify(["Chef's Choice"]),
    },
    {
      name: "Aged Ribeye",
      slug: "aged-ribeye-admin",
      description: "Beef · 28-Day Aged",
      category: "Beef",
      cutType: "Steak",
      grade: "Prime",
      price: 356000,
      priceUnit: "kg",
      imageUrl: IMG.ribeye,
      stockKg: 45.5,
      badges: JSON.stringify(["Prime"]),
    },
    {
      name: "Heritage Lamb Chops",
      slug: "heritage-lamb-chops",
      description: "Lamb · Grass-fed",
      category: "Lamb",
      cutType: "Steak",
      grade: "Standard",
      price: 216000,
      priceUnit: "kg",
      imageUrl: IMG.lamb,
      stockKg: 12,
      badges: JSON.stringify(["Standard"]),
    },
    {
      name: "Wagyu A5 Fillet",
      slug: "wagyu-a5-fillet",
      description: "Beef · Miyazaki",
      category: "Beef",
      cutType: "Steak",
      grade: "Wagyu",
      price: 980000,
      priceUnit: "kg",
      imageUrl: IMG.wagyu,
      stockKg: 8.2,
      badges: JSON.stringify(["Wagyu"]),
    },
    {
      name: "Ribeye Cut Special",
      slug: "ribeye-cut-special",
      description: "Premium Wagyu ribeye cut special",
      category: "Premium Wagyu",
      cutType: "Steak",
      grade: "A5 Wagyu",
      price: 1250000,
      priceUnit: "unit",
      imageUrl: IMG.cartRibeye,
      stockKg: 20,
      badges: JSON.stringify(["Premium Wagyu"]),
    },
    {
      name: "New York Strip",
      slug: "new-york-strip",
      description: "Dry-Aged 45 Days",
      category: "Dry-Aged 45 Days",
      cutType: "Steak",
      grade: "USDA Prime",
      price: 3560000,
      priceUnit: "unit",
      imageUrl: IMG.cartStrip,
      stockKg: 18,
      badges: JSON.stringify(["Dry-Aged"]),
    },
  ];

  const defaultCategories = [
    "Res y Ternera",
    "Cerdo y Charcutería",
    "Aves",
    "Cordero y Caza",
  ];

  const seedCategories = Array.from(
    new Set([
      ...defaultCategories,
      ...productRows.map((p) => p.category),
    ])
  );

  const categoryValues = seedCategories.map((name) => ({
    name,
    slug: name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, ""),
  }));

  await db.insert(categories).values(categoryValues);

  const insertedProducts = await db
    .insert(products)
    .values(productRows)
    .returning();

  const ribeyeSpecial = insertedProducts.find((p) => p.slug === "ribeye-cut-special")!;
  const nyStrip = insertedProducts.find((p) => p.slug === "new-york-strip")!;

  await db.insert(cartItems).values([
    { userId: customer.id, productId: ribeyeSpecial.id, quantity: 1 },
    { userId: customer.id, productId: nyStrip.id, quantity: 2 },
  ]);

  const [orderTransit] = await db
    .insert(orders)
    .values({
      userId: customer.id,
      orderNumber: "SC-8942",
      status: "in_transit",
      subtotal: 470000,
      shipping: 15000,
      total: 485000,
      paymentMethod: "card",
      shippingAddress: JSON.stringify({
        street: "Av. Paseo de la Reforma 250, Piso 12",
        city: "Juárez, Ciudad de México",
        zip: "06600",
      }),
      deliveryNotes: "Entregar en recepción.",
      contactPhone: "+52 55 1234 5678",
      driverName: "Carlos Mendoza",
      driverVehicle: "En motocicleta",
      driverDistance: "1.2 km",
      estimatedDelivery: "11:25 AM",
      mapImageUrl: IMG.map,
      statusTimeline: JSON.stringify([
        { status: "received", label: "Pedido Recibido", time: "10:15 AM" },
        { status: "preparing", label: "En Preparación", time: "10:45 AM" },
        { status: "in_transit", label: "En Camino", time: "En Tránsito" },
        { status: "delivered", label: "Entregado", time: "Pendiente" },
      ]),
      createdAt: "2023-10-24T10:00:00",
    })
    .returning();

  const [orderDelivered] = await db
    .insert(orders)
    .values({
      userId: customer.id,
      orderNumber: "SC-8711",
      status: "delivered",
      subtotal: 220000,
      shipping: 0,
      total: 220000,
      paymentMethod: "spei",
      shippingAddress: JSON.stringify({
        street: "Av. de los Encinos 452",
        city: "Ciudad de México",
        zip: "11000",
      }),
      createdAt: "2023-10-12T14:00:00",
    })
    .returning();

  const [orderTracking] = await db
    .insert(orders)
    .values({
      userId: customer.id,
      orderNumber: "SC-20948",
      status: "in_transit",
      subtotal: 234000,
      shipping: 15000,
      total: 249000,
      paymentMethod: "card",
      shippingAddress: JSON.stringify({
        street: "Av. Paseo de la Reforma 250, Piso 12",
        city: "Juárez, Ciudad de México, 06600",
      }),
      deliveryNotes:
        "Entregar en recepción. Favor de no tocar el timbre, bebé durmiendo.",
      contactPhone: "+52 55 1234 5678",
      driverName: "Carlos Mendoza",
      driverVehicle: "En motocicleta",
      driverDistance: "1.2 km",
      estimatedDelivery: "11:25 AM",
      mapImageUrl: IMG.map,
      statusTimeline: JSON.stringify([
        { status: "received", label: "Pedido Recibido", time: "10:15 AM" },
        { status: "preparing", label: "En Preparación", time: "10:45 AM" },
        { status: "in_transit", label: "En Camino", time: "En Tránsito" },
        { status: "delivered", label: "Entregado", time: "Pendiente" },
      ]),
    })
    .returning();

  const ribeye = insertedProducts.find((p) => p.slug === "premium-black-angus-ribeye")!;

  await db.insert(orderItems).values([
    {
      orderId: orderTransit.id,
      productId: ribeye.id,
      productName: "Premium Wagyu Selection",
      productImage: ribeye.imageUrl,
      quantity: 3,
      unitPrice: 161667,
      detail: "3 artículos",
    },
    {
      orderId: orderDelivered.id,
      productId: ribeye.id,
      productName: "Tomahawk Dry-Aged",
      productImage: IMG.porterhouse,
      quantity: 1,
      unitPrice: 220000,
      detail: "1 artículo",
    },
    {
      orderId: orderTracking.id,
      productId: ribeye.id,
      productName: "Ribeye Prime Dry-Aged",
      productImage: IMG.ribeye,
      quantity: 2,
      unitPrice: 72500,
      detail: "2 cortes de 400g • Término sugerido: Medio",
    },
    {
      orderId: orderTracking.id,
      productId: nyStrip.id,
      productName: "Costilla Cargada Select",
      productImage: IMG.brisket,
      quantity: 1,
      unitPrice: 89000,
      detail: "1.5 kg • Selección especial",
    },
  ]);

  return { admin, customer, products: insertedProducts, orderTracking };
}
