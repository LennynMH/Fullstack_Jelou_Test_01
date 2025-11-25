# Decisiones Técnicas
## Lenin Muchotrigo Herbay

---

## 📋 Información General

- **Nombre del Candidato**: Lenin Muchotrigo Herbay  
- **Fecha de Inicio**: 23/11/2025  
- **Fecha de Entrega**: 25/11/2025  
- **Tiempo Dedicado**: ~24 horas efectivas (repartidas en 3 bloques)  

---

## 🛠️ Stack Tecnológico Elegido

### Backend

| Tecnología | Versión | Razón de Elección |
|------------|---------|-------------------|
| Node.js | 18.x | LTS estable con soporte para ESM/TS y mejoras de rendimiento. |
| Express | 4.x | Minimalista, flexible y ampliamente adoptado; facilita middlewares personalizados. |
| Base de Datos | MySQL 8 | Requería transacciones y relaciones fuertes; MySQL encaja mejor que MongoDB para proyectos/tareas/colaboradores. |
| ORM | Sequelize 6 | Soporte maduro para MySQL, migración rápida desde Mongoose, hooks para hashing y seeds programáticos. |
| Validación | express-validator | Integra con Express middlewares, validaciones declarativas por ruta. |
| Testing | Jest + Supertest | Permite pruebas end-to-end sobre HTTP sin levantar servidor real; integración natural con TypeScript. |

### Frontend

| Tecnología | Versión | Razón de Elección |
|------------|---------|-------------------|
| React | 18.x | Hooks concurrentes, ecosistema enorme, fácil composición de vistas complejas. |
| Build Tool | Vite 5 | Arranque inmediato, HMR veloz y configuración mínima para TS + Tailwind. |
| Estado Global | Zustand | API ligera, persistencia simple para auth y menos boilerplate que Redux. |
| Estilos | TailwindCSS | Escala rápido, evita escribir CSS repetitivo y combina bien con el diseño responsivo solicitado. |
| Formularios | react-hook-form | Manejo eficiente de validaciones, integración con RHF resolvers y menor re-rendering. |

---

## 🏗️ Arquitectura

### Estructura del Backend

```
backend/
├── src/
│   ├── config/          # DB, Swagger y seeds
│   ├── controllers/     # Casos de uso por dominio
│   ├── middleware/      # auth, admin, validación, errores
│   ├── models/          # Sequelize + asociaciones
│   ├── routes/          # separación REST por recurso
│   ├── tests/           # utilidades + setup jest
│   └── index.ts         # bootstrap y registro de rutas
```

**Razón:** separar responsabilidades, permitir importar controladores en tests, mantener `index.ts` sólo como orquestador (env + DB + server). Los seeds viven en `config` para poder reutilizarlos dentro de las pruebas.

### Estructura del Frontend

```
frontend/
├── src/
│   ├── components/      # Modales, layouts, controles reutilizables
│   ├── pages/           # Pantallas para router
│   ├── services/        # Clientes Axios por recurso
│   ├── store/           # Zustand (auth)
│   ├── utils/           # Helpers y constantes
│   └── App.tsx          # Rutas y layout principal
```

**Razón:** estructura orientada a rutas y servicios. Mantiene los formularios en componentes/páginas separados, y los servicios encapsulan las llamadas para facilitar mocking en un futuro.

---

## 🗄️ Diseño de Base de Datos

### Elección: MySQL

**Razones:**
- Relaciones claras (User-Project-Task-Profile) y necesidad de integridad referencial.
- Soportes de seeds y scripts SQL maduros en Docker.
- Fácil de replicar en entornos productivos y locales con docker-compose.

### Schema/Modelos

- **profiles** (`id`, `name`, `description`)  
- **users** (`id`, `name`, `email`, `password`, `profileId`)  
- **projects** (`id`, `name`, `description`, `ownerId`)  
- **project_collaborators** (tabla intermedia many-to-many)  
- **tasks** (`id`, `title`, `description`, `status`, `priority`, `projectId`, `assignedToId`, `dueDate`)  

**Decisiones importantes:**
- Normalización a 3FN: separamos Profiles y Users para habilitar RBAC y seeds automáticos.
- Índices en `tasks` por `projectId`, `status`, `priority` y `assignedToId` para filtros y panel.
- Relaciones Sequelize con `belongsToMany` para colaboradores y `hasMany/belongsTo` para tasks.

---

## 🔐 Seguridad

### Implementaciones

- ✅ **Hash de contraseñas**: `bcryptjs` con 10 salt rounds (compatibilidad y rendimiento).  
- ✅ **JWT**: expiración configurable vía `JWT_EXPIRES_IN` (default 7 días). Claims mínimos (id, email).  
- ✅ **Validación de inputs**: `express-validator` + middleware `validate` general.  
- ✅ **CORS**: whitelists desde `.env` (default `http://localhost:3001`).  
- ✅ **Headers**: `helmet` en todo el backend.  
- ✅ **Rate limiting**: `express-rate-limit` configurado por env (`RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX_REQUESTS`).  

