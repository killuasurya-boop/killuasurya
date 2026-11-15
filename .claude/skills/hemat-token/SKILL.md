---
name: hemat-token
description: Hemat token saat bekerja. Gunakan saat user minta menghemat token/biaya/konteks, atau sebelum tugas besar (cari kode, review, riset, sesi panjang). Mencari skill bawaan Claude Code dan skill tambahan di repo (.claude/skills) yang paling murah untuk tugas tersebut, lalu menerapkan aturan hemat.
---

# Hemat Token

## Langkah 1 — Cari skill pendukung (jangan baca isinya semua)
Jalankan, hanya membaca nama + deskripsi (1 baris per skill):

```bash
bash .claude/skills/hemat-token/scripts/list-skills.sh
```

Skrip memindai `.claude/skills/*/SKILL.md` (repo) dan `~/.claude/skills` (pribadi), lalu hanya mencetak `nama — deskripsi`. Pilih yang cocok dengan tugas; baru buka SKILL.md skill terpilih saja.

## Langkah 2 — Pilih skill/alat bawaan termurah
| Kebutuhan | Pakai | Alasan hemat |
|---|---|---|
| Cari kode di banyak file | agent `Explore` | Hasil ringkas, dump file tidak masuk konteks |
| Rapikan kode yang diubah | `/simplify` | Terbatas pada diff |
| Review perubahan | `/code-review low` | Level rendah = sedikit temuan, murah. Naik level hanya jika diminta |
| Kurangi prompt izin berulang | `/fewer-permission-prompts` | Kurangi bolak-balik |
| Tugas berulang | `/loop` dengan interval panjang | Hindari polling rapat |
| Konteks sudah panjang | `/compact` atau `/clear` saat ganti topik | Konteks dikirim ulang tiap giliran |
| Pertanyaan mudah/mekanis | model lebih kecil (`/model`) | Biaya per token lebih rendah |

Hindari: `/code-review max`, memunculkan banyak subagent, dan skill besar yang tidak relevan.

## Langkah 3 — Aturan kerja hemat
1. Baca sebagian file (`offset`/`limit`) atau `Grep` dulu; jangan baca file utuh tanpa perlu.
2. Gunakan `Grep`/`Glob`, bukan `cat`/`find` lewat Bash; batasi output (`head_limit`, `| head`).
3. Panggilan tool independen dijalankan paralel dalam satu giliran.
4. Jangan baca ulang file yang baru diedit atau sudah ada di konteks.
5. Jangan spawn subagent untuk tugas yang bisa dikerjakan langsung dalam 1–3 tool call.
6. Jawaban singkat: hasil dan keputusan saja, tanpa mengulang kode/diff yang sudah terlihat.
7. Perintah panjang (build/test) arahkan ke file dan tampilkan hanya bagian gagal (`tail`, `grep -n FAIL`).
8. Tambahkan `CLAUDE.md` ringkas di repo agar konteks proyek tidak ditelusuri ulang tiap sesi.

## Langkah 4 — Laporan
Sebutkan singkat skill/alat yang dipilih dan alasannya (1–3 baris). Jika tidak ada skill repo yang cocok, katakan itu dan lanjut dengan aturan Langkah 3.
