# Fix: Error libssl.so.1.1 en Railway

## ❌ Problema

```
PrismaClientInitializationError: Unable to require(`/app/node_modules/.prisma/client/libquery_engine-linux-musl.so.node`).
Details: Error loading shared library libssl.so.1.1: No such file or directory
```

## 🔍 Causa

Prisma genera binarios nativos que dependen de **OpenSSL 1.1**, pero:
- Node 20 Alpine usa **OpenSSL 3** por defecto
- El motor de consultas de Prisma (`libquery_engine-linux-musl.so.node`) necesita específicamente OpenSSL 1.1

## ✅ Solución

Instalar el paquete de compatibilidad `openssl1.1-compat` en ambas etapas del Dockerfile:

```dockerfile
# Etapa de construcción
FROM node:20-alpine AS builder

# Instalar dependencias del sistema para Prisma (OpenSSL 1.1 requerido)
RUN apk add --no-cache openssl1.1-compat libc6-compat

# ... resto del Dockerfile

# Etapa de producción
FROM node:20-alpine

# Instalar dependencias del sistema para Prisma (OpenSSL 1.1 requerido)
RUN apk add --no-cache openssl1.1-compat libc6-compat

# ... resto del Dockerfile
```

## 📦 Paquetes instalados

- **`openssl1.1-compat`**: Proporciona las librerías OpenSSL 1.1 necesarias para Prisma
- **`libc6-compat`**: Proporciona compatibilidad adicional de librerías C (recomendado para binarios nativos)

## 🚀 Próximos pasos

1. **Commitear cambios:**
   ```bash
   git add Dockerfile
   git commit -m "fix: Instalar OpenSSL 1.1 para compatibilidad con Prisma en Alpine"
   git push origin main
   ```

2. **Railway desplegará automáticamente** con el Dockerfile actualizado

3. **Verificar logs** - Deberías ver:
   ```
   ✅ Database connected successfully
   🚀 Application is running on: http://localhost:3000
   ```

## 🔗 Referencias

- [Prisma Deployment - Railway](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-railway)
- [Alpine Linux OpenSSL compatibility](https://github.com/prisma/prisma/issues/861)
- [Railway + Prisma troubleshooting](https://docs.railway.app/troubleshoot/fixing-common-errors)

## ⚠️ Nota importante

Este problema **NO** afecta a desarrollo local en Windows porque usas el motor de consultas compilado para Windows que tiene sus propias dependencias.

El error **SOLO** ocurre en producción (Linux Alpine) donde Prisma usa el motor `linux-musl`.
