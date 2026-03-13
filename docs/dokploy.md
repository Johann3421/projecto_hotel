# Despliegue en Dokploy

## Estado validado del proyecto

- `npm run dev` inicia correctamente en este entorno.
- `npm run build` completa sin errores.
- Next.js 16 ya usa `src/proxy.ts` en lugar de `middleware.ts`.
- El flujo de booking ya no ejecuta redirecciones durante SSR.
- La imagen Docker ejecuta sincronización Prisma al arrancar.

## Archivos usados para despliegue

- `Dockerfile`
- `docker-compose.yml`
- `docker/start.sh`
- `.env.example`

## Variables obligatorias

Configura estas variables en Dokploy exactamente con valores reales:

```env
POSTGRES_DB=alturas_grand_hotel
POSTGRES_USER=postgres
POSTGRES_PASSWORD=una-clave-segura
NEXTAUTH_SECRET=una-cadena-larga-y-aleatoria
NEXTAUTH_URL=https://tu-dominio.com
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
NEXT_PUBLIC_BASE_URL=https://tu-dominio.com
NEXT_PUBLIC_HOTEL_NAME=Alturas Grand Hotel
NEXT_PUBLIC_HOTEL_PHONE=+51 62 000 0000
NEXT_PUBLIC_HOTEL_EMAIL=reservas@alturasgrand.pe
NEXT_PUBLIC_HOTEL_STARS=4
NEXT_PUBLIC_HOTEL_LAT=-9.9270
NEXT_PUBLIC_HOTEL_LNG=-76.2404
```

## Procedimiento exacto en Dokploy

1. Crea una aplicación nueva de tipo `Compose`.
2. Conecta el repositorio y selecciona la rama que vas a desplegar.
3. Usa la raíz del proyecto como contexto: `alturas-grand-hotel`.
4. Indica que Dokploy use el archivo `docker-compose.yml` del repositorio.
5. Carga todas las variables del bloque anterior en el panel de entorno de Dokploy.
6. Define como servicio web el servicio `app` con puerto interno `3000`.
7. Mantén el volumen `postgres_data` para persistencia de PostgreSQL.
8. Ejecuta el despliegue.
9. Espera a que el servicio `db` esté `healthy` y luego a que `app` quede `healthy`.
10. Valida el dominio final y revisa estas rutas:
    - `/`
    - `/login`
    - `/rooms`
    - `/admin`
    - `/api/availability`

## Qué hace el arranque

El entrypoint `docker/start.sh` aplica una de estas rutas:

- Si existen migraciones Prisma, ejecuta `prisma migrate deploy`.
- Si no existen migraciones, ejecuta `prisma db push --skip-generate`.

Este proyecto actualmente no incluye carpeta `prisma/migrations`, por lo que el primer despliegue usará `db push`.

## Verificación local antes de subir

Puedes validar el mismo paquete con Docker local:

```bash
docker compose --env-file .env.example up --build
```

Luego abre:

- `http://localhost:3000`
- `http://localhost:3000/login`

## Si vas a usar una base externa

Haz estos cambios antes de desplegar:

1. Elimina el servicio `db` de `docker-compose.yml`.
2. Reemplaza `DATABASE_URL` del servicio `app` por tu cadena real de PostgreSQL.
3. Mantén `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL` y `NEXT_PUBLIC_BASE_URL` apuntando al dominio público final.

## Riesgos operativos a tener en cuenta

- Si cambias el esquema con frecuencia, conviene crear migraciones Prisma reales para dejar de depender de `db push`.
- Si `NEXTAUTH_SECRET` cambia entre despliegues, las sesiones activas se invalidarán.
- Si `NEXTAUTH_URL` o `NEXT_PUBLIC_APP_URL` no coinciden con el dominio real, el login y el SEO quedarán inconsistentes.