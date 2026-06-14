import { and, asc, desc, eq, inArray, like, lte, not, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";

export type ProductFilters = {
  category?: string | string[];
  cut?: string | string[];
  grade?: string;
  search?: string;
  sort?: string;
  maxPrice?: number;
  page?: number;
  limit?: number;
};

const PER_PAGE = 6;

export async function queryProducts(filters: ProductFilters = {}) {
  const conditions = [not(eq(products.isCustomCutBanner, true))];

  if (filters.category) {
    const cats = Array.isArray(filters.category)
      ? filters.category
      : filters.category.split(",").filter(Boolean);
    if (cats.length) conditions.push(inArray(products.category, cats));
  }

  if (filters.cut) {
    const cuts = Array.isArray(filters.cut)
      ? filters.cut
      : filters.cut.split(",").filter(Boolean);
    if (cuts.length) conditions.push(inArray(products.cutType, cuts));
  }

  if (filters.grade) {
    conditions.push(eq(products.grade, filters.grade));
  }

  if (filters.search) {
    const term = `%${filters.search}%`;
    conditions.push(
      or(
        like(products.name, term),
        like(products.description, term),
        like(products.category, term),
      )!,
    );
  }

  if (filters.maxPrice && filters.maxPrice < 5000000) {
    conditions.push(lte(products.price, filters.maxPrice));
  }

  const where = and(...conditions);

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(products)
    .where(where);
  const total = countResult[0]?.count ?? 0;

  let orderBy = desc(products.featured);
  if (filters.sort === "price_desc") orderBy = desc(products.price);
  else if (filters.sort === "price_asc") orderBy = asc(products.price);
  else if (filters.sort === "newest") orderBy = desc(products.createdAt);

  const page = Math.max(1, filters.page ?? 1);
  const limit = filters.limit ?? PER_PAGE;
  const offset = (page - 1) * limit;

  const items = await db
    .select()
    .from(products)
    .where(where)
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset);

  return {
    items,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    perPage: limit,
  };
}
