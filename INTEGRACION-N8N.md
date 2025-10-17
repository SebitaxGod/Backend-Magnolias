# 🔗 Integración Backend ↔ n8n - Workflow de Análisis de CV

## 📋 Resumen

El backend de APT ahora está integrado con n8n para realizar análisis avanzados de postulaciones usando OpenAI. Cuando un candidato se postula a una vacante, el sistema automáticamente:

1. ✅ Crea la postulación en la base de datos
2. 🚀 Llama al webhook de n8n
3. 🤖 n8n ejecuta análisis avanzado con OpenAI (CV + Respuestas)
4. 💾 n8n actualiza la postulación con el resultado
5. ✉️ (Futuro) Envía notificaciones por email

---

## 🏗️ Arquitectura

```
Frontend (Next.js)
    ↓ POST /postulaciones
Backend (NestJS)
    ↓ Crea postulación en DB
    ↓ POST http://localhost:5678/webhook/analizar-postulacion
n8n Workflow
    ↓ GET /postulaciones/:id
    ↓ GET /vacantes/:id
    ↓ GET /candidatos/:id
    ↓ Descarga CV de Supabase
    ↓ Analiza con OpenAI GPT-4o-mini
    ↓ PATCH /postulaciones/:id (actualiza con scores)
Backend recibe actualización
    ↓
Frontend muestra resultado
```

---

## 📝 Cambios Realizados

### 1. **postulaciones.module.ts**
```typescript
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    IaModule,
    HttpModule, // ← NUEVO: Para hacer HTTP requests a n8n
  ],
  // ...
})
```

### 2. **postulaciones.service.ts**

#### Imports agregados:
```typescript
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
```

#### Constructor actualizado:
```typescript
constructor(
  private prisma: PrismaService,
  private iaService: IaService,
  private httpService: HttpService, // ← NUEVO
  private configService: ConfigService, // ← NUEVO
) {
  this.n8nWebhookUrl =
    this.configService.get<string>('N8N_WEBHOOK_URL') ||
    'http://localhost:5678/webhook/analizar-postulacion';
}
```

#### Método create() actualizado:
```typescript
// Antes:
this.evaluarConIA(postulacion.id).catch(...);

// Ahora:
this.triggerAnalisisN8n(postulacion.id).catch((err) => {
  console.error('❌ Error al triggear workflow de n8n:', err.message);
  // Fallback: usar evaluación antigua si n8n falla
  this.evaluarConIA(postulacion.id).catch(...);
});
```

#### Nuevo método triggerAnalisisN8n():
```typescript
private async triggerAnalisisN8n(postulacionId: number): Promise<void> {
  const response = await firstValueFrom(
    this.httpService.post(
      this.n8nWebhookUrl,
      { postulacionId },
      { timeout: 30000 }
    )
  );
  
  console.log(`✅ Workflow ejecutado`);
  console.log(`📊 Score: ${response.data?.analisis?.scoreFinal}`);
}
```

### 3. **backend/.env**
```properties
# n8n Webhook Configuration
N8N_WEBHOOK_URL="http://localhost:5678/webhook/analizar-postulacion"
```

---

## 🚀 Cómo Funciona

### **Paso 1: Usuario se postula**
```http
POST http://localhost:3001/api/postulaciones
Authorization: Bearer {token}
Content-Type: application/json

{
  "idVacante": 1,
  "respuestasJson": {
    "pregunta_1": "Tengo 5 años de experiencia en React...",
    "pregunta_2": "Lideré un equipo de 8 personas...",
    "pregunta_3": "Sí, trabajé con microservicios en AWS...",
    "pregunta_4": "Implementé testing con Jest y Cypress..."
  }
}
```

### **Paso 2: Backend crea postulación y llama a n8n**
```typescript
// Backend crea registro en DB
const postulacion = await this.prisma.postulacion.create({...});

// Backend llama a n8n (async, no bloquea)
await this.httpService.post('http://localhost:5678/webhook/analizar-postulacion', {
  postulacionId: postulacion.id
});
```

