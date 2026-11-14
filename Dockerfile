# API de AeroDocs (Node/Express). Se construye desde la carpeta backend.
FROM node:22-alpine

ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0

WORKDIR /app

# Dependencias primero, para aprovechar la caché de capas.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY . .


EXPOSE 3000

USER node

CMD ["node", "src/server.js"]
