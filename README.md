# Backend Magnolias - Sistema de Gestión de Postulaciones

Backend desarrollado con NestJS, Prisma y PostgreSQL para el portal de empleo Magnolias.

## 🚀 Tecnologías

- **NestJS** - Framework de Node.js
- **Prisma** - ORM para PostgreSQL
- **PostgreSQL** - Base de datos
- **Supabase** - Storage y autenticación
- **JWT** - Autenticación
- **Swagger** - Documentación API
- **Docker** - Contenedorización

## 📋 Requisitos Previos

- Node.js 18+
- PostgreSQL 14+
- npm o yarn

## 🛠️ Instalación Local

```bash
# Clonar el repositorio
git clone <tu-repo>
cd backend-magnolias

# Instalar dependencias
npm install

# Copiar archivo de variables de entorno
cp .env.example .env

# Editar .env con tus credenciales

# Generar cliente Prisma
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate

# Iniciar en modo desarrollo
npm run start:dev
```

## 🔧 Variables de Entorno

Configura las siguientes variables en tu archivo `.env`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/apt_db?schema=public"

# Supabase
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_KEY="your-supabase-service-key"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# API
PORT=3000
NODE_ENV=development
FRONTEND_URL="http://localhost:3001"

# AI Service
AI_SERVICE_URL="http://localhost:8000"

# n8n
N8N_WEBHOOK_URL="http://localhost:5678/webhook"
```

## 📦 Scripts Disponibles

```bash
# Desarrollo
npm run start:dev          # Modo desarrollo con hot-reload
npm run start:debug        # Modo debug

# Producción
npm run build              # Construir para producción
npm run start:prod         # Ejecutar en producción

# Prisma
npm run prisma:generate    # Generar cliente Prisma
npm run prisma:migrate     # Crear y ejecutar migración
npm run prisma:migrate:deploy  # Ejecutar migraciones en producción
npm run prisma:studio      # Abrir Prisma Studio

# Testing
npm run test               # Ejecutar tests
npm run test:watch         # Tests en modo watch
npm run test:cov           # Cobertura de tests

# Linting
npm run lint               # Ejecutar ESLint
npm run format             # Formatear código con Prettier
```

## 📚 Documentación API

Una vez iniciado el servidor, accede a la documentación Swagger en:

```
http://localhost:3000/api/docs
```

## 🏗️ Estructura del Proyecto

```
src/
├── app.module.ts           # Módulo principal
├── main.ts                 # Punto de entrada
├── common/                 # Módulos compartidos
│   └── prisma/            # Servicio de Prisma
└── modules/               # Módulos de la aplicación
    ├── auth/              # Autenticación y autorización
    ├── empresas/          # Gestión de empresas
    ├── postulantes/       # Gestión de postulantes
    ├── cargos/            # Gestión de cargos/ofertas
    ├── postulaciones/     # Gestión de postulaciones
    ├── ia/                # Servicio de IA
    └── storage/           # Gestión de archivos (Supabase)
```

## 🐳 Docker

```bash
# Construir imagen
docker build -t backend-magnolias .

# Ejecutar contenedor
docker run -p 3000:3000 --env-file .env backend-magnolias
```

## 🚀 Despliegue en Railway

Ver guía completa en [RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md)

Pasos rápidos:
1. Push a GitHub
2. Conecta Railway con tu repositorio
3. Agrega PostgreSQL en Railway
4. Configura variables de entorno
5. Railway desplegará automáticamente

## 🔐 Seguridad

- Todas las contraseñas se hashean con bcrypt
- Autenticación basada en JWT
- Validación de datos con class-validator
- CORS configurado
- Variables de entorno para credenciales sensibles

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

UNLICENSED - Uso privado

## 👥 Autores

**Magnolias Asesorías**

## 📞 Soporte

Para soporte, contacta a: [tu-email@magnolias.cl]
