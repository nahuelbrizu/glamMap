# GlamMap — Plan de Acción

> Última actualización: 2026-06-04 (backend completado)
> Criterio de orden: impacto en usuario > riesgo de datos corruptos > calidad

---

## 🔴 Críticos — el producto está roto en estos puntos

- [x] **C1 · Flujo de reserva completo**
  - [x] Verificar columna real en DB: `duration` o `duration_minutes` en tabla `services`
  - [x] Unificar alias en `appointmentService.getServiceById` y todos los call sites
  - [x] Agregar `/business/:id/book` en `AppRouter.tsx`
  - [x] Conectar botón "Reservar" en `BusinessDetail.tsx` → navega a la pantalla de booking
  - [x] Corregir URL en `BookingCalendar.tsx`: `/user/available-slots` → `/users/appointments/slots`
  - [x] Asegurar que la ruta de booking esté dentro de `ProtectedRoute`

- [x] **C2 · Ruta de horarios tapada por `/:id`**
  - [x] Mover `PUT /schedule` antes de `GET /:id` en `businessRoutes.ts`
  - [x] Probar con curl que `PUT /api/business/schedule` no devuelve 404

- [x] **C3 · Backend de servicios (CRUD)**
  - [x] Crear `src/services/serviceService.ts` (get, create, update, delete)
  - [x] Crear `src/controllers/serviceController.ts`
  - [x] Agregar rutas bajo `authenticateToken + checkRole(['owner'])`:
    - [x] `GET  /api/owner/services`
    - [x] `POST /api/owner/services`
    - [x] `PUT  /api/owner/services/:id`
    - [x] `DELETE /api/owner/services/:id`
  - [x] Montar owner routes en `app.ts` bajo `/api/owner`
  - [x] Conectar `ServicesManagement.tsx` con el nuevo `serviceService` del frontend

- [x] **C4 · Toggle de favorito roto en BusinessDetail**
  - [x] Reemplazar `api.post('/api/businesses/favorites/toggle')` por `favoriteService.toggle(id)` en `BusinessDetail.tsx`

- [x] **C5 · Navegación rota en Appointments**
  - [x] Agregar `b.id AS business_id` al SELECT en `appointmentService.getUserAppointments`
  - [x] Cambiar `navigate('/business/${item.id}')` → `navigate('/business/${item.business_id}')` en `Appointments.tsx`

- [x] **C6 · EditProfile desconectado**
  - [x] Agregar `refreshUser()` a `AuthContext` (re-fetch `/auth/me` y actualiza estado)
  - [x] Reemplazar `setUser(res.data.user)` por `refreshUser()` en `EditProfile.tsx`
  - [x] Agregar `/edit-profile` en `AppRouter.tsx` con `ProtectedRoute`

---

## 🟠 Alta prioridad — gaps del producto core

- [ ] **H1 · Seed data de demo**
  - [x] Crear `scripts/seed.ts` con 8-10 negocios de Buenos Aires
  - [x] Incluir coordenadas reales, servicios, horarios y fotos placeholder
  - [x] Agregar script `"seed": "ts-node-dev --transpile-only scripts/seed.ts"` en `package.json`
  - [ ] Documentar en README cómo correr el seed

- [x] **H2 · Panel de turnos para el owner**
  - [x] Agregar `GET /api/owner/appointments` (filtrado por negocio del owner autenticado)
  - [x] Agregar `PATCH /api/owner/appointments/:id/status` (pending → confirmed → completed)
  - [x] Crear pantalla en frontend dentro de `/owner/appointments`
  - [x] Mostrar badge con turnos pendientes en el BottomTabBar del owner

- [x] **H3 · `getAvailableSlots` respeta `business_hours`**
  - [x] Consultar `business_hours` por `business_id` y día de la semana antes de generar slots
  - [x] Retornar `[]` si `is_closed = true` para ese día
  - [x] Usar `open_time` / `close_time` como ventana en lugar de 09:00–19:00 hardcodeado
  - [x] Usar la duración del servicio seleccionado como tamaño de slot (en vez de 30 min fijo)

- [x] **H4 · Control de acceso en reseñas**
  - [x] Verificar en `reviewService` que el turno existe, pertenece al cliente y está `completed`
  - [x] Tomar `businessId` desde el turno (no del body)
  - [x] Agregar constraint `UNIQUE (appointment_id, user_id)` en tabla `reviews`

- [x] **H5 · Google refresh_token**
  - [x] Agregar columna `google_refresh_token TEXT` a la tabla `users`
  - [x] Guardar `refreshToken` en `passport.ts` → `findOrCreateGoogleUser`
  - [x] Actualizar `calendarService.ts` para pasar `refresh_token` al cliente OAuth2
  - [x] Persistir el nuevo access_token después de un refresh exitoso

