import AuthForm from "@/components/AuthForm";
import { ensureDb } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function AuthPage() {
  await ensureDb();
  const session = await getSession();
  if (session) {
    redirect(session.role === "admin" ? "/admin" : "/perfil");
  }

  return (
    <Suspense fallback={<div className="min-h-screen flex justify-center items-center">Cargando...</div>}>
      <AuthForm />
    </Suspense>
  );
}
