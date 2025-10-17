# Etapa de construcción
FROM node:20-slim AS builder

WORKDIR /app

# Instalar OpenSSL (Debian ya incluye la versión compatible con Prisma)
RUN apt-get update -y && apt-get install -y openssl ca-certificates

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias
RUN npm install --production=false

# Copiar código fuente
COPY . .

# Generar cliente Prisma
RUN npx prisma generate

# Construir aplicación
RUN npm run build

# Etapa de producción
FROM node:20-slim

WORKDIR /app

# Instalar OpenSSL (necesario para Prisma en runtime)
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Copiar archivos necesarios desde builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./

# Crear usuario no root
RUN groupadd -g 1001 nodejs && useradd -r -u 1001 -g nodejs nestjs
USER nestjs

# Exponer puerto
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando de inicio
CMD ["node", "dist/main"]
