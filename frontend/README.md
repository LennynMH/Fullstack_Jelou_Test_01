# Frontend - React App

Aplicación frontend desarrollada con React, TypeScript, TailwindCSS y React Router.

## 🛠️ Stack Tecnológico

- **Framework**: React v18
- **Lenguaje**: TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Estilos**: TailwindCSS
- **Estado Global**: Zustand
- **HTTP Client**: Axios
- **Formularios**: React Hook Form
- **Notificaciones**: React Hot Toast
- **Iconos**: React Icons

## 📦 Instalación

### Prerrequisitos

- Node.js v18+ y npm 10+
- Backend corriendo en `http://localhost:3000` (o vía docker-compose)

### Pasos de Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables (usa .env.development / .env.production)
cp .env.development .env
# Ajusta VITE_API_URL si el backend corre en otro host/puerto
```

## 🚀 Ejecución

### Modo Desarrollo

```bash
npm run dev
# http://localhost:3001 (proxy a backend para /api)
```

### Modo Producción

```bash
npm run build         # genera /dist
npm run preview       # sirve la build localmente
```

### Docker

```bash
# Desarrollo: Vite dev server dentro del contenedor
docker-compose -f ../docker-compose.development.yml up frontend

# Producción: build + Nginx
docker-compose -f ../docker-compose.production.yml up --build frontend
```

## 📁 Estructura del Proyecto

```
frontend/
├── src/
│   ├── components/      # Componentes reutilizables
│   │   ├── Layout.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── ProjectModal.tsx
│   │   ├── ProfileModal.tsx
│   │   └── UserModal.tsx
│   ├── pages/           # Páginas de la aplicación
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Projects.tsx
│   │   ├── ProjectDetail.tsx
│   │   ├── Tasks.tsx
│   │   ├── Profiles.tsx
│   │   └── Users.tsx
│   ├── services/        # Servicios API
│   │   ├── api.ts
│   │   ├── authService.ts
│   │   ├── projectService.ts
│   │   ├── taskService.ts
│   │   ├── statsService.ts
│   │   ├── profileService.ts
│   │   └── userService.ts
│   ├── store/           # Estado global (Zustand)
│   │   └── authStore.ts
│   ├── App.tsx          # Componente principal
│   ├── main.tsx         # Punto de entrada
│   └── index.css        # Estilos globales
├── public/              # Archivos estáticos
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── .env.development    # Template para desarrollo
└── .env.production     # Template para producción
```

## 🎨 Características Implementadas

### Autenticación
- ✅ Login/Registro con validaciones y feedback
- ✅ Rutas protegidas con `ProtectedRoute`
- ✅ Persistencia de token + datos del usuario (localStorage)
- ✅ Redirecciones automáticas según sesión

### Gestión de Perfiles y Usuarios (rol administrador)
- ✅ CRUD completo de perfiles
- ✅ CRUD completo de usuarios (creación por admin)
- ✅ Controles para ocultar menús si el usuario no es admin

### Proyectos
- ✅ Listado con paginación, búsqueda y acciones
- ✅ Crear/editar/eliminar proyectos
- ✅ Vista detallada con colaboradores
- ✅ Gestión de colaboradores (añadir/quitar)

### Tareas
- ✅ Listado con filtros combinados y ordenamiento
- ✅ Crear/editar/eliminar tareas
- ✅ Cambio rápido de estado
- ✅ Asignación a owner o colaboradores del proyecto

### Dashboard
- ✅ Métricas resumidas (proyectos, tareas por estado, prioridades)
- ✅ Indicadores de tareas asignadas al usuario
- ✅ Atajos a vistas principales

## 🔧 Configuración

### Variables de Entorno

- `VITE_API_URL`: URL base de la API (default: `http://localhost:3000/api`)
- `VITE_NODE_ENV`: Entorno de ejecución (`development` o `production`)

**Archivos de configuración:**
- `.env.development`: Template para desarrollo
- `.env.production`: Template para producción

### Proxy de Desarrollo

El archivo `vite.config.ts` incluye un proxy para redirigir las peticiones `/api` al backend durante el desarrollo.

## 🐳 Docker

- **Dockerfile** multi-stage (builder + nginx).  
- Usa `ARG/ENV VITE_API_URL` para setear la URL del backend en build time.  
- Revisar `docker-compose.development.yml` y `docker-compose.production.yml` en la raíz para ejecución orquestada con backend y MySQL.

## 📝 Notas

- `axios` incorpora interceptores para añadir token y desconectar al usuario si recibe `401`.  
- `vite.config.ts` expone proxy `/api` ➜ `http://localhost:3000`.  
- Tailwind incluye una paleta primaria personalizada (`primary-500/600/700`).  
- Formularios manejan estados de carga y muestran errores de validación con RHF.
