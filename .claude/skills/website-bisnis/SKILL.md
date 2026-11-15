---
name: website-bisnis
description: Wajib dipakai saat user minta membuat/memperbaiki website, landing page, company profile, halaman produk/jasa, atau copywriting/marketing untuk website. Mengarahkan ke skill & MCP gratis yang tepat dan alur kerja agar jasa/produk banyak peminat.
---

# Website Bisnis + Copywriting

## Data yang dibutuhkan (tanyakan sekali jika belum ada)
Nama perusahaan, jasa/produk, target pelanggan, keunggulan, kontak (WhatsApp/email), warna/logo brand.

## Alur kerja (urut)
1. **Riset pesaing** → `marketing:competitive-brief` — cari keunggulan pembeda.
2. **Copywriting** → `marketing:content-creation` / `marketing:draft-content`
   - Struktur halaman: Hero (headline manfaat + CTA) → Masalah klien → Layanan → Keunggulan → Bukti (testimoni, klien, angka) → Harga/paket → FAQ → CTA akhir + kontak.
   - Pakai rumus AIDA/PAS, fokus manfaat bukan fitur, CTA jelas (mis. "Konsultasi Gratis via WhatsApp").
3. **Teks UI** → `design:ux-copy` (tombol, form, menu).
4. **Bangun website** → `vercel:nextjs` + `vercel:shadcn`; tema → `anthropic-skills:theme-factory`; halaman cepat → `anthropic-skills:web-artifacts-builder`.
5. **SEO & kualitas** → `marketing:seo-audit`, `design:accessibility-review`, `marketing:brand-review`.
6. **Cek tampilan** → Playwright (sudah terpasang): screenshot mobile & desktop.
7. **Follow-up calon klien** → `marketing:email-sequence` (opsional).

## Hosting gratis
Netlify, Cloudflare Pages, atau GitHub Pages untuk situs statis. Vercel Hobby **tidak** untuk komersial. Cek ketentuan terbaru sebelum deploy.

## Aturan
- Gabung dengan skill `hemat-token`: muat hanya skill yang dibutuhkan pada langkah yang sedang dikerjakan.
- Jangan mengarang testimoni, klien, atau angka; pakai placeholder yang jelas (`[Testimoni klien]`) bila data belum ada.
