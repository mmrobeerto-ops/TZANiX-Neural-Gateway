# Dockerfile para el Portal Frontend Next.js (TZANiX Command Center)
FROM node:18-alpine AS builder

WORKDIR /app

# Instalar dependencias primero para aprovechar la caché de capas de Docker
COPY package*.json ./
RUN npm install

# Copiar el código fuente y compilar para producción
COPY . .
RUN npm run build

# Etapa final de producción para correr el servidor
FROM node:18-alpine AS runner

WORKDIR /app

# Copiar dependencias de producción y compilados desde la etapa constructora
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Ajustar variables de entorno para producción
ENV NODE_ENV=production
ENV PORT=3000
# El host se abre a 0.0.0.0 para que Docker pueda redireccionar los puertos
ENV HOSTNAME="0.0.0.0"

EXPOSE 3000

CMD ["npm", "run", "start"]
