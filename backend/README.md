# Backend - API REST

API REST para gestión colaborativa de proyectos y tareas desarrollada con Node.js, Express, TypeScript y MySQL usando Sequelize.

## 🛠️ Stack Tecnológico

- **Runtime**: Node.js v18+
- **Framework**: Express.js
- **Lenguaje**: TypeScript
- **Base de Datos**: MySQL 8 (Sequelize ORM)
- **Autenticación**: JWT (JSON Web Tokens)
- **Documentación**: Swagger/OpenAPI
- **Testing**: Jest + Supertest (SQLite in-memory en entorno de pruebas)

## 📦 Instalación

### Prerrequisitos

- Node.js v18 o superior
- npm 10+
- MySQL 8 (si se ejecuta sin Docker) o Docker Desktop + Docker Compose

### Pasos de Instalación

1. **Instalar dependencias:**

```bash
npm install
```

2. **Configurar variables de entorno:**

Copia el archivo de ejemplo según el entorno que vayas a usar:

**Para Desarrollo:**
```bash
# En Windows (PowerShell)
Copy-Item .env.development .env

# En Linux/Mac
cp .env.development .env
```

**Para Producción:**
```bash
# En Windows (PowerShell)
Copy-Item .env.production .env

# En Linux/Mac
cp .env.production .env
```

Edita el archivo `.env` con tus configuraciones específicas:

```env
PORT=3000
NODE_ENV=development  # o 'production'
DB_HOST=mysql
DB_PORT=3306
DB_NAME=project_management
DB_USER=app_user
DB_PASSWORD=app_password
DB_ROOT_USER=root
DB_ROOT_PASSWORD=rootpassword
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3001
```

3. **Base de datos (opcional si usas Docker):**

- Crear la base `project_management_development` en MySQL o actualizar las credenciales en el `.env`.  
- El proyecto cuenta con lógica para crear la BD automáticamente usando `DB_ROOT_USER/DB_ROOT_PASSWORD`.

## 🚀 Ejecución

### Modo Desarrollo (sin Docker)

```bash
npm run dev
```

El servidor se inicia en `http://localhost:3000`.

### Modo Producción

```bash
npm run build
npm start
```

### Docker Compose

```bash
# Desarrollo (hot reload, nodemon)
docker-compose -f ../docker-compose.development.yml up --build

# Producción (multi-stage, imágenes optimizadas)
docker-compose -f ../docker-compose.production.yml up --build -d
```

## 📚 Documentación de la API

Una vez que el servidor esté corriendo, accede a la documentación Swagger en:

```
http://localhost:3000/api-docs
```

## 🧪 Testing

### Ejecutar todos los tests:

```bash
npm test
```

### Ejecutar tests en modo watch:

```bash
npm run test:watch
```

### Generar reporte de cobertura:

```bash
npm run test:coverage
```

**Nota**: Los tests utilizan SQLite en memoria automáticamente (`NODE_ENV=test`). No necesitas levantar MySQL para la suite automatizada.

## 📁 Estructura del Proyecto

```
backend/
├── src/
│   ├── config/          # Configuraciones (database, swagger)
│   ├── controllers/     # Controladores de las rutas
│   ├── middleware/      # Middlewares (auth, errorHandler)
│   ├── models/          # Modelos de Sequelize + asociaciones
│   ├── routes/          # Definición de rutas
│   ├── utils/           # Utilidades (validators, generateToken)
│   ├── __tests__/       # Tests
│   └── index.ts         # Punto de entrada
├── dist/                # Código compilado (generado)
├── coverage/            # Reportes de cobertura (generado)
├── package.json
├── tsconfig.json
├── jest.config.js
├── .env.development    # Template para desarrollo
└── .env.production     # Template para producción
```

## 🔐 Endpoints Principales

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/me` - Obtener perfil del usuario autenticado

### Proyectos
- `GET /api/projects` - Listar proyectos (con paginación y búsqueda)
- `GET /api/projects/:id` - Obtener un proyecto
- `POST /api/projects` - Crear proyecto
- `PUT /api/projects/:id` - Actualizar proyecto
- `DELETE /api/projects/:id` - Eliminar proyecto
- `POST /api/projects/:id/collaborators` - Añadir colaborador
- `DELETE /api/projects/:id/collaborators/:userId` - Remover colaborador

### Tareas
- `GET /api/tasks` - Listar tareas (con filtros y ordenamiento)
- `GET /api/tasks/:id` - Obtener una tarea
- `POST /api/tasks` - Crear tarea
- `PUT /api/tasks/:id` - Actualizar tarea
- `DELETE /api/tasks/:id` - Eliminar tarea

### Estadísticas
- `GET /api/stats` - Obtener estadísticas del usuario

## 🔒 Seguridad

- **Hash de contraseñas**: bcryptjs con salt rounds de 10
- **JWT**: Tokens con expiración configurable
- **Helmet**: Headers de seguridad HTTP
- **CORS**: Configurado para permitir solo orígenes específicos
- **Rate Limiting**: Límite de 100 requests por 15 minutos
- **Validación**: express-validator para validar inputs
- **Autenticación**: Middleware para proteger rutas

## 📝 Notas

- Todas las rutas excepto `/api/auth/register` y `/api/auth/login` requieren autenticación JWT
- El token debe enviarse en el header: `Authorization: Bearer <token>`
- Solo el creador de un proyecto puede editarlo o eliminarlo
- Los colaboradores pueden ver y gestionar tareas del proyecto
- Las tareas pueden asignarse solo a colaboradores del proyecto

## 🐛 Troubleshooting

### Error de conexión a MySQL

Verifica que el contenedor/servidor esté arriba, credenciales correctas y puertos abiertos. Revisa los logs: `docker logs project_management_backend_development`.

### Migraciones/Seeds

El proyecto usa `sequelize.sync()` con seeds automáticos para perfiles y usuario admin. Si necesitas forzar recreación, elimina la base o usa `sequelize.sync({ force: true })` manualmente (no recomendado en producción).

### Puerto ya en uso

Actualiza `PORT` en `.env` o libera el puerto con `npx kill-port 3000`.