### **Paso 3: n8n ejecuta workflow**
El workflow de n8n hace:
1. **GET** `http://apt-backend:3000/postulaciones/{id}` → Obtiene postulación
2. **GET** `http://apt-backend:3000/vacantes/{id}` → Obtiene vacante
3. **GET** `http://apt-backend:3000/candidatos/{id}` → Obtiene candidato
4. **GET** `{cvUrl}` → Descarga CV desde Supabase
5. **Extrae texto del CV** (mock por ahora, OCR en producción)
6. **OpenAI Analysis:**
   ```
   System Prompt: "Eres un experto reclutador..."
   User Prompt: "Analiza esta postulación comparando CV vs Respuestas..."
   ```
7. **Recibe JSON de OpenAI:**
   ```json
   {
     "scoreCompatibilidad": 85,
     "scoreVeracidad": 72,
     "scoreFinal": 79.8,
     "fortalezas": ["6 años experiencia React", "Liderazgo demostrado"],
     "debilidades": ["Sin experiencia Vue.js"],
     "discrepancias": ["Dice 10 años pero CV muestra 6"],
     "recomendacion": "RECOMENDAR"
   }
   ```
8. **PATCH** `http://apt-backend:3000/postulaciones/{id}`:
   ```json
   {
     "puntajeIa": 79.8,
     "feedbackIa": "=== ANÁLISIS COMPLETO ===\n...",
     "estado": "EVALUADO"
   }
   ```

### **Paso 4: Backend recibe actualización**
La postulación ahora tiene:
- `puntajeIa`: 79.8
- `feedbackIa`: Texto con análisis completo
- `estado`: "EVALUADO"

---

## 🧪 Testing

### **Test 1: Verificar que el webhook se llama**
```powershell
# En terminal 1: Monitorear logs del backend
cd backend
npm run start:dev

# En terminal 2: Crear postulación
$token = "tu_token_jwt_aqui"
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}
$body = @{
    idVacante = 1
    respuestasJson = @{
        pregunta_1 = "5 años de experiencia en React"
        pregunta_2 = "Lideré equipo de 5 personas"
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/postulaciones" -Method Post -Headers $headers -Body $body
```

**Logs esperados en backend:**
```
🔔 Triggereando workflow n8n para postulación ID: 123
📡 Webhook URL: http://localhost:5678/webhook/analizar-postulacion
✅ Workflow n8n ejecutado exitosamente para postulación 123
📊 Score final: 79.8
💡 Recomendación: RECOMENDAR
```

### **Test 2: Verificar fallback si n8n está offline**
```powershell
# Detener n8n
docker stop apt-n8n

# Crear postulación (debería usar IA antigua)
# Logs esperados:
# ❌ Error al triggear workflow de n8n: connect ECONNREFUSED
# ℹ️  Usando evaluación IA antigua como fallback...
```

### **Test 3: Verificar respuesta de n8n**
```powershell
# Llamar directamente al webhook de n8n
$body = @{ postulacionId = 1 } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:5678/webhook/analizar-postulacion" -Method Post -Body $body -ContentType "application/json"
```

**Respuesta esperada:**
```json
{
  "success": true,
  "postulacionId": 1,
  "analisis": {
    "scoreCompatibilidad": 85,
    "scoreVeracidad": 72,
    "scoreFinal": 79.8,
    "fortalezas": ["..."],
    "debilidades": ["..."],
    "discrepancias": ["..."],
    "recomendacion": "RECOMENDAR"
  }
}
```

---

## 🔧 Configuración

### **Variables de Entorno**

#### **Desarrollo (n8n local):**
```properties
N8N_WEBHOOK_URL="http://localhost:5678/webhook/analizar-postulacion"
```

#### **Producción (n8n en Docker):**
```properties
N8N_WEBHOOK_URL="http://apt-n8n:5678/webhook/analizar-postulacion"
```

#### **Producción (n8n en servidor externo):**
```properties
N8N_WEBHOOK_URL="https://n8n.tudominio.com/webhook/analizar-postulacion"
```

### **Configurar credenciales de OpenAI en n8n**

1. Abrir n8n: `http://localhost:5678`
2. Settings → Credentials → Add New
3. Seleccionar "OpenAI API"
4. Pegar tu API Key de OpenAI
5. Guardar

