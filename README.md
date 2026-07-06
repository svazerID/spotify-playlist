# Spotify Playlist Web Player

Sebuah aplikasi web pemutar musik berbasis web yang dikembangkan dengan antarmuka yang sangat identik dengan aplikasi mobile Spotify. Aplikasi ini memungkinkan pengguna untuk memutar lagu-lagu dari *link* playlist Spotify asli dengan dukungan audio *streaming* secara langsung di dalam browser.

## ✨ Fitur Utama

- **UI/UX Mobile-First:** Desain tampilan yang sangat mirip dengan antarmuka aplikasi seluler Spotify modern. Dilengkapi efek sentuhan, desain *glassmorphism*, dan transisi yang mulus.
- **Auto-Sync Audio:** Streaming audio berkecepatan tinggi tanpa hambatan menggunakan `yt-dlp` di sisi server.
- **HD Cover Art (Lazy Loading):** Sampul album dan lagu akan dimuat secara otomatis dalam resolusi tinggi dari Apple/iTunes API untuk menjaga ukuran aplikasi tetap ringan dan *loading* yang instan.
- **Track & Playlist Parsing:** Mampu menarik data (judul lagu dan nama artis) dari link playlist Spotify publik apa pun.
- **Mini Player & Full Screen Player:** Dua mode *player* layaknya di aplikasi Spotify asli. Mini player selalu mengambang, sedangkan *Full Screen Player* memiliki fitur kontrol interaktif (Progress bar real-time, Play, Pause, Next, Prev, Share).
- **Auto-Play Default Playlist:** Dapat disetting untuk langsung membuka *playlist* bawaan dengan cepat saat situs dibuka.

## 🛠️ Teknologi yang Digunakan

**Frontend:**
- HTML5
- Vanilla CSS3 (Desain kustom responsif)
- Vanilla JavaScript
- Font Awesome 6 (Ikon)

**Backend:**
- Node.js
- Express.js (REST API Server)
- `spotify-url-info` (Scraper Metadata Spotify)
- `yt-dlp` via Python (Streaming Audio extractor)
- `child_process` (Eksekusi tugas *background*)

## 🚀 Prasyarat Instalasi

Sebelum menjalankan aplikasi ini, pastikan sistem Anda sudah terinstal perangkat lunak berikut:
1. **Node.js** (Disarankan versi LTS terbaru)
2. **Python 3** (Untuk menjalankan modul pengunduh video/audio)
3. **yt-dlp** (Modul pengunduh YouTube tingkat lanjut)

Untuk menginstal `yt-dlp`, jalankan perintah berikut di terminal:
```bash
python -m pip install -U yt-dlp
```

## 📦 Cara Instalasi dan Menjalankan Server

1. **Clone/Download** repositori kode sumber ini ke dalam lokal direktori Anda.
2. Buka Terminal / *Command Prompt* arahkan ke *folder* proyek.
3. Instal semua dependensi server `Node.js` dengan perintah:
   ```bash
   npm install
   ```
4. Jalankan *backend server*:
   ```bash
   node server.js
   ```
5. Server akan berjalan di `http://localhost:3000`.

## 🌐 Cara Menggunakan Aplikasi

1. Buka file `index.html` menggunakan fitur *Live Server* dari ekstensi VS Code Anda (atau akses `http://localhost:8080` jika menggunakan HTTP-server statis).
2. Tampilan web akan langsung memuat *Playlist Default* bawaan secara otomatis!
3. Jika ingin memutar *playlist* lain, cukup salin tautan URL *Playlist* publik apa saja dari Spotify, *paste* di kolom input pencarian di atas, dan klik tombol "Cari".
4. Klik pada lagu apa pun di daftar lagu, dan musik akan mulai diputar.
5. Anda dapat mengetuk *Mini-Player* di bagian bawah untuk membuka kontrol penuh (*Full Screen Player*).

## 📝 Catatan Penting
- Karena sistem menarik audio stream dari sumber eksternal tanpa kunci API berbayar, waktu muat (*load time*) audio bisa mencapai 1-3 detik, bergantung pada koneksi internet server dan perangkat Anda.
- Hanya mendukung *link* **Playlist Publik** dari Spotify.

---
*Dibuat untuk tujuan edukasi dan pembelajaran desain UI/UX.*
