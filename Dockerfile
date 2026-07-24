# ==============================================================================
# ESTAPA 1: Construcción (Builder)
# ==============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de definición de dependencias
COPY package*.json ./

# Instalar todas las dependencias (incluyendo devDependencies para poder compilar TypeScript)
RUN npm ci

# Copiar el código fuente y archivos de configuración del proyecto
COPY . .

# Compilar la aplicación NestJS a JavaScript producción
RUN npm run build

# ==============================================================================
# ETAPA 2: Producción limpia (Production)
# ==============================================================================
FROM node:20-alpine AS production

WORKDIR /app

# Establecer la variable de entorno a producción
ENV NODE_ENV=production

# Copiar los archivos de definición de dependencias
COPY package*.json ./

# Instalar únicamente las dependencias necesarias para la ejecución en producción
RUN npm ci --omit=dev

# Copiar el código transpilado desde la etapa de construcción
COPY --from=builder /app/dist ./dist

# Crear el directorio para archivos subidos
RUN mkdir -p uploads

# Exponer el puerto por defecto en el que escucha la aplicación NestJS (4100)
EXPOSE 4100

# Comando para iniciar la aplicación en producción
CMD ["node", "dist/main"]
