import 'server-only';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument, StandardFonts, rgb, degrees, type PDFFont, type PDFPage } from 'pdf-lib';
import { siteUrl, whatsapp } from '@/content/site';

export type QuotePdf = {
  number: string; title: string; client: string; status: string; date: string; sentAt?: string | null;
  items: { desc: string; qty: number; price: number }[]; total: number; notes?: string; demo?: boolean;
};

const INK = rgb(0.09, 0.08, 0.13), MUTED = rgb(0.38, 0.37, 0.45), PURPLE = rgb(0.51, 0.22, 0.96), LIME = rgb(0.78, 0.96, 0.05), LINE = rgb(0.86, 0.85, 0.9);
const rp = (n: number) => 'Rp ' + Math.round(n).toLocaleString('id-ID');
const STATUS: Record<string, string> = { draft: 'DRAFT — belum disetujui', awaiting_owner: 'Menunggu persetujuan', sent: 'Terkirim', accepted: 'Diterima', revision: 'Revisi', rejected: 'Ditolak' };

/** Keep only characters the built-in PDF fonts can draw (WinAnsi); anything else becomes '?'. */
function safe(font: PDFFont, s: string) {
  return [...String(s ?? '').replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/→/g, '->')]
    .map((ch) => { try { font.encodeText(ch); return ch; } catch { return ch === '\n' ? '\n' : '?'; } }).join('');
}
function wrap(font: PDFFont, size: number, text: string, width: number): string[] {
  const out: string[] = [];
  for (const para of safe(font, text).split('\n')) {
    let line = '';
    for (const w of para.split(/\s+/)) {
      const t = line ? `${line} ${w}` : w;
      if (font.widthOfTextAtSize(t, size) <= width) line = t;
      else { if (line) out.push(line); line = w; }
    }
    out.push(line);
  }
  return out;
}

