import MaterialIcon from "./MaterialIcon";

type FooterVariant = "default" | "checkout" | "profile" | "tracking";

type FooterProps = {
  variant?: FooterVariant;
};

export default function Footer({ variant = "default" }: FooterProps) {
  // Para las páginas de carrito y catálogo, usar el footer del mockup del catálogo (gris oscuro)
  if (variant === "default" || variant === "checkout") {
    return (
      <footer className="bg-inverse-surface w-full py-md px-md border-t border-inverse-surface mt-auto">
        <div className="max-w-container-max mx-auto w-full flex flex-col md:flex-row justify-between gap-md">
          <div className="space-y-xs">
            <span className="font-label-lg text-gray-400 block text-sm">
              Super Carnes La Victoriana
            </span>
            <div className="flex gap-sm">
              <MaterialIcon
                name="face_nod"
                className="text-gray-400 cursor-pointer hover:text-gray-300 transition-all text-sm"
              />
              <MaterialIcon
                name="public"
                className="text-gray-400 cursor-pointer hover:text-gray-300 transition-all text-sm"
              />
              <MaterialIcon
                name="mail"
                className="text-gray-400 cursor-pointer hover:text-gray-300 transition-all text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-md">
            <div className="space-y-xs">
              <h4 className="font-label-sm text-gray-400 mb-xs text-xs">Información de la Tienda</h4>
              <span className="block text-gray-400 text-xs">
                Horarios: 8AM - 8PM
              </span>
              <span className="block text-gray-400 text-xs">
                Ubicación: Calle Principal 123
              </span>
            </div>
            <div className="space-y-xs">
              <h4 className="font-label-sm text-gray-400 mb-xs text-xs">Políticas</h4>
              <a className="block text-gray-400 hover:text-gray-300 underline transition-all text-xs" href="#">
                Política de Envíos
              </a>
              <a className="block text-gray-400 hover:text-gray-300 underline transition-all text-xs" href="#">
                Política de Privacidad
              </a>
            </div>
            <div className="space-y-xs">
              <h4 className="font-label-sm text-gray-400 mb-xs text-xs">Soporte</h4>
              <a className="block text-gray-400 hover:text-gray-300 underline transition-all text-xs" href="#">
                Contactar Soporte
              </a>
              <a className="block text-gray-400 hover:text-gray-300 underline transition-all text-xs" href="#">
                Estado del Pedido
              </a>
            </div>
          </div>
        </div>
        <div className="max-w-container-max mx-auto w-full border-t border-gray-700 mt-md pt-sm flex flex-col md:flex-row justify-between gap-sm">
          <p className="font-body-sm text-gray-400 text-xs">
            © 2024 Super Carnes La Victoriana. Carnicería Premium.
          </p>
          <div className="flex gap-md">
            <span className="text-gray-400 text-xs">
              Elaborado por Carniceros Maestros
            </span>
            <span className="text-gray-400 text-xs">
              Certificado ISO 22000
            </span>
          </div>
        </div>
      </footer>
    );
  }

  if (variant === "profile") {
    return (
      <footer className="bg-surface-container-highest border-t border-outline-variant full-width mt-auto py-md px-md">
        <div className="flex flex-col md:flex-row justify-between items-center max-w-container-max mx-auto w-full">
          <div className="mb-sm md:mb-0">
            <div className="text-label-lg font-label-lg text-gray-400 text-sm">
              Super Carnes
            </div>
            <p className="text-xs text-gray-400 mt-1">
              © 2024 Super Carnes Atelier. Todos los derechos reservados.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-sm">
            <a className="text-gray-400 hover:text-gray-300 transition-colors text-xs" href="#">
              Sostenibilidad
            </a>
            <a className="text-gray-400 hover:text-gray-300 transition-colors text-xs" href="#">
              Mayorista
            </a>
            <a className="text-gray-400 hover:text-gray-300 transition-colors text-xs" href="#">
              Política de Envíos
            </a>
            <a className="text-gray-400 hover:text-gray-300 transition-colors text-xs" href="#">
              Términos de Servicio
            </a>
            <a className="text-gray-400 hover:text-gray-300 transition-colors text-xs" href="#">
              Contacto
            </a>
          </div>
        </div>
      </footer>
    );
  }

  if (variant === "tracking") {
    return (
      <footer className="w-full py-md px-md flex flex-col md:flex-row justify-between items-start gap-md bg-inverse-surface dark:bg-surface-container-lowest mt-auto">
        <div className="flex flex-col gap-sm">
          <span className="font-label-lg text-gray-400 text-sm">
            Super Carnes
          </span>
          <p className="font-body-sm text-gray-400 max-w-xs text-xs">
            © 2024 Super Carnes. Carnicería Premium. Tradición y excelencia en
            cada corte.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-md">
          <div className="flex flex-col gap-xs">
            <span className="font-label-sm text-gray-400 uppercase tracking-tighter text-xs">
              Horarios
            </span>
            <span className="text-gray-400 hover:text-gray-300 underline transition-all cursor-pointer text-xs">
              Lunes a Sábado: 8AM - 8PM
            </span>
            <span className="text-gray-400 hover:text-gray-300 underline transition-all cursor-pointer text-xs">
              Domingo: 9AM - 4PM
            </span>
          </div>
          <div className="flex flex-col gap-xs">
            <span className="font-label-sm text-gray-400 uppercase tracking-tighter text-xs">
              Legal
            </span>
            <a className="text-gray-400 hover:text-gray-300 underline transition-all text-xs" href="#">
              Política de Envíos
            </a>
            <a className="text-gray-400 hover:text-gray-300 underline transition-all text-xs" href="#">
              Política de Privacidad
            </a>
          </div>
          <div className="flex flex-col gap-xs">
            <span className="font-label-sm text-gray-400 uppercase tracking-tighter text-xs">
              Ayuda
            </span>
            <a className="text-gray-400 hover:text-gray-300 underline transition-all text-xs" href="#">
              Contactar Soporte
            </a>
            <a className="text-gray-400 hover:text-gray-300 underline transition-all text-xs" href="#">
              Preguntas Frecuentes
            </a>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-inverse-surface dark:bg-surface-container-lowest w-full py-md px-md flex flex-col md:flex-row justify-between items-start gap-md border-t border-inverse-surface mt-auto">
      <div className="max-w-container-max mx-auto w-full flex flex-col md:flex-row justify-between gap-md">
        <div className="space-y-sm">
          <span className="font-label-lg text-gray-400 block text-sm">
            Super Carnes
          </span>
          <div className="flex gap-sm">
            <MaterialIcon
              name="face_nod"
              className="text-gray-400 cursor-pointer hover:text-gray-300 transition-all text-sm"
            />
            <MaterialIcon
              name="public"
              className="text-gray-400 cursor-pointer hover:text-gray-300 transition-all text-sm"
            />
            <MaterialIcon
              name="mail"
              className="text-gray-400 cursor-pointer hover:text-gray-300 transition-all text-sm"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-md">
          <div className="space-y-xs">
            <h4 className="font-label-sm text-gray-400 mb-xs text-xs">Información de la Tienda</h4>
            <span className="block text-gray-400 text-xs">
              Horarios: 8AM - 8PM
            </span>
            <span className="block text-gray-400 text-xs">
              Ubicación: Calle Principal 123
            </span>
          </div>
          <div className="space-y-xs">
            <h4 className="font-label-sm text-gray-400 mb-xs text-xs">Políticas</h4>
            <a className="block text-gray-400 hover:text-gray-300 underline transition-all text-xs" href="#">
              Política de Envíos
            </a>
            <a className="block text-gray-400 hover:text-gray-300 underline transition-all text-xs" href="#">
              Política de Privacidad
            </a>
          </div>
          <div className="space-y-xs">
            <h4 className="font-label-sm text-gray-400 mb-xs text-xs">Soporte</h4>
            <a className="block text-gray-400 hover:text-gray-300 underline transition-all text-xs" href="#">
              Contactar Soporte
            </a>
            <a className="block text-gray-400 hover:text-gray-300 underline transition-all text-xs" href="#">
              Estado del Pedido
            </a>
          </div>
        </div>
      </div>
      <div className="max-w-container-max mx-auto w-full border-t border-gray-700 mt-md pt-sm flex flex-col md:flex-row justify-between gap-sm">
        <p className="font-body-sm text-gray-400 text-xs">
          © 2024 Super Carnes. Carnicería Premium.
        </p>
        <div className="flex gap-md">
          <span className="text-gray-400 text-xs">
            Elaborado por Carniceros Maestros
          </span>
          <span className="text-gray-400 text-xs">
            Certificado ISO 22000
          </span>
        </div>
      </div>
    </footer>
  );
}
