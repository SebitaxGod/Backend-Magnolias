# Railway Deployment Guide

## 🚀 Pasos para desplegar en Railway

### 1. Preparar el Repositorio
```bash
git add .
git commit -m "Configuración para despliegue en Railway"
git push origin main
```

### 2. Crear Proyecto en Railway
1. Ve a [railway.app](https://railway.app)
2. Crea una nueva cuenta o inicia sesión
3. Click en "New Project"
4. Selecciona "Deploy from GitHub repo"
5. Autoriza Railway y selecciona este repositorio

### 3. Configurar Base de Datos PostgreSQL
1. En tu proyecto de Railway, click en "+ New"
2. Selecciona "Database" → "PostgreSQL"
3. Railway creará automáticamente la base de datos

### 4. Variables de Entorno
En Railway, ve a tu servicio backend → "Variables" y agrega:

```env
# Database (Railway auto-genera DATABASE_URL cuando agregas PostgreSQL)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-supabase-service-key

# JWT
JWT_SECRET=tu-clave-secreta-super-segura-generada-aleatoriamente
JWT_EXPIRES_IN=7d

# API
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://tu-frontend.vercel.app

# AI Service
AI_SERVICE_URL=https://tu-servicio-ia.railway.app

# n8n
N8N_WEBHOOK_URL=https://tu-n8n.railway.app/webhook
```

### 5. Configurar Build & Deploy
Railway detectará automáticamente tu Dockerfile. Si prefieres no usar Docker:

1. Ve a "Settings" → "Build"
2. Build Command: `npm run build && npm run prisma:migrate:deploy`
3. Start Command: `npm run start:prod`

### 6. Ejecutar Migraciones
Después del primer despliegue, las migraciones se ejecutarán automáticamente gracias a `prisma:migrate:deploy`.

Si necesitas ejecutar migraciones manualmente:
```bash
# En Railway CLI o desde el Dashboard
npx prisma migrate deploy
```

### 7. Verificar Despliegue
1. Railway te dará una URL pública (ej: `https://tu-app.railway.app`)
2. Verifica que la API funcione: `https://tu-app.railway.app/api/docs`

## 🔒 Seguridad

### Generar JWT_SECRET seguro
```bash
# En tu terminal local
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### CORS
Actualiza `FRONTEND_URL` con la URL real de tu frontend en producción.

## 📊 Monitoreo
- Railway proporciona logs en tiempo real
- Métricas de CPU, RAM y Network
- Configura alertas en "Settings" → "Notifications"

## 🔄 CI/CD
Railway automáticamente re-despliega cuando haces push a la rama configurada (main por defecto).

## 💡 Consejos
- Usa variables de Railway para referencias entre servicios: `${{SERVICE_NAME.VARIABLE}}`
- Configura dominios custom en "Settings" → "Domains"
- Activa "Auto-deploy" para despliegues automáticos
- Usa "Healthchecks" para monitorear el estado de la aplicación

## 🆘 Troubleshooting

### Error de migraciones
```bash
railway run npx prisma migrate deploy
```

### Verificar variables de entorno
```bash
railway run env
```

### Ver logs en tiempo real
```bash
railway logs
```
