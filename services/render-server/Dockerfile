# Menggunakan Node.js versi 18 (Slim version berbasis Debian untuk ukuran kecil)
FROM node:18-slim

# Instalasi dependensi sistem yang wajib:
# - ffmpeg: Untuk memproses video, menggabungkan audio, dan render.
# - fonts-liberation: Paket font standar agar subtitle tidak kotak-kotak (tofu).
# - fontconfig: Utilitas manajemen font.
RUN apt-get update && apt-get install -y \
    ffmpeg \
    fonts-liberation \
    fontconfig \
    && rm -rf /var/lib/apt/lists/*

# Set direktori kerja di dalam container
WORKDIR /app

# Salin file package.json terlebih dahulu untuk memanfaatkan Docker Layer Caching
# Jika dependensi tidak berubah, langkah 'npm install' akan dilewati (cache)
COPY package*.json ./

# Instal dependensi Node.js
RUN npm install

# Salin seluruh kode sumber ke dalam container
COPY . .

# Build kode TypeScript menjadi JavaScript (dist folder)
RUN npm run build

# Buat folder temp untuk pemrosesan video (opsional, tapi good practice)
RUN mkdir -p temp

# Buka port 3002 (Port default render server)
EXPOSE 3002

# Jalankan aplikasi (npm start biasanya menjalankan 'node dist/index.js')
CMD ["npm", "start"]