export async function quotationPdf(q: QuotePdf): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`Penawaran ${q.number} — ${q.client}`); doc.setAuthor('KILLUASURYA.TECH'); doc.setCreator('Agency OS');
  const reg = await doc.embedFont(StandardFonts.Helvetica), bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const logo = await doc.embedPng(await readFile(path.join(process.cwd(), 'public/assets/killuasurya/brand/logo-killuasurya-tech-pdf.png')));
  const W = 595.28, H = 841.89, M = 48;
  let page: PDFPage = doc.addPage([W, H]);
  let y = H - M;
  const text = (s: string, x: number, yy: number, size = 10, font = reg, color = INK) => page.drawText(safe(font, s), { x, y: yy, size, font, color });
  const right = (s: string, xr: number, yy: number, size = 10, font = reg, color = INK) => text(s, xr - font.widthOfTextAtSize(safe(font, s), size), yy, size, font, color);
  const mark = () => {
    const wm = q.demo ? 'DATA DEMO - CONTOH' : q.status === 'draft' ? 'DRAFT' : '';
    if (wm) page.drawText(wm, { x: 95, y: 200, size: wm.length > 10 ? 50 : 72, font: bold, color: rgb(0.85, 0.83, 0.9), rotate: degrees(35), opacity: 0.45 });
  };
  const footer = () => {
    page.drawLine({ start: { x: M, y: 52 }, end: { x: W - M, y: 52 }, thickness: 0.6, color: LINE });
    text(`KILLUASURYA.TECH  ·  WhatsApp ${whatsapp.display}  ·  ${siteUrl.replace(/^https?:\/\//, '')}`, M, 38, 8.5, reg, MUTED);
    right(`Halaman ${doc.getPageCount()}`, W - M, 38, 8.5, reg, MUTED);
  };
  mark();

  // header
  const lh = 44, lw = (logo.width / logo.height) * lh;
  page.drawImage(logo, { x: M, y: y - lh, width: lw, height: lh });
  right('PENAWARAN HARGA', W - M, y - 14, 16, bold, INK);
  right(`No. ${q.number}`, W - M, y - 30, 10, reg, MUTED);
  right(`Tanggal ${q.date}`, W - M, y - 43, 10, reg, MUTED);
  y -= lh + 22;
  page.drawRectangle({ x: M, y: y - 2, width: W - 2 * M, height: 3, color: LIME });
  y -= 26;

  text('Kepada', M, y, 9, reg, MUTED); text('Status', W / 2 + 20, y, 9, reg, MUTED); y -= 15;
  text(q.client || '-', M, y, 12, bold); text(STATUS[q.status] ?? q.status, W / 2 + 20, y, 12, bold, q.status === 'draft' ? MUTED : PURPLE); y -= 24;
  text('Perihal', M, y, 9, reg, MUTED); y -= 15;
  for (const l of wrap(bold, 13, q.title, W - 2 * M)) { text(l, M, y, 13, bold); y -= 17; }
  y -= 10;

  // table
  const cx = { no: M, desc: M + 26, qty: W - M - 215, price: W - M - 105, sub: W - M - 6 }; // qty/price/sub = right edges
  const head = () => {
    page.drawRectangle({ x: M, y: y - 8, width: W - 2 * M, height: 24, color: rgb(0.95, 0.94, 0.98) });
    text('No', cx.no + 6, y, 9, bold, MUTED); text('Deskripsi', cx.desc, y, 9, bold, MUTED);
    right('Qty', cx.qty, y, 9, bold, MUTED); right('Harga', cx.price, y, 9, bold, MUTED); right('Subtotal', cx.sub, y, 9, bold, MUTED);
    y -= 26;
  };
  head();
  q.items.forEach((it, i) => {
    const lines = wrap(reg, 10, it.desc, cx.qty - cx.desc - 40);
    const need = lines.length * 13 + 10;
    if (y - need < 120) { footer(); page = doc.addPage([W, H]); mark(); y = H - M; head(); }
    text(String(i + 1), cx.no + 6, y, 10, reg, MUTED);
    lines.forEach((l, k) => text(l, cx.desc, y - k * 13, 10));
    right(String(it.qty), cx.qty, y, 10); right(rp(it.price), cx.price, y, 10); right(rp(it.qty * it.price), cx.sub, y, 10, bold);
    y -= need;
    page.drawLine({ start: { x: M, y: y + 8 }, end: { x: W - M, y: y + 8 }, thickness: 0.5, color: LINE });
  });
  if (y < 170) { footer(); page = doc.addPage([W, H]); mark(); y = H - M; }
  y -= 8;
  page.drawRectangle({ x: W / 2, y: y - 12, width: W / 2 - M, height: 32, color: INK });
  text('TOTAL', W / 2 + 14, y, 11, bold, rgb(1, 1, 1)); right(rp(q.total), W - M - 14, y, 13, bold, LIME);
  y -= 46;

  const block = (title: string, body: string) => {
    if (!body.trim()) return;
    const lines = wrap(reg, 9.5, body, W - 2 * M);
    if (y - lines.length * 13 - 20 < 70) { footer(); page = doc.addPage([W, H]); mark(); y = H - M; }
    text(title, M, y, 9, bold, MUTED); y -= 14;
    for (const l of lines) { text(l, M, y, 9.5); y -= 13; }
    y -= 10;
  };
  block('Catatan', q.notes ?? '');
  block('Ketentuan', [
    'Biaya pihak ketiga (domain, hosting, iklan berbayar, lisensi) dicantumkan sebagai item terpisah bila ada.',
    q.status === 'draft' ? 'Dokumen ini masih draf dan belum menjadi penawaran resmi.' : 'Pekerjaan dimulai setelah penawaran disetujui dan bahan dari klien lengkap.',
    `Pertanyaan: WhatsApp ${whatsapp.display}.`,
  ].join('\n'));
  if (q.demo) block('Catatan demo', 'Dokumen ini dibuat dari DATA DEMO untuk pratinjau dan bukan penawaran sungguhan.');
  footer();
  return doc.save();
}
