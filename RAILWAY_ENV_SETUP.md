# 🔐 Configuración de Variables de Entorno en Railway

## ⚠️ ACCIÓN REQUERIDA

Tu aplicación se está ejecutando pero **faltan las credenciales de Supabase**. Sigue estos pasos para configurarlas:

---

## 📝 Variables de Entorno Requeridas

### 1. Variables de Base de Datos (✅ Ya configuradas por Railway)
```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

### 2. Variables de Supabase (❌ FALTAN - Configurar ahora)

Ve a tu proyecto de Supabase y obtén las credenciales:

1. **Ir a Supabase Dashboard**: https://supabase.com/dashboard
2. **Seleccionar tu proyecto** (o crear uno nuevo)
3. **Settings → API**

Copia estos valores:

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu-anon-key-publica
SUPABASE_SERVICE_KEY=tu-service-role-key-secreta
```

### 3. Variables de JWT (❌ FALTAN - Configurar ahora)

Genera un secret seguro:

```bash
# En tu terminal local ejecuta:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copia el resultado y agrégalo:

```env
JWT_SECRET=el-hash-generado-aqui
JWT_EXPIRES_IN=7d
```

### 4. Variables de API (⚠️ CONFIGURAR)

```env
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://tu-frontend-url.vercel.app
```

### 5. Variables de Servicios Externos (Opcionales por ahora)

```env
# AI Service (configurar cuando esté listo)
AI_SERVICE_URL=https://tu-servicio-ia.railway.app

# n8n (configurar cuando esté listo)
N8N_WEBHOOK_URL=https://tu-n8n.railway.app/webhook
```

---

## 🚀 Cómo Configurar en Railway

### Opción 1: Interfaz Web (Recomendado)

1. **Ve a tu proyecto en Railway**: https://railway.app/dashboard
2. **Selecciona tu servicio backend**
3. **Click en la pestaña "Variables"**
4. **Click en "Raw Editor"**
5. **Pega las variables** (formato `KEY=value`, una por línea):

```env
# Database - Ya debería estar
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Supabase - COMPLETAR CON TUS VALORES REALES
SUPABASE_URL=https://XXXXX.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# JWT - GENERAR Y PEGAR
JWT_SECRET=tu-secret-generado-de-64-bytes
JWT_EXPIRES_IN=7d

# API
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://tu-frontend.vercel.app

# Servicios opcionales (configurar más tarde)
AI_SERVICE_URL=https://tu-ia.railway.app
N8N_WEBHOOK_URL=https://tu-n8n.railway.app/webhook
```

6. **Click "Save"** o presiona `Ctrl/Cmd + S`
7. **Railway re-desplegará automáticamente** con las nuevas variables

### Opción 2: Railway CLI

```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Agregar variables
railway variables set SUPABASE_URL=https://tu-proyecto.supabase.co
railway variables set SUPABASE_KEY=tu-anon-key
railway variables set SUPABASE_SERVICE_KEY=tu-service-key
railway variables set JWT_SECRET=tu-secret-generado
railway variables set JWT_EXPIRES_IN=7d
railway variables set NODE_ENV=production
railway variables set FRONTEND_URL=https://tu-frontend.com
```

---

## ✅ Verificación Post-Configuración

Después de configurar las variables:

1. **Railway re-desplegará automáticamente** (tarda ~2-5 minutos)

2. **Revisa los logs** en Railway Dashboard:
   ```
   ✅ Supabase Storage configured successfully
   🚀 Application is running on: http://0.0.0.0:3000
   ```

3. **Verifica que la aplicación esté activa**:
   - Health: `https://tu-app.railway.app/health`
   - Docs: `https://tu-app.railway.app/api/docs`

---

## 🆘 Troubleshooting

### Error persiste después de configurar variables

1. **Verificar que las variables se guardaron**:
   - Railway Dashboard → Variables
   - Verifica que todas estén presentes

2. **Forzar re-despliegue**:
   - Dashboard → Deployments
   - Click en "..." → "Redeploy"

3. **Verificar credenciales de Supabase**:
   - Ve a Supabase Dashboard
   - Settings → API
   - Copia de nuevo las keys (pueden haber cambiado)

### Storage Service sigue deshabilitado

Si ves en los logs:
```
⚠️  Supabase credentials not configured. Storage features will be disabled.
```

Significa que las variables no están llegando. Verifica:
- Que los nombres de las variables sean exactos (case-sensitive)
- `SUPABASE_URL` (no `SUPABASE_API_URL`)
- `SUPABASE_SERVICE_KEY` (no `SUPABASE_KEY_SERVICE`)

---

## 📋 Checklist de Variables

Marca cuando configures cada una:

- [ ] `DATABASE_URL` - Auto-configurada por Railway
- [ ] `SUPABASE_URL` - Desde Supabase Dashboard
- [ ] `SUPABASE_KEY` - Anon key pública
- [ ] `SUPABASE_SERVICE_KEY` - Service role key (secreta)
- [ ] `JWT_SECRET` - Generado con crypto
- [ ] `JWT_EXPIRES_IN` - 7d (o el tiempo que prefieras)
- [ ] `NODE_ENV` - production
- [ ] `PORT` - 3000
- [ ] `FRONTEND_URL` - URL de tu frontend

### Opcionales (configurar después):
- [ ] `AI_SERVICE_URL` - Cuando tengas el servicio de IA
- [ ] `N8N_WEBHOOK_URL` - Cuando configures n8n

---

## 🎯 Próximos Pasos

1. **Configura Supabase Storage**:
   - Ve a Supabase → Storage
   - Crea un bucket llamado `cvs`
   - Configura políticas de acceso público si es necesario

2. **Actualiza FRONTEND_URL**:
   - Una vez que despliegues el frontend
   - Actualiza esta variable con la URL real

3. **Prueba el endpoint de storage**:
   ```bash
   curl -X POST https://tu-app.railway.app/storage/upload \
     -H "Authorization: Bearer tu-jwt-token" \
     -F "file=@test.pdf"
   ```

---

**¿Necesitas ayuda?** Revisa los logs en Railway Dashboard o contacta al equipo.
