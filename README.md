# Super Carnes - Plataforma de Carnicería Premium

Super Carnes es una aplicación web moderna para la gestión y venta de productos cárnicos premium. La plataforma permite a los usuarios explorar, seleccionar y comprar cortes de carne de alta calidad, mientras que los administradores tienen acceso a un panel de control completo para gestionar inventario, pedidos y clientes.

## Características Principales

### Para Clientes
- Catálogo de productos con filtros por categoría, tipo de corte y precio
- Carrito de compras con gestión de cantidades
- Proceso de checkout con múltiples métodos de pago
- Seguimiento en tiempo real de pedidos
- Perfil de usuario con historial de compras
- Sistema de autenticación seguro

### Para Administradores
- Panel de control con métricas en tiempo real
- Gestión completa de inventario de productos
- Visualización de pedidos activos y clientes
- Estadísticas de ventas y crecimiento
- Interfaz totalmente en español

## Tecnologías Utilizadas

### Frontend
- **Next.js 15** - Framework React con App Router
- **TypeScript** - Tipado estático para mayor seguridad
- **Tailwind CSS** - Framework de estilos utilitarios
- **React Hooks** - Gestión de estado y efectos

### Backend
- **SQLite con Drizzle ORM** - Base de datos y capa de acceso
- **Next.js API Routes** - Endpoints de API integrados
- **bcryptjs** - Encriptación de contraseñas
- **Autenticación por sesiones** - Sistema de login seguro

### Características Técnicas
- Diseño responsive y accesible
- Formateo de precios en pesos colombianos (COP)
- Validación de datos en cliente y servidor
- Código modular y mantenible

## Estructura del Proyecto

```
supercarnes-project/
├── app/                    # Rutas de la aplicación Next.js
│   ├── api/               # Endpoints de API
│   │   ├── auth/         # Autenticación
│   │   ├── admin/        # Panel de administración
│   │   ├── cart/         # Carrito de compras
│   │   ├── orders/       # Gestión de pedidos
│   │   └── products/     # Productos
│   ├── admin/            # Panel de administración
│   ├── auth/             # Páginas de autenticación
│   ├── carrito/          # Carrito de compras
│   ├── pedido/           # Seguimiento de pedidos
│   ├── perfil/           # Perfil de usuario
│   └── layout.tsx        # Layout principal
├── components/           # Componentes reutilizables
├── lib/                  # Utilidades y configuraciones
│   ├── db/              # Configuración de base de datos
│   ├── auth.ts          # Lógica de autenticación
│   ├── api.ts           # Utilidades de API
│   └── utils.ts         # Funciones utilitarias
├── public/              # Archivos estáticos
└── data/                # Base de datos SQLite
```

## Instalación y Configuración

### Requisitos Previos
- Node.js 18.17 o superior
- npm 9.0 o superior
- Git

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone <url-del-repositorio>
cd supercarnes-project/web
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
Crear archivo `.env.local` en la raíz del proyecto:
```env
DATABASE_URL=file:./data/supercarnes.db
```

4. **Inicializar la base de datos**
```bash
npm run db:init
```

5. **Ejecutar el servidor de desarrollo**
```bash
npm run dev
```

6. **Abrir la aplicación**
Navegar a `http://localhost:3000` en el navegador.

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Compila la aplicación para producción
- `npm run start` - Inicia la aplicación compilada
- `npm run lint` - Ejecuta el linter para verificar código
- `npm run db:init` - Inicializa la base de datos con datos de ejemplo
- `npm run db:seed` - Pobla la base de datos con datos de prueba

## Credenciales de Acceso

### Usuario Administrador
- **Email:** admin@supercarnes.com
- **Contraseña:** admin123

### Usuario Cliente
- **Email:** alejandro.v@supercarnes.com
- **Contraseña:** password123

## API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `POST /api/auth/register` - Registrar nuevo usuario

### Productos
- `GET /api/products` - Listar productos con filtros
- `GET /api/admin/products` - Listar productos (admin)
- `PATCH /api/admin/products/[id]` - Actualizar producto
- `DELETE /api/admin/products/[id]` - Eliminar producto

### Carrito
- `GET /api/cart` - Obtener items del carrito
- `POST /api/cart` - Agregar item al carrito
- `PATCH /api/cart/[id]` - Actualizar cantidad
- `DELETE /api/cart/[id]` - Eliminar item del carrito

### Pedidos
- `GET /api/orders` - Listar pedidos del usuario
- `POST /api/orders` - Crear nuevo pedido
- `GET /api/orders/[id]` - Obtener detalles del pedido

### Administración
- `GET /api/admin/stats` - Estadísticas del sistema
- `GET /api/admin/products` - Gestión de productos
- `POST /api/admin/products` - Crear nuevo producto

## Base de Datos

La aplicación utiliza SQLite con el siguiente esquema principal:

### Tablas Principales
- `users` - Usuarios del sistema (clientes y administradores)
- `products` - Catálogo de productos cárnicos
- `cart_items` - Items en el carrito de compras
- `orders` - Pedidos realizados
- `order_items` - Items dentro de cada pedido
- `addresses` - Direcciones de entrega
- `payment_methods` - Métodos de pago

## Formato de Precios

Todos los precios están en **Pesos Colombianos (COP)** y se muestran sin decimales, formateados según las convenciones locales colombianas. Ejemplo: $50.000 en lugar de $50.000,00.

## Consideraciones de Seguridad

- Autenticación por sesiones con cookies seguras
- Hash de contraseñas con bcrypt
- Validación de datos en cliente y servidor
- Protección de rutas de administración
- Sanitización de entradas de usuario

## Despliegue

### Vercel (Recomendado)
La aplicación está optimizada para despliegue en Vercel. Solo necesitas conectar tu repositorio GitHub y configurar las variables de entorno.

### Docker (Opcional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Desarrollo y Contribución

1. Crear una rama para la nueva funcionalidad
2. Implementar los cambios
3. Ejecutar tests y linter
4. Crear Pull Request

### Convenciones de Código
- Usar TypeScript con tipado estricto
- Seguir las reglas de ESLint configuradas
- Escribir comentarios en español para documentación
- Mantener componentes pequeños y reutilizables

## Licencia

Este proyecto es propiedad de Super Carnes y está destinado para uso interno. No se permite la distribución pública sin autorización.


*Última actualización: Junio 2026*
