# AeroDocs API

Backend para la plantilla DESPACHO. Node.js + Express + Sequelize + MySQL 8, con autenticación JWT y contraseñas hasheadas con bcryptjs.

## Puesta en marcha

1. Instalar dependencias:

   ```bash
   npm install
   ```

2. Copiar la configuración y ajustar los valores (base de datos, `JWT_SECRET`):

   ```bash
   cp .env.example .env
   ```

3. Crear la base de datos, correr las migraciones y cargar los datos iniciales:

   ```bash
   npm run db:create
   npm run migrate
   npm run seed
   ```

4. Levantar el servidor:

   ```bash
   npm run dev     # con recarga automática
   npm start       # sin recarga
   ```

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run db:create` | Crea la base de datos indicada en `DB_NAME`. |
| `npm run migrate` | Aplica las migraciones pendientes. |
| `npm run migrate:undo` | Revierte todas las migraciones. |
| `npm run seed` | Carga los datos iniciales (usuarios, tripulantes, aeronaves, aeropuertos y un vuelo de ejemplo). Ejecutar sobre una BD recién migrada. |
| `npm run db:reset` | Revierte, vuelve a migrar y vuelve a cargar los datos iniciales. |

## Endpoints

Todas las rutas (salvo `POST /api/auth/login` y `GET /api/health`) requieren el header `Authorization: Bearer <token>`.

| Método | Ruta | Roles | Descripción |
| --- | --- | --- | --- |
| POST | `/api/auth/login` | público | Body `{ usuario, password }`. Devuelve `{ token, usuario }`. |
| GET | `/api/auth/me` | todos | Usuario autenticado. |
| GET | `/api/usuarios` | Administrador | Lista usuarios del sistema. |
| POST | `/api/usuarios` | Administrador | Crea usuario `{ usuario, password, nombre, rol, cip? }`. |
| PUT | `/api/usuarios/:id` | Administrador | Edita usuario (campos parciales; `password` opcional). |
| DELETE | `/api/usuarios/:id` | Administrador | Elimina usuario. |
| GET | `/api/tripulantes?puesto=` | todos | Dotación. El filtro `puesto` es opcional. |
| POST | `/api/tripulantes` | Administrador | Crea tripulante. |
| PUT | `/api/tripulantes/:id` | Administrador | Edita tripulante. |
| DELETE | `/api/tripulantes/:id` | Administrador | Elimina tripulante. |
| GET | `/api/aeronaves` | todos | Select de aeronaves. |
| POST | `/api/aeronaves` | Administrador | Crea aeronave `{ codigo }`. |
| GET | `/api/aeropuertos` | todos | Select de origen y destino. |
| POST | `/api/aeropuertos` | Administrador | Crea aeropuerto. |
| GET | `/api/vuelos?fecha=YYYY-MM-DD` | todos | Lista vuelos. El Visualizador solo ve los bloqueados. |
| GET | `/api/vuelos/:id` | todos | Detalle de un vuelo con su dotación. |
| POST | `/api/vuelos` | Administrador, Despachador | Paso CONFECCIÓN: `{ fecha, aeronave_id, origen_id, destino_id, hora_salida, hora_llegada }`. |
| PUT | `/api/vuelos/:id/dotacion` | Administrador, Despachador | Paso DOTACIÓN: `{ piloto, copiloto, mecanico, coordinador, sensorista, cargomaster, artillero, otros }` con ids de tripulante o `null`. |

## Notas

- Las contraseñas se comparan en mayúsculas, igual que la plantilla original.
- Los campos de la dotación del vuelo validan que el tripulante tenga el puesto correspondiente.
- Un vuelo bloqueado (`locked`) no admite cambios de dotación.
