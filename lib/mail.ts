import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("Falta la variable de entorno RESEND_API_KEY");
}

export const resend = new Resend(process.env.RESEND_API_KEY);