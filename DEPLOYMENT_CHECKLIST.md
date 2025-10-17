# ✅ Checklist de Despliegue a Producción en Railway

## 📋 Pre-Despliegue

### Archivos de Configuración
- [x] `.gitignore` - Creado y configurado
- [x] `.dockerignore` - Creado y configurado
- [x] `.env.example` - Actualizado con todas las variables
- [x] `railway.json` - Configuración de Railway
- [x] `Dockerfile` - Optimizado con healthcheck
- [x] `package.json` - Scripts de migración agregados
- [x] `README.md` - Documentación completa
- [x] `RAILWAY_DEPLOY.md` - Guía de despliegue

### Código
- [x] Healthcheck endpoint agregado (`/health`)
- [x] CORS configurado con `FRONTEND_URL`
- [x] Puerto dinámico con `process.env.PORT`
- [x] NODE_ENV configurado
- [x] Prisma migrate deploy script

## 🔐 Seguridad (IMPORTANTE)

### Antes de Subir a GitHub
- [ ] **NUNCA** subir archivo `.env` con credenciales reales
- [ ] Verificar que `.env` está en `.gitignore`
- [ ] Generar nuevo `JWT_SECRET` para producción
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```

### Variables Sensibles
- [ ] `JWT_SECRET` - Generar uno nuevo y seguro
- [ ] `DATABASE_URL` - Railway lo generará automáticamente
- [ ] `SUPABASE_SERVICE_KEY` - Mantener en secreto
- [ ] Contraseñas - Nunca en código fuente

## 🚀 Proceso de Despliegue

### 1. Git y GitHub
```bash
# Verificar que no hay archivos sensibles
git status

# Agregar todos los archivos
git add .

# Commit
git commit -m "feat: Configuración para despliegue en Railway"

# Push
git push origin main
```

### 2. Railway - Crear Proyecto
- [ ] Ir a https://railway.app
- [ ] Crear cuenta o login
- [ ] Click "New Project"
- [ ] Seleccionar "Deploy from GitHub repo"
- [ ] Autorizar Railway en GitHub
- [ ] Seleccionar repositorio "Backend Magnolias"

### 3. Railway - Agregar PostgreSQL
- [ ] En tu proyecto, click "+ New"
- [ ] Seleccionar "Database" → "PostgreSQL"
- [ ] Esperar a que se cree
- [ ] Copiar `DATABASE_URL` generada (opcional, Railway la vincula automáticamente)

### 4. Railway - Variables de Entorno

En tu servicio backend → Variables → Raw Editor, pega:

```env
# Database - Railway auto-conecta PostgreSQL
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Supabase - COMPLETAR CON TUS VALORES REALES
SUPABASE_URL=https://XXXXX.supabase.co
SUPABASE_KEY=tu-supabase-anon-key
SUPABASE_SERVICE_KEY=tu-supabase-service-key

# JWT - GENERAR NUEVO SECRET SEGURO
JWT_SECRET=GENERAR_CON_COMANDO_CRYPTO
JWT_EXPIRES_IN=7d

# API
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://tu-frontend-url.vercel.app

# AI Service - ACTUALIZAR CON URL REAL
AI_SERVICE_URL=https://tu-servicio-ia.railway.app

# n8n - ACTUALIZAR CON URL REAL
N8N_WEBHOOK_URL=https://tu-n8n-instance.railway.app/webhook
```

### 5. Railway - Configuración del Servicio
- [ ] Railway detectará automáticamente el Dockerfile
- [ ] Verificar en Settings → Build que usa "Dockerfile"
- [ ] Railway desplegará automáticamente

### 6. Verificación Post-Despliegue
- [ ] Esperar a que termine el build (5-10 minutos)
- [ ] Railway te dará una URL: `https://backend-magnolias.railway.app`
- [ ] Verificar endpoint health: `https://tu-url.railway.app/health`
- [ ] Verificar Swagger: `https://tu-url.railway.app/api/docs`
- [ ] Revisar logs en Railway Dashboard

### 7. Configuración Adicional
- [ ] Configurar dominio custom (opcional)
  - Settings → Domains → Add Domain
- [ ] Habilitar Auto-deploy
  - Settings → Deploy → Auto-deploy: ON
- [ ] Configurar notificaciones
  - Settings → Notifications

## 🔧 Testing en Producción

### Endpoints a Probar
```bash
# Health Check
curl https://tu-url.railway.app/health

# Swagger Docs
curl https://tu-url.railway.app/api/docs

# Login (ejemplo)
curl -X POST https://tu-url.railway.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{"correo":"test@test.com","contrasena":"test123"}'
```

## 📊 Monitoreo

### Railway Dashboard
- [ ] Revisar métricas de CPU y RAM
- [ ] Configurar alertas de uptime
- [ ] Monitorear logs en tiempo real
- [ ] Verificar uso de recursos

### Logs Importantes
```bash
# Ver logs en tiempo real (Railway CLI)
railway logs --follow

# Filtrar errores
railway logs | grep ERROR
```

## 🐛 Troubleshooting Común

### Build Falla
```bash
# Revisar logs de build
# Verificar que todas las dependencias estén en package.json
# Verificar que el Dockerfile sea correcto
```

### Migraciones No Se Ejecutan
```bash
# Ejecutar manualmente
railway run npx prisma migrate deploy
```

### Error de Conexión a DB
```bash
# Verificar que DATABASE_URL esté configurada
# Verificar formato: postgresql://user:password@host:5432/database
# Verificar que PostgreSQL esté corriendo
```

### CORS Errors
```bash
# Verificar FRONTEND_URL en variables de entorno
# Actualizar origin en main.ts si es necesario
```

## ✨ Optimizaciones Post-Despliegue

### Performance
- [ ] Configurar conexión pool de Prisma
- [ ] Implementar rate limiting
- [ ] Configurar cache (Redis)
- [ ] Optimizar queries N+1

### Seguridad
- [ ] Implementar helmet.js
- [ ] Configurar rate limiting por IP
- [ ] Implementar API keys para servicios externos
- [ ] Configurar HTTPS (Railway lo hace automáticamente)

### Monitoring
- [ ] Integrar Sentry para error tracking
- [ ] Configurar logging estructurado
- [ ] Implementar métricas con Prometheus (opcional)

## 📝 Notas Importantes

1. **Railway ofrece $5 USD gratis al mes** - Suficiente para desarrollo/testing
2. **Auto-sleep**: El servicio puede dormir si no recibe tráfico (solo en plan gratuito)
3. **Logs**: Railway mantiene logs por 7 días
4. **Backups**: Configurar backups automáticos de PostgreSQL
5. **Escalabilidad**: Railway permite escalar verticalmente fácilmente

## 🎯 Próximos Pasos

Después del despliegue exitoso:
- [ ] Actualizar FRONTEND_URL en el frontend
- [ ] Configurar CI/CD para tests automáticos
- [ ] Implementar staging environment
- [ ] Configurar monitoreo de uptime (UptimeRobot, etc.)
- [ ] Documentar API endpoints para el equipo

---

**¿Listo para desplegar?** Sigue esta checklist paso a paso. 🚀

**¿Problemas?** Revisa los logs en Railway Dashboard o contacta al soporte.