---

## 🐛 Troubleshooting

### **Error: "connect ECONNREFUSED 127.0.0.1:5678"**
**Causa:** n8n no está corriendo
**Solución:**
```bash
docker ps | grep n8n
docker start apt-n8n
# o
cd n8n
npm start
```

### **Error: "Workflow n8n ejecutado pero postulación no se actualiza"**
**Causa:** El workflow de n8n tiene un error o no llegó al nodo PATCH
**Solución:**
1. Abrir n8n: `http://localhost:5678`
2. Workflow → Executions
3. Revisar última ejecución
4. Ver qué nodo falló

### **Error: "OpenAI API key not found"**
**Causa:** Credenciales de OpenAI no configuradas en n8n
**Solución:**
1. n8n → Settings → Credentials
2. Agregar "OpenAI API"
3. Pegar tu API key
4. Editar el workflow y seleccionar la credencial en el nodo OpenAI

### **Postulaciones quedan en estado "PENDIENTE" indefinidamente**
**Causa:** n8n no está activado o el webhook no está funcionando
**Solución:**
1. Verificar que el workflow esté **activo** (switch verde)
2. Verificar URL del webhook en n8n:
   - Nodo Webhook → Production URL
   - Debe ser: `http://localhost:5678/webhook/analizar-postulacion`
3. Verificar que coincida con `N8N_WEBHOOK_URL` en `.env`

---

## 📊 Monitoreo

### **Logs a observar en backend:**
```
🔔 Triggereando workflow n8n para postulación ID: X
📡 Webhook URL: http://localhost:5678/webhook/analizar-postulacion
✅ Workflow n8n ejecutado exitosamente para postulación X
📊 Score final: XX
💡 Recomendación: RECOMENDAR/REVISAR/NO_RECOMENDAR
```

### **Logs en n8n:**
- Ver ejecuciones: n8n → Workflow → Executions
- Ver errores: Cada nodo muestra un ícono rojo si falló
- Ver datos: Click en cada nodo para ver input/output

---

## 🚀 Próximos Pasos

### **1. Implementar notificaciones por email**
Agregar nodos en n8n:
- Email a candidato: "Tu postulación fue evaluada"
- Email a empresa: "Nueva postulación con score XX"

### **2. Implementar extracción real de PDF**
Reemplazar el nodo mock de "Extraer Texto CV" con:
- Google Cloud Vision API
- AWS Textract
- pdf-parse en un microservicio Node.js

### **3. Agregar dashboard de métricas**
- Total de postulaciones analizadas
- Score promedio por vacante
- Tiempo promedio de análisis
- Tasa de discrepancias detectadas

### **4. Cache de análisis**
Si el candidato se postula a múltiples vacantes, cachear el análisis del CV para no analizarlo múltiples veces.

---

## 📚 Referencias

- **n8n Docs:** https://docs.n8n.io
- **OpenAI API:** https://platform.openai.com/docs
- **NestJS HttpModule:** https://docs.nestjs.com/techniques/http-module
- **Workflow JSON:** Ver archivo `APT-Analisis-Completo-CV-Respuestas.json`
- **Guía de creación manual:** Ver archivo `GUIA-COMPLETAR-WORKFLOW-MANUAL.md`

---

## ✅ Checklist de Validación

Antes de considerar la integración completa, verificar:

- [x] HttpModule importado en PostulacionesModule
- [x] HttpService y ConfigService inyectados en PostulacionesService
- [x] Variable N8N_WEBHOOK_URL agregada a .env
- [x] Método triggerAnalisisN8n() implementado
- [x] Fallback a evaluarConIA() si n8n falla
- [x] Logs informativos en consola
- [ ] n8n workflow creado y activado
- [ ] Credenciales OpenAI configuradas en n8n
- [ ] Test end-to-end exitoso
- [ ] Postulación actualizada con puntajeIa y feedbackIa
- [ ] Dashboard muestra los resultados correctamente

---

**Fecha de última actualización:** 7 de octubre de 2025
**Autor:** Carlos (Dev Team)
**Versión:** 1.0.0