**Consideraciones:** tokens se envían en `Authorization: Bearer`. Middleware `checkAdmin` para rutas de perfiles/usuarios. Seeds incluyen admin con credenciales conocidas para QA.  

---

## 🎨 Decisiones de UI/UX

- **Framework**: TailwindCSS + componentes propios.  
- **Responsive**: Mobile-first con grids flexibles en dashboard y listas.  
- **Loading States**: spinners simples y placeholders en modales/listas.  
- **Errores**: `react-hot-toast` para feedback inmediato (success/error).  
- **UX**: Rutas protegidas con redirect automático, menús condicionales según perfil (p.ej. “Perfiles” y “Usuarios” visibles sólo para admin). Formularios con validaciones inline usando RHF.  

---

## 🧪 Testing

### Estrategia

- **Backend**: Pruebas E2E con Jest + Supertest sobre SQLite en memoria. Cubre auth, projects (incluye colaboradores), tasks, profiles, users (admin) y stats. Cada suite resetea la BD con seeds.  
- **Frontend**: No se agregaron por tiempo; prioricé funcionalidad completa y batería backend.  
- **Cobertura**: Backend >70% en rutas críticas; Frontend pendiente. Se priorizaron endpoints con lógica de permisos y filtros.  

---

## 🐳 Docker

- ✅ Dockerfile backend (multi-stage: deps, build, runtime).  
- ✅ Dockerfile frontend (Vite build + Nginx).  
- ✅ docker-compose para desarrollo y producción por separado.  
- **Decisiones**:  
  - Base Alpine para imágenes pequeñas.  
  - Multi-stage para evitar dev-deps en runtime.  
  - Compose desarrollo con montajes y `npm run dev`; producción sirve artefactos listos.  

---

## ⚡ Optimizaciones

### Backend
- Seeds automáticos para perfiles/admin tras `sequelize.sync` (evita scripts manuales).  
- Cliente Axios configurado con interceptores (logout 401) en frontend.  
- Uso de `limit/offset` y `Op.like` en proyectos para soportar búsqueda y paginación.  

### Frontend
- Zustand persiste auth en localStorage para mantener sesión tras refresh.  
- Modales reutilizables (Projects/Profiles/Users/Tasks) reducen duplicación.  
- Vite proxy `/api` en dev para evitar CORS.  

---

## 🚧 Desafíos y Soluciones

1. **Migrar de MongoDB a MySQL**  
   - *Problema*: El README original partía de Mongoose.  
   - *Solución*: Reescribir modelos a Sequelize, definir asociaciones y seeds.  
   - *Aprendizaje*: planificar orden de import para registrar modelos antes del sync.  

2. **Permisos por perfil**  
   - *Problema*: Sólo ciertos endpoints debían ser admin-only.  
   - *Solución*: Middleware `checkAdmin` y rutas `router.use(authenticate, checkAdmin)`.  
   - *Aprendizaje*: Es más limpio aplicar middlewares a nivel router que en cada handler.  

3. **Tests aislados**  
   - *Problema*: No quería depender de MySQL en CI.  
   - *Solución*: Switch automático a SQLite `:memory:` cuando `NODE_ENV=test` + seeds.  
   - *Aprendizaje*: Manejar warns específicos de Sequelize para mantener logs limpios.  

---

## 🎯 Trade-offs

1. **SQLite en tests vs MySQL real**  
   - *Opciones*: (A) levantar MySQL Docker en CI, (B) usar SQLite in-memory.  
   - *Elegí*: B.  
   - *Razón*: Simplifica pipeline y permite ejecutar tests instantáneamente; sacrifique paridad total, pero cubro lógica de negocio.  

2. **Zustand vs Redux**  
   - *Opciones*: Redux Toolkit o Zustand.  
   - *Elegí*: Zustand.  
   - *Razón*: Estado global reducido (auth + user) y evitar boilerplate; sacrifiqué middleware avanzados pero no eran necesarios.  

---

## 🔮 Mejoras Futuras

1. **Notificaciones en tiempo real**  
   - *Beneficio*: Mejor feedback cuando alguien asigna una tarea.  
2. **Tests de frontend con React Testing Library**  
   - *Beneficio*: Asegurar formularios y rutas protegidas.  
3. **CI/CD simple (GitHub Actions)**  
   - *Beneficio*: Ejecutar lint+tests automáticamente en PRs.  

---

## 📚 Recursos Consultados

- Documentación oficial de Sequelize y Express-validator.  
- Blog TailwindCSS para patrones responsivos.  
- Repositorio de ejemplo de Docker multi-stage (Node + Nginx).  

---

## 🤔 Reflexión Final

- **Qué salió bien**: Logré una base robusta full-stack con RBAC, seeds automáticos y pruebas cubriendo la mayoría de los flujos de negocio. La separación de entornos (dev/prod/test) facilita el despliegue.  
- **Qué mejoraría**: Agregar tests de frontend, pulir la UI (drag&drop en tareas) y métricas adicionales en el dashboard.  
- **Qué aprendí**: Refrescó buenas prácticas con Sequelize + Jest, y consolidé una estrategia reproducible para integrar Docker, seeds y pipelines de pruebas.  

---

**Fecha de última actualización**: 25/11/2025

