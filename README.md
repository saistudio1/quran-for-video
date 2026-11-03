# QURAN LAYER — Quran Typography & Video Overlay Generator

Web-based Quran typography editor designed to generate high-resolution transparent PNG overlays for Islamic murattal videos, recitation reels, and social media content.

---

## 🚀 Panduan Deploy ke Netlify (netlify.app)

Aplikasi ini sudah 100% siap dideploy ke **Netlify**. Berkas `netlify.toml` dan `public/_redirects` sudah dikonfigurasi secara otomatis.

### Cara 1: Deploy Otomatis via GitHub (Direkomendasikan)
1. Push repositori kode ini ke akun **GitHub / GitLab** Anda.
2. Buka dashboard [Netlify](https://app.netlify.com/) dan klik **"Add new site"** > **"Import an existing project"**.
3. Pilih repository GitHub Anda.
4. Netlify akan mendeteksi `netlify.toml` secara otomatis:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Klik **"Deploy site"**. Dalam hitungan detik, aplikasi Anda akan online di subdomain `https://nama-situs.netlify.app`.

### Cara 2: Deploy Cepat via Netlify Drop (Tanpa Git)
1. Jalankan perintah build di terminal lokal:
   ```bash
   npm run build
   ```
2. Buka [app.netlify.com/drop](https://app.netlify.com/drop).
3. Seret (drag-and-drop) folder `dist` yang telah dihasilkan ke jendela browser Netlify.
4. Situs Anda langsung aktif dan dapat diakses publik.

---

## 🛠️ Fitur Utama
- **114 Surah Al-Qur'an**: Naskh digital terverifikasi Kemenag RI dengan harakat utuh dan terjemahan resmi Indonesia.
- **Kaidah Basmalah**:
  - Surah Al-Fatihah: Basmalah merupakan Ayat 1 mandiri (tidak ganda).
  - Surah At-Taubah: Basmalah ditiadakan otomatis sesuai kaidah mushaf Utsmani.
  - Surah lainnya: Basmalah menjadi opsi pembuka di awal surah (tidak mengulang di setiap ayat).
- **Tipografi Utsmani Terbuka**: Font berlisensi SIL OFL (*Amiri Quran*, *Amiri*, *Scheherazade New*, *Noto Naskh Arabic*).
- **Ekspor PNG Transparan Murni**: Ekspor PNG dengan alpha channel 100% tanpa background papan catur, siap pakai di CapCut, Premiere Pro, dan DaVinci Resolve.
- **Ekspor Batch ZIP**: Ekspor seluruh halaman sekaligus dalam format ZIP dengan penamaan berurutan.
