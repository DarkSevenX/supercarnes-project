import { NextResponse } from "next/server";
import { initializeDatabase } from "@/lib/db/init";

let initialized = false;

export async function ensureDb() {
  if (!initialized) {
    await initializeDatabase();
    initialized = true;
  }
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
