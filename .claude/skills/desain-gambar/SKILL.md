---
name: desain-gambar
description: Wajib dipakai saat user minta membuat/merender gambar, foto realistis, banner, poster, mockup, konten visual, atau video promosi. Memilih jalur gratis termurah (Playwright, foto gratis, Remotion) sebelum yang berkredit (Adobe Firefly).
---

# Desain & Render Gambar (gratis dulu)

## Pilih jalur (urut dari gratis)
1. **Banner/poster/mockup/grafik teks** → buat HTML+CSS, render ke PNG dengan Playwright (sudah terpasang, `deviceScaleFactor: 2`). Gratis tanpa batas.
2. **Butuh foto nyata** → foto gratis Unsplash/Pexels (boleh komersial; cek lisensi terbaru, cantumkan sumber bila diminta).
3. **Edit foto milik user** (hapus/blur background, crop, perluas, efek) → MCP Adobe (`adobe_mandatory_init` dulu).
4. **Foto realistis AI yang tak ada stoknya** → Adobe Firefly via MCP Adobe. Kredit gratis terbatas: beri tahu user sebelum memakai.
5. **Video promosi** → `remotion:*` (render lokal gratis); HyperFrames hanya bila user minta proyek HeyGen.
6. **Desain di kanvas** → Stewdio MCP bila setup akun user selesai.

Canva/Figma: plugin ada tapi sering gagal terhubung; jangan andalkan.

## Kualitas
- Warna/font brand → `anthropic-skills:theme-factory`; nilai hasil → `design:design-critique`.
- Ukuran umum: Instagram 1080×1080 / 1080×1350, story 1080×1920, banner web 1920×1080, OG image 1200×630.
- Kirim hasil ke user dengan `SendUserFile`.

## Aturan
- Gabung dengan `hemat-token`; untuk visual website gabung dengan `website-bisnis`.
- Jangan pakai fitur berbayar/berkredit tanpa memberi tahu user.
- Jangan membuat gambar yang meniru orang nyata atau merek lain tanpa izin.
