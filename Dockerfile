# Etapa de construcción
FROM node:20-alpine AS builder

# Instalar dependencias del sistema para Prisma (OpenSSL 1.1 requerido)
RUN apk add --no-cache openssl1.1-compat libc6-compat

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias (usar npm install si no hay package-lock.json)
RUN npm install --production=false

# Copiar código fuente
COPY . .

# Generar cliente Prisma
RUN npx prisma generate

# Construir aplicación
RUN npm run build

# Etapa de producción
FROM node:20-alpine

# Instalar dependencias del sistema para Prisma (OpenSSL 1.1 requerido)
RUN apk add --no-cache openssl1.1-compat libc6-compat

WORKDIR /app

# Copiar archivos necesarios desde builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./

# Crear usuario no root
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001
USER nestjs

# Exponer puerto
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/docs', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando de inicio
CMD ["npm", "run", "start:prod"]
