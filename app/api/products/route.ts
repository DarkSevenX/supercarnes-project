import { NextRequest } from "next/server";
import { ensureDb } from "@/lib/api";
import { queryProducts } from "@/lib/products-query";

export async function GET(request: NextRequest) {
  await ensureDb();
  const { searchParams } = request.nextUrl;

  const result = await queryProducts({
    category: searchParams.get("category") ?? undefined,
    cut: searchParams.get("cut") ?? undefined,
    grade: searchParams.get("grade") ?? undefined,
    search: searchParams.get("search") ?? undefined,
    sort:
      searchParams.get("sort") === "price_desc"
        ? "price_desc"
        : searchParams.get("sort") === "price_asc"
          ? "price_asc"
          : searchParams.get("sort") === "newest"
            ? "newest"
            : undefined,
    maxPrice: searchParams.get("maxPrice")
      ? Number(searchParams.get("maxPrice"))
      : undefined,
    page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
  });

  return Response.json(result);
}
