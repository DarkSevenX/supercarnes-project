import { redirect } from "next/navigation";

export default function CarritoRedirect() {
  // El pago ahora se realiza en la barra lateral
  redirect("/");
}