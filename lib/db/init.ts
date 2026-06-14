import { sql } from "drizzle-orm";
import { db } from "./index";
import { seedDatabase } from "./seed";

export async function initializeDatabase() {
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      avatar_url TEXT,
      role TEXT NOT NULL DEFAULT 'customer',
      loyalty_points INTEGER NOT NULL DEFAULT 0,
      member_since TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      subcategory TEXT,
      cut_type TEXT,
      grade TEXT,
      price REAL NOT NULL,
      price_unit TEXT NOT NULL DEFAULT 'lb',
      image_url TEXT NOT NULL,
      stock_kg REAL NOT NULL DEFAULT 0,
      badges TEXT,
      featured INTEGER NOT NULL DEFAULT 0,
      is_custom_cut_banner INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      session_id TEXT,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      quantity INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS addresses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      label TEXT NOT NULL,
      street TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT,
      zip TEXT NOT NULL,
      country TEXT NOT NULL DEFAULT 'México',
      is_default INTEGER NOT NULL DEFAULT 0
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS payment_methods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      brand TEXT NOT NULL,
      last4 TEXT NOT NULL,
      expiry TEXT NOT NULL,
      is_default INTEGER NOT NULL DEFAULT 0
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      order_number TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'received',
      subtotal REAL NOT NULL,
      shipping REAL NOT NULL DEFAULT 150,
      total REAL NOT NULL,
      payment_method TEXT NOT NULL,
      shipping_address TEXT NOT NULL,
      delivery_notes TEXT,
      contact_phone TEXT,
      driver_name TEXT,
      driver_vehicle TEXT,
      driver_distance TEXT,
      estimated_delivery TEXT,
      map_image_url TEXT,
      status_timeline TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id),
      product_name TEXT NOT NULL,
      product_image TEXT,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      detail TEXT
    )
  `);

  const result = await db.get<{ count: number }>(
    sql`SELECT COUNT(*) as count FROM users`,
  );

  if ((result?.count ?? 0) === 0) {
    await seedDatabase();
  }
}
