import Image from "next/image";
import Link from "next/link";
import MaterialIcon from "./MaterialIcon";

type FooterVariant = "default" | "checkout" | "profile" | "tracking";

type FooterProps = {
  variant?: FooterVariant;
};

export default function Footer({ variant = "default" }: FooterProps) {
  // Para las páginas de carrito y catálogo, usar el footer del mockup del catálogo (gris oscuro)
  if (variant === "default" || variant === "checkout") {
    return (
      <footer className="bg-inverse-surface text-on-primary-fixed w-full py-lg px-lg border-t border-inverse-surface">
        <div className="max-w-container-max mx-auto w-full flex flex-col md:flex-row justify-between gap-lg">
          <div className="space-y-sm">
            <span className="font-headline-md text-headline-md text-surface block">
              Super Carnes La Victoriana
            </span>
            <div className="flex gap-md">
              <MaterialIcon
                name="face_nod"
                className="text-surface cursor-pointer hover:text-primary-fixed-dim transition-all"
              />
              <MaterialIcon
                name="public"
                className="text-surface cursor-pointer hover:text-primary-fixed-dim transition-all"
              />
              <MaterialIcon
                name="mail"
                className="text-surface cursor-pointer hover:text-primary-fixed-dim transition-all"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-lg">
            <div className="space-y-xs">
              <h4 className="font-label-md text-primary-fixed mb-sm">Información de la Tienda</h4>
              <span className="block text-surface-variant font-body-md">
                Horarios: 8AM - 8PM
              </span>
              <span className="block text-surface-variant font-body-md">
                Ubicación: Calle Principal 123
              </span>
            </div>
            <div className="space-y-xs">
              <h4 className="font-label-md text-primary-fixed mb-sm">Políticas</h4>
              <a className="block text-surface-variant hover:text-primary-fixed-dim underline transition-all font-body-md" href="#">
                Política de Envíos
              </a>
              <a className="block text-surface-variant hover:text-primary-fixed-dim underline transition-all font-body-md" href="#">
                Política de Privacidad
              </a>
            </div>
            <div className="space-y-xs">
              <h4 className="font-label-md text-primary-fixed mb-sm">Soporte</h4>
              <a className="block text-surface-variant hover:text-primary-fixed-dim underline transition-all font-body-md" href="#">
                Contactar Soporte
              </a>
              <a className="block text-surface-variant hover:text-primary-fixed-dim underline transition-all font-body-md" href="#">
                Estado del Pedido
              </a>
            </div>
          </div>
        </div>
        <div className="max-w-container-max mx-auto w-full border-t border-secondary-fixed-dim/20 mt-lg pt-md flex flex-col md:flex-row justify-between gap-md">
          <p className="font-body-md text-surface-variant/70 text-caption">
            © 2024 Super Carnes La Victoriana. Carnicería Premium.
          </p>
          <div className="flex gap-lg">
            <span className="text-surface-variant/70 text-caption">
              Elaborado por Carniceros Maestros
            </span>
            <span className="text-surface-variant/70 text-caption">
              Certificado ISO 22000
            </span>
          </div>
        </div>
      </footer>
    );
  }

  if (variant === "profile") {
    return (
      <footer className="bg-surface-container-highest border-t border-outline-variant full-width mt-xl">
        <div className="flex flex-col md:flex-row justify-between items-center px-lg py-xl max-w-container-max mx-auto w-full">
          <div className="mb-md md:mb-0">
            <div className="text-headline-lg font-headline-lg text-primary">
              Super Carnes
            </div>
            <p className="text-caption text-on-surface-variant mt-2">
              © 2024 Super Carnes Atelier. All Rights Reserved.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-md lg:gap-lg">
            <a className="text-on-surface-variant hover:text-primary transition-colors text-body-md font-body-md" href="#">
              Sustainability
            </a>
            <a className="text-on-surface-variant hover:text-primary transition-colors text-body-md font-body-md" href="#">
              Wholesale
            </a>
            <a className="text-on-surface-variant hover:text-primary transition-colors text-body-md font-body-md" href="#">
              Shipping Policy
            </a>
            <a className="text-on-surface-variant hover:text-primary transition-colors text-body-md font-body-md" href="#">
              Terms of Service
            </a>
            <a className="text-on-surface-variant hover:text-primary transition-colors text-body-md font-body-md" href="#">
              Contact
            </a>
          </div>
        </div>
      </footer>
    );
  }

  if (variant === "tracking") {
    return (
      <footer className="w-full py-xl px-lg flex flex-col md:flex-row justify-between items-start gap-lg bg-inverse-surface dark:bg-surface-container-lowest text-on-primary-fixed">
        <div className="flex flex-col gap-md">
          <span className="font-headline-md text-headline-md text-surface">
            Super Carnes
          </span>
          <p className="font-body-md text-body-md text-surface-variant dark:text-on-surface-variant max-w-xs">
            © 2024 Super Carnes. Premium Butcher Atelier. Tradición y excelencia en
            cada corte.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-xl">
          <div className="flex flex-col gap-sm">
            <span className="font-label-md text-label-md text-primary-fixed-dim uppercase tracking-tighter">
              Horarios
            </span>
            <span className="text-surface-variant dark:text-on-surface-variant hover:text-primary-fixed-dim underline transition-all cursor-pointer">
              Lunes a Sábado: 8AM - 8PM
            </span>
            <span className="text-surface-variant dark:text-on-surface-variant hover:text-primary-fixed-dim underline transition-all cursor-pointer">
              Domingo: 9AM - 4PM
            </span>
          </div>
          <div className="flex flex-col gap-sm">
            <span className="font-label-md text-label-md text-primary-fixed-dim uppercase tracking-tighter">
              Legal
            </span>
            <a className="text-surface-variant dark:text-on-surface-variant hover:text-primary-fixed-dim underline transition-all" href="#">
              Shipping Policy
            </a>
            <a className="text-surface-variant dark:text-on-surface-variant hover:text-primary-fixed-dim underline transition-all" href="#">
              Privacy Policy
            </a>
          </div>
          <div className="flex flex-col gap-sm">
            <span className="font-label-md text-label-md text-primary-fixed-dim uppercase tracking-tighter">
              Ayuda
            </span>
            <a className="text-surface-variant dark:text-on-surface-variant hover:text-primary-fixed-dim underline transition-all" href="#">
              Contact Support
            </a>
            <a className="text-surface-variant dark:text-on-surface-variant hover:text-primary-fixed-dim underline transition-all" href="#">
              FAQ
            </a>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-inverse-surface dark:bg-surface-container-lowest text-on-primary-fixed w-full py-xl px-lg flex flex-col md:flex-row justify-between items-start gap-lg border-t border-inverse-surface">
      <div className="max-w-container-max mx-auto w-full flex flex-col md:flex-row justify-between gap-xl">
        <div className="space-y-md">
          <span className="font-headline-md text-headline-md text-surface block">
            Super Carnes
          </span>
          <div className="flex gap-md">
            <MaterialIcon
              name="face_nod"
              className="text-surface cursor-pointer hover:text-primary-fixed-dim transition-all"
            />
            <MaterialIcon
              name="public"
              className="text-surface cursor-pointer hover:text-primary-fixed-dim transition-all"
            />
            <MaterialIcon
              name="mail"
              className="text-surface cursor-pointer hover:text-primary-fixed-dim transition-all"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-xl">
          <div className="space-y-sm">
            <h4 className="font-label-md text-primary-fixed mb-md">Store Info</h4>
            <span className="block text-surface-variant font-body-md">
              Store Hours: 8AM - 8PM
            </span>
            <span className="block text-surface-variant font-body-md">
              Location: 123 Prime Cut Blvd
            </span>
          </div>
          <div className="space-y-sm">
            <h4 className="font-label-md text-primary-fixed mb-md">Policies</h4>
            <a className="block text-surface-variant hover:text-primary-fixed-dim underline transition-all font-body-md" href="#">
              Shipping Policy
            </a>
            <a className="block text-surface-variant hover:text-primary-fixed-dim underline transition-all font-body-md" href="#">
              Privacy Policy
            </a>
          </div>
          <div className="space-y-sm">
            <h4 className="font-label-md text-primary-fixed mb-md">Support</h4>
            <a className="block text-surface-variant hover:text-primary-fixed-dim underline transition-all font-body-md" href="#">
              Contact Support
            </a>
            <a className="block text-surface-variant hover:text-primary-fixed-dim underline transition-all font-body-md" href="#">
              Order Status
            </a>
          </div>
        </div>
      </div>
      <div className="max-w-container-max mx-auto w-full border-t border-secondary-fixed-dim/20 mt-xl pt-lg flex flex-col md:flex-row justify-between gap-md">
        <p className="font-body-md text-surface-variant/70 text-caption">
          © 2024 Super Carnes. Premium Butcher Atelier.
        </p>
        <div className="flex gap-lg">
          <span className="text-surface-variant/70 text-caption">
            Curated by Master Butchers
          </span>
          <span className="text-surface-variant/70 text-caption">
            ISO 22000 Certified
          </span>
        </div>
      </div>
    </footer>
  );
}
