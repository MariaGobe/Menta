# Menta · Gestión integral de prácticas en empresa

Plataforma SaaS para que empresas gestionen las prácticas formativas de alumnos
de FP, universidad y formaciones internas. Construida con Next.js 14, Supabase
y Stripe.

## Características clave

- **Multi-itinerario.** Un mismo flujo válido para prácticas de FP, universitarias
  y formaciones internas. El PFI solo se solicita cuando el alumno proviene de FP.
- **Gestión de alumnos.** CRUD completo con datos académicos, tutores y período.
- **Documentación.** Convenios, seguros, PFI (opcional), anexos, evaluaciones e
  informes finales centralizados en Supabase Storage.
- **Seguimiento.** Registro de horas y evaluaciones (inicial, intermedia, final).
- **Facturación.** Prueba gratuita de 1 mes y plan anual de 490€ + IVA (hasta 2
  alumnos) más 39€ + IVA por cada alumno adicional, gestionado con Stripe.

## Stack

| Capa            | Tecnología                              |
| --------------- | --------------------------------------- |
| Frontend        | Next.js 14 (App Router) + React 18      |
| Estilos         | Tailwind CSS + shadcn/ui                |
| Backend / Auth  | Supabase (Postgres + Auth + Storage)    |
| Pagos           | Stripe (Checkout + Billing Portal)      |
| Tipos           | TypeScript                              |

## Estructura

```
.
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Landing
│   │   ├── precios/                    # Página de precios
│   │   ├── login/                      # Inicio de sesión
│   │   ├── registro/                   # Alta de empresa
│   │   ├── (dashboard)/                # Área privada
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/              # Resumen
│   │   │   ├── alumnos/                # CRUD alumnos
│   │   │   ├── documentos/             # Subida y listado
│   │   │   ├── seguimiento/            # Horas y evaluaciones
│   │   │   ├── facturacion/            # Stripe Checkout / Portal
│   │   │   └── configuracion/          # Datos de la empresa
│   │   ├── api/stripe/                 # Endpoints de Stripe
│   │   └── auth/signout/               # Cierre de sesión
│   ├── components/
│   │   ├── ui/                         # Componentes base shadcn/ui
│   │   ├── landing/                    # Navbar, hero, features, pricing, etc.
│   │   └── dashboard/                  # Sidebar, topbar, stat cards
│   ├── lib/
│   │   ├── supabase/                   # Clientes browser / server / middleware
│   │   ├── stripe/                     # Cliente Stripe servidor
│   │   └── utils.ts                    # Helpers (cn, currency, etc.)
│   └── types/database.ts               # Tipos compartidos
├── supabase/schema.sql                 # Esquema completo (tablas, RLS, triggers)
├── middleware.ts                       # Protección de rutas
└── tailwind.config.ts
```

## Puesta en marcha

### 1. Requisitos previos

- Node.js 20+
- Cuenta en [Supabase](https://supabase.com)
- Cuenta en [Stripe](https://stripe.com) (modo test para empezar)

### 2. Instalación

```bash
git clone <tu-repo>
cd Menta
npm install
cp .env.example .env.local
```

### 3. Configurar Supabase

1. Crea un proyecto nuevo en Supabase.
2. En el SQL Editor, pega el contenido completo de `supabase/schema.sql` y ejecútalo.
   Esto crea todas las tablas, enums, triggers y políticas RLS.
3. En **Storage**, crea un bucket llamado `documents` (privado).
4. Añade esta política de Storage para el bucket `documents`:

   ```sql
   create policy "Users access their org files"
     on storage.objects for all
     using (
       bucket_id = 'documents'
       and (storage.foldername(name))[1] = (
         select organization_id::text from public.profiles where id = auth.uid()
       )
     );
   ```
5. Copia las URL y claves desde **Project settings → API** y rellena `.env.local`:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ```

### 4. Configurar Stripe

1. Crea dos productos en Stripe:
   - **Menta Plan Empresa** con un precio anual de **490 €** → guarda el `price_id` en `STRIPE_PRICE_BASE`.
   - **Alumno adicional** con un precio anual de **39 €** y modelo *Per unit* → guarda el `price_id` en `STRIPE_PRICE_EXTRA_STUDENT`.
2. En **Developers → API keys** copia la clave secreta a `STRIPE_SECRET_KEY` y la
   publicable a `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
3. En **Developers → Webhooks** crea un endpoint que apunte a
   `https://tu-dominio/api/stripe/webhook` y suscríbelo a estos eventos:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

   Guarda el *signing secret* en `STRIPE_WEBHOOK_SECRET`.
4. (Opcional, recomendado) Activa **Stripe Tax** para que se calcule
   automáticamente el IVA español.

### 5. Variables de entorno

`.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRICE_BASE=
STRIPE_PRICE_EXTRA_STUDENT=

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 6. Arrancar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

Para que Stripe pueda enviar webhooks a tu entorno local usa Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Despliegue en Vercel

1. Sube el repositorio a GitHub.
2. Importa el proyecto en [Vercel](https://vercel.com/new).
3. Configura las mismas variables de entorno que en `.env.local`.
4. Pulsa **Deploy**.
5. Vuelve a Stripe y actualiza la URL del webhook con la URL de producción.

## Plan de precios

| Plan              | Precio              | Incluye                                                       |
| ----------------- | ------------------- | ------------------------------------------------------------- |
| Prueba gratuita   | 0€ durante 1 mes    | Acceso completo, sin tarjeta de crédito                       |
| Plan Empresa      | 490 € + IVA / año   | Hasta 2 alumnos activos                                        |
| Alumno adicional  | 39 € + IVA / año    | Por cada alumno por encima de 2                                |

## Roadmap sugerido

- Notificaciones por email (Resend / Postmark) para evaluaciones y fin de período.
- Generación automática del informe final en PDF.
- Importación masiva de alumnos vía CSV.
- App móvil para que los tutores firmen evaluaciones.
- Integración con SEPE para alta en seguridad social.

## Licencia

Propiedad de Gobe Soluciones. Todos los derechos reservados.
