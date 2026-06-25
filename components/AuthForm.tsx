"use client";

import Link from "next/link";
import { useTransition, useState } from "react";
import { useSearchParams } from "next/navigation";
import { loginAction, registerAction } from "@/lib/actions/auth-actions";
import MaterialIcon from "./MaterialIcon";

export default function AuthForm() {
  const [isPending, startTransition] = useTransition();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [terms, setTerms] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await loginAction({
        email: loginEmail,
        password: loginPassword,
      }, redirectTo);
      if (result && !result.success) {
        setError(result.error);
      }
    });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terms) {
      setError("Debe aceptar los términos de servicio");
      return;
    }
    setError("");
    startTransition(async () => {
      const result = await registerAction({
        name: regName,
        email: regEmail,
        password: regPassword,
      }, redirectTo);
      if (result && !result.success) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-md py-xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1/2 bg-surface-container-low -z-10 skew-y-1 origin-top-left" />

      <header className="mb-xl text-center">
        <h1 className="text-headline-lg font-headline-lg text-primary tracking-tight mb-xs">
          Super Carnes
        </h1>
        <p className="text-label-md font-label-md uppercase tracking-widest text-secondary">
          Carnicería Premium
        </p>
      </header>

      <main className="w-full max-w-[440px] z-10">
        <div className="auth-card bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/30">
          <nav className="flex border-b border-outline-variant/20">
            <button
              type="button"
              onClick={() => setTab("login")}
              className={`flex-1 py-lg text-label-md font-label-md tab-transition border-b-2 ${
                tab === "login"
                  ? "border-primary text-primary"
                  : "border-transparent text-secondary hover:text-on-surface"
              }`}
            >
              INICIAR SESIÓN
            </button>
            <button
              type="button"
              onClick={() => setTab("register")}
              className={`flex-1 py-lg text-label-md font-label-md tab-transition border-b-2 ${
                tab === "register"
                  ? "border-primary text-primary"
                  : "border-transparent text-secondary hover:text-on-surface"
              }`}
            >
              REGISTRARSE
            </button>
          </nav>

          <div className="p-lg md:p-xl">
            {error && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
                <div className="bg-surface-container-lowest p-xl rounded-xl shadow-2xl w-[90vw] sm:w-[450px] border border-error/20 flex flex-col items-center animate-in zoom-in-95 duration-200">
                  <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mb-md text-error">
                    <MaterialIcon name="error_outline" className="text-[32px]" />
                  </div>
                  <h3 className="text-headline-sm font-headline-sm text-on-surface mb-xs text-center">Error de Autenticación</h3>
                  <p className="text-body-lg text-secondary text-center mb-xl">{error}</p>
                  <button 
                    onClick={() => setError("")}
                    type="button"
                    className="w-full bg-error text-white py-md rounded-lg font-label-md tracking-wide hover:bg-error/90 transition-colors"
                  >
                    ENTENDIDO
                  </button>
                </div>
              </div>
            )}

            {tab === "login" ? (
              <div className="space-y-lg block">
                <div className="space-y-sm">
                  <h2 className="text-headline-md font-headline-md text-on-surface">
                    Bienvenido de nuevo
                  </h2>
                  <p className="text-body-md text-secondary">
                    Ingrese sus credenciales para acceder a su selección curada.
                  </p>
                </div>
                <form className="space-y-md" onSubmit={handleLogin}>
                  <div className="relative group">
                    <label
                      className="text-caption font-caption text-secondary mb-xs block"
                      htmlFor="login-email"
                    >
                      Correo Electrónico
                    </label>
                    <input
                      className="w-full bg-surface-container-low border-none border-b border-secondary/20 py-sm px-sm focus:ring-0 placeholder:text-secondary-fixed-dim transition-all"
                      id="login-email"
                      placeholder="ejemplo@supercarnes.com"
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                    <div className="absolute bottom-0 left-0 h-[1px] bg-primary input-focus-line" />
                  </div>
                  <div className="relative group">
                    <label
                      className="text-caption font-caption text-secondary mb-xs block"
                      htmlFor="login-password"
                    >
                      Contraseña
                    </label>
                    <input
                      className="w-full bg-surface-container-low border-none border-b border-secondary/20 py-sm px-sm focus:ring-0 placeholder:text-secondary-fixed-dim transition-all"
                      id="login-password"
                      placeholder="••••••••"
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                    <div className="absolute bottom-0 left-0 h-[1px] bg-primary input-focus-line" />
                  </div>
                  <div className="flex justify-end">
                    <a className="text-caption font-caption text-primary hover:underline" href="#">
                      ¿Olvidó su contraseña?
                    </a>
                  </div>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-primary-container text-on-primary py-md rounded-lg font-label-md tracking-wide hover:opacity-90 transition-opacity active:scale-[0.98] transform mt-md disabled:opacity-60"
                  >
                    {isPending ? "PROCESANDO..." : "INGRESAR A LA TIENDA"}
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-lg block">
                <div className="space-y-sm">
                  <h2 className="text-headline-md font-headline-md text-on-surface">
                    Crear una cuenta
                  </h2>
                  <p className="text-body-md text-secondary">
                    Únase a nuestro círculo exclusivo de conocedores cárnicos.
                  </p>
                </div>
                <form className="space-y-md" onSubmit={handleRegister}>
                  <div className="relative group">
                    <label className="text-caption font-caption text-secondary mb-xs block" htmlFor="reg-name">
                      Nombre Completo
                    </label>
                    <input
                      className="w-full bg-surface-container-low border-none border-b border-secondary/20 py-sm px-sm focus:ring-0 placeholder:text-secondary-fixed-dim transition-all"
                      id="reg-name"
                      placeholder="Su nombre"
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      required
                    />
                    <div className="absolute bottom-0 left-0 h-[1px] bg-primary input-focus-line" />
                  </div>
                  <div className="relative group">
                    <label className="text-caption font-caption text-secondary mb-xs block" htmlFor="reg-email">
                      Correo Electrónico
                    </label>
                    <input
                      className="w-full bg-surface-container-low border-none border-b border-secondary/20 py-sm px-sm focus:ring-0 placeholder:text-secondary-fixed-dim transition-all"
                      id="reg-email"
                      placeholder="ejemplo@supercarnes.com"
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      required
                    />
                    <div className="absolute bottom-0 left-0 h-[1px] bg-primary input-focus-line" />
                  </div>
                  <div className="relative group">
                    <label className="text-caption font-caption text-secondary mb-xs block" htmlFor="reg-password">
                      Contraseña
                    </label>
                    <input
                      className="w-full bg-surface-container-low border-none border-b border-secondary/20 py-sm px-sm focus:ring-0 placeholder:text-secondary-fixed-dim transition-all"
                      id="reg-password"
                      placeholder="Mínimo 8 caracteres"
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                    <div className="absolute bottom-0 left-0 h-[1px] bg-primary input-focus-line" />
                  </div>
                  <div className="flex items-start space-x-sm pt-xs">
                    <input
                      className="mt-xs rounded-sm text-primary-container focus:ring-primary-container border-outline"
                      id="terms"
                      type="checkbox"
                      checked={terms}
                      onChange={(e) => setTerms(e.target.checked)}
                    />
                    <label className="text-caption text-secondary" htmlFor="terms">
                      Acepto los{" "}
                      <a className="text-primary hover:underline" href="#">
                        Términos de Servicio
                      </a>{" "}
                      y la{" "}
                      <a className="text-primary hover:underline" href="#">
                        Política de Privacidad
                      </a>
                      .
                    </label>
                  </div>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-primary-container text-on-primary py-md rounded-lg font-label-md tracking-wide hover:opacity-90 transition-opacity active:scale-[0.98] transform mt-md disabled:opacity-60"
                  >
                    {isPending ? "PROCESANDO..." : "REGISTRAR CUENTA"}
                  </button>
                </form>
              </div>
            )}

            <div className="relative my-xl">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant/30" />
              </div>
              <div className="relative flex justify-center text-caption font-caption">
                <span className="bg-surface-container-lowest px-md text-secondary uppercase tracking-widest">
                  o continuar con
                </span>
              </div>
            </div>

            <a
              href={`/api/auth/google?redirect=${encodeURIComponent(redirectTo)}`}
              className="w-full flex items-center justify-center space-x-md border border-outline-variant py-md rounded-lg hover:bg-surface-container transition-colors group"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span className="text-label-md text-on-surface group-hover:text-primary transition-colors">
                GOOGLE
              </span>
            </a>
          </div>
        </div>

        <footer className="mt-lg text-center flex flex-col space-y-sm">
          <Link
            className="text-caption font-caption text-secondary hover:text-primary transition-colors inline-flex items-center justify-center"
            href="/"
          >
            <MaterialIcon name="shopping_cart" className="mr-xs text-[18px]" />
            Volver a la tienda
          </Link>
          <p className="text-caption text-secondary-fixed-dim">
            © 2024 Super Carnes La Victoriana. Todos los derechos reservados.
          </p>
        </footer>
      </main>
    </div>
  );
}