- [x] **H6 · Paginación en endpoints de lista**
  - [x] `GET /api/admin/users` → `?page=1&limit=20`
  - [x] `GET /api/users/favorites` → `?page=1&limit=20`
  - [x] `GET /api/users/appointments` → `?page=1&limit=20`
  - [x] `GET /api/business/explore` → cursor por distancia
  - [x] Estandarizar respuesta: `{ data: [], total, page, limit }`

---

## 🟡 Calidad y confiabilidad

- [x] **Q1 · Seguridad básica HTTP**
  - [x] Instalar `helmet` y `express-rate-limit`
  - [x] Agregar `app.use(helmet())` en `app.ts`
  - [x] Rate limit estricto en `POST /api/auth/login` y `POST /api/auth/register` (10 req/min)

- [x] **Q2 · Limpiar validación de registro**
  - [x] Eliminar la regla de `role` en `registerValidationRules` (siempre crea `client`)
  - [x] Verificar que el controller no haga referencia al campo `role` del body

- [x] **Q3 · Transacción en `scheduleService`**
  - [x] Envolver DELETE + INSERTs en `BEGIN / COMMIT / ROLLBACK` usando `pool.connect()`

- [x] **Q4 · Validar `role` en admin**
  - [x] En `adminController.updateUserStatus`: lanzar `BadRequestError` si el valor no es `client | owner | admin`

- [x] **Q5 · Columnas explícitas en `getUserFavorites`**
  - [x] Reemplazar `SELECT b.*` por columnas explícitas: `b.id, b.name, b.type, b.address, b.latitude, b.longitude, b.rating_avg, b.banner_url, b.logo_url`

- [x] **Q6 · Logging estructurado**
  - [x] Instalar `pino` + `pino-http`
  - [x] Reemplazar `console.error` en `errorHandler.ts` por `logger.error({ err, req })`
  - [x] Reemplazar `console.log` de startup en `server.ts`

- [x] **Q7 · Validación de env vars al arrancar**
  - [x] Agregar bloque de validación al inicio de `server.ts` que valide `JWT_SECRET`, `DB_*`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
  - [x] Lanzar error claro y terminar el proceso si alguna falta

- [ ] **Q8 · Tests de integración**
  - [ ] Configurar base de datos de test separada
  - [ ] Test: registro → login → obtener perfil
  - [ ] Test: crear turno → verificar `end_time` válido
  - [ ] Test: `getAvailableSlots` con negocio cerrado ese día
  - [ ] Test: reseña sin turno completado → debe rechazar
  - [ ] Test: toggle favorito → add y remove

---

## 🔵 Escala y crecimiento

- [ ] **S1 · Upload de imágenes**
  - [ ] Elegir proveedor (Cloudflare R2 recomendado para latencia Argentina)
  - [ ] Instalar `multer` en el backend
  - [ ] Crear `POST /api/owner/business/images` (multipart)
  - [ ] Retornar CDN URL y guardar en `banner_url` / `logo_url`
  - [ ] Agregar botón de upload en `BusinessProfile.tsx`

- [ ] **S2 · Índice geoespacial**
  - [x] Solución rápida: agregar pre-filtro de bounding box en queries Haversine
  - [ ] Solución definitiva: habilitar extensión PostGIS, columna `geography`, índice `GIST`, query con `ST_DWithin`

- [x] **S3 · JWT de corta duración + refresh token**
  - [x] Cambiar access token a 15 minutos
  - [x] Emitir refresh token en `httpOnly cookie` al login
  - [x] Crear `POST /api/auth/refresh`
  - [x] Actualizar `AuthContext` para manejar 401 → auto-refresh → retry

- [x] **S4 · Analytics para owners**
  - [x] Crear `GET /api/owner/stats`:
    - Turnos por estado (últimos 30 días)
    - Rating promedio del negocio
    - Servicio más solicitado
  - [x] Conectar con `OwnerDashboard.tsx` / `DashboardGeneral.tsx`

- [ ] **S5 · Notificaciones por email**
  - [ ] Elegir proveedor (Resend recomendado)
  - [ ] Definir schema de `notification_prefs`: `{ email: boolean, reminders: boolean }`
  - [ ] Enviar email al crear turno (cliente) y al recibir turno (owner)
  - [ ] Enviar recordatorio 24h antes del turno

---

## Orden de sprint sugerido

```
Sprint 1  →  C1, C2, C3, C4, C5, C6
Sprint 2  →  H1, H2, H3
Sprint 3  →  H4, H5, H6, Q1, Q2, Q3, Q4
Sprint 4  →  Q5, Q6, Q7, Q8
Sprint 5  →  S1, S2
Sprint 6  →  S3, S4, S5
```
