# ============================================
# FRONTEND DOCKERFILE - Sittara Client
# ============================================

# Etapa 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Recibir build args
ARG VITE_API_URL=http://localhost:3001/api

# Crear .env para el build
RUN echo "VITE_API_URL=${VITE_API_URL}" > .env

# Copiar código fuente
COPY . .

# Build de producción
RUN npm run build

# Etapa 2: Production con Nginx
FROM nginx:alpine

# Copiar build al directorio de Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto
EXPOSE 80

# Nginx se inicia automáticamente
CMD ["nginx", "-g", "daemon off;"]
