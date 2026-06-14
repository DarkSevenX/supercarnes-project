import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { ensureDb, jsonError } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";

export async function GET() {
  await ensureDb();
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return jsonError("No autorizado", 403);
  }

  const items = await db.select().from(products);
  return Response.json({ items });
}
