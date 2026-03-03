FROM node:20-slim

WORKDIR /app

# 1) Önce dependency dosyalarını kopyala (cache için)
COPY package*.json ./

# 2) Bağımlılıkları deterministik kur (CI/CD için ideal)
RUN npm ci --omit=dev

# 3) Uygulama kodunu kopyala
COPY src ./src

# Cloud Run varsayılan olarak 8080 bekler
ENV PORT=8080
EXPOSE 8080

# Container başlayınca çalışacak komut
CMD ["npm", "start"]