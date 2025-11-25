# Dockerfile para Frontend (React + Vite)
# Uso:
# ============================================
# Stage 1: Development
# Para desarrollo con Vite dev server (hot-reload)
# ============================================
FROM node:18-alpine AS development

WORKDIR /app

ARG VITE_API_URL=http://localhost:3000/api
ENV VITE_API_URL=$VITE_API_URL
ENV NODE_ENV=development

COPY package*.json ./

RUN npm install || npm install --legacy-peer-deps

COPY . .

EXPOSE 3001

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ============================================
# Stage 2: Builder
# ============================================
FROM node:18-alpine AS builder

WORKDIR /app

ARG VITE_API_URL=http://localhost:3000/api
ENV VITE_API_URL=$VITE_API_URL
ENV NODE_ENV=production

COPY package*.json ./

RUN npm install || npm install --legacy-peer-deps

COPY . .

RUN npm run build

# ============================================
# Stage 3: Production
# ============================================
FROM nginx:alpine AS production

ENV NODE_ENV=production

COPY --from=builder /app/dist /usr/share/nginx/html

RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location /api { \
        proxy_pass http://backend:3000; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade $http_upgrade; \
        proxy_set_header Connection "upgrade"; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
        proxy_set_header X-Forwarded-Proto $scheme; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

