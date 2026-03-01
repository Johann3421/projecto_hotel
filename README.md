# 🏨 Alturas Grand Hotel — Sistema de Gestión Hotelera (PMS)

Sistema integral de gestión hotelera para **Alturas Grand Hotel**, un hotel boutique 4 estrellas ubicado en Huánuco, Perú. Incluye portal público de reservas y panel de administración completo.

## 🌟 Características

### Portal Público
- **Página principal** con escenas 3D interactivas (React Three Fiber)
- **Catálogo de habitaciones** con galería, amenidades y precios dinámicos
- **Motor de reservas** en 5 pasos: búsqueda → datos del huésped → extras → resumen → confirmación
- **Calendario de disponibilidad** en tiempo real
- **SEO optimizado** con JSON-LD, Open Graph y sitemap dinámico
- **Diseño responsive** con estética de lujo (tipografía Lora + Lato)

### Panel Administrativo (PMS)
- **Dashboard** con KPIs: ocupación, check-ins/outs, ingresos
- **Tape Chart** — vista de cuadrícula habitación × fecha
- **Gestión de habitaciones** por piso con cambio de estado
- **Reservas** — búsqueda, filtros, check-in/check-out con un clic
- **Housekeeping** — tablero Kanban con actualizaciones SSE en tiempo real
- **Huéspedes** — directorio con historial de reservas
- **Facturación** — resumen de pagos y generación de facturas HTML
- **Reportes** — ingresos, fuentes de reserva, ocupación por tipo

### Sistema Anti-Overbooking
- Verificación atómica dentro de transacción Prisma
- Solapamiento con lógica `checkIn < requestedCheckOut AND checkOut > requestedCheckIn`
- Back-to-back bookings permitidos (checkOut es exclusivo)

## 🛠 Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19, Tailwind CSS v4, Lucide Icons |
| 3D | React Three Fiber, @react-three/drei |
| Base de datos | PostgreSQL + Prisma 7 |
| Autenticación | NextAuth v5 (Credentials) |
| Estado | Zustand 5 (persist) |
| Gráficos | Recharts 3 |
| Validación | Zod v4 |
| Moneda | Soles peruanos (S/) · IGV 18% |

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── (public)/          # Portal público
│   │   ├── page.tsx       # Home
│   │   ├── rooms/         # Catálogo + detalle
│   │   ├── booking/       # Flujo de reserva (5 pasos)
│   │   ├── amenities/     # Amenidades
│   │   └── contact/       # Contacto
│   ├── admin/             # Panel PMS (protegido)
│   │   ├── page.tsx       # Dashboard
│   │   ├── tape-chart/    # Tape Chart
│   │   ├── rooms/         # Gestión habitaciones
│   │   ├── reservations/  # Gestión reservas
│   │   ├── housekeeping/  # Tablero limpieza
│   │   ├── guests/        # Directorio huéspedes
│   │   ├── billing/       # Facturación
│   │   └── reports/       # Reportes
│   ├── api/               # API Routes
│   └── login/             # Página de login
├── components/
│   ├── ui/                # Componentes base (Button, Input, Badge...)
│   ├── public/            # Componentes del portal público
│   ├── admin/             # Componentes del panel admin
│   └── three/             # Escenas 3D
├── lib/                   # Utilidades y lógica de negocio
├── store/                 # Zustand stores
├── hooks/                 # Custom hooks
├── types/                 # TypeScript interfaces
└── generated/prisma/      # Prisma Client generado
```

## 🚀 Instalación

### Requisitos Previos
- Node.js 18+
- PostgreSQL 14+
- npm

### Pasos

1. **Clonar e instalar dependencias:**
```bash
cd alturas-grand-hotel
npm install
```

2. **Configurar variables de entorno:**

Editar `.env.local`:
```env
DATABASE_URL="postgresql://postgres:root@localhost:5432/alturas_grand_hotel"
NEXTAUTH_SECRET="tu-secreto-aqui"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

3. **Generar el cliente Prisma y ejecutar migraciones:**
```bash
# Generar Prisma Client
npx prisma generate

# Crear la base de datos en PostgreSQL y ejecutar migración
npx prisma migrate dev --name init

# Sembrar datos de prueba
npx prisma db seed
```

4. **Iniciar el servidor de desarrollo:**
```bash
npm run dev
```

5. **Abrir en el navegador:**
- Portal público: [http://localhost:3000](http://localhost:3000)
- Panel admin: [http://localhost:3000/admin](http://localhost:3000/admin)

## 🔑 Credenciales de Prueba

| Rol | Email | Contraseña |
|-----|-------|-----------|
| Gerente | gerente@alturasgrand.pe | password123 |
| Recepcionista | recepcion1@alturasgrand.pe | password123 |
| Recepcionista | recepcion2@alturasgrand.pe | password123 |
| Housekeeping | housekeeping1@alturasgrand.pe | password123 |
| Housekeeping | housekeeping2@alturasgrand.pe | password123 |

## 🏠 Tipos de Habitación

| Tipo | Precio Base | Capacidad | Habitaciones |
|------|------------|-----------|-------------|
| Estándar | S/ 180 | 2 | 8 (101-108) |
| Superior Vista Río | S/ 260 | 3 | 6 (201-206) |
| Familiar | S/ 320 | 5 | 4 (301-304) |
| Suite Ejecutiva | S/ 480 | 3 | 3 (401-403) |
| Suite Presidencial | S/ 850 | 4 | 1 (PRES-01) |

## 📡 API Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/availability` | Buscar disponibilidad |
| POST | `/api/reservations` | Crear reserva |
| GET | `/api/reservations` | Listar reservas (paginado) |
| GET/PATCH | `/api/reservations/[code]` | Detalle/actualizar reserva |
| GET | `/api/extras` | Listar extras por tipo |
| GET | `/api/rooms` | Listar habitaciones |
| GET/PATCH | `/api/rooms/[id]/status` | Estado de habitación |
| GET | `/api/housekeeping/stream` | SSE tiempo real |
| GET | `/api/invoices/[code]` | Factura HTML |
| GET | `/api/admin/dashboard` | KPIs del dashboard |
| GET | `/api/admin/tape-chart` | Datos tape chart |
| GET | `/api/admin/guests` | Directorio huéspedes |
| GET | `/api/admin/reports` | Reportes de ingresos |

## 📜 Scripts

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run start        # Iniciar producción
npm run lint         # Linter
npx prisma studio    # Explorador visual de BD
npx prisma db seed   # Sembrar datos de prueba
```

## 🎨 Paleta de Colores

- **Navy** — `#0a1628` a `#e8edf5` (fondos, textos principales)
- **Gold** — `#c9a84c` a `#fdf8e8` (acentos de lujo, CTAs)
- **Ivory** — `#f5f0e8` a `#fefdfb` (fondos suaves)

## 📄 Licencia

Proyecto académico / demostrativo. Alturas Grand Hotel es un hotel ficticio.
