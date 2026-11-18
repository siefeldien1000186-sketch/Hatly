FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Production Environment variables for Vite build
ENV VITE_API_URL=https://hatly-backend-production.up.railway.app/api/v1
ENV VITE_SOCKET_URL=https://hatly-backend-production.up.railway.app
ENV VITE_DEFAULT_COUNTRY=Egypt
ENV VITE_DEFAULT_CURRENCY=EGP
ENV VITE_DEFAULT_LANGUAGE=ar

RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
