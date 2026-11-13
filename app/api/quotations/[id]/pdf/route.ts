import { quotations as demoQuotes } from '@/fixtures/os.demo';
import { quotationPdf, type QuotePdf } from '@/server/pdf/quotation';
import { backendConfigured, createSupabase, currentUser } from '@/server/supabase';

export const dynamic = 'force-dynamic';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const fmt = (d: string | Date) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' });
const notFound = () => new Response('Tidak ditemukan', { status: 404 });

/** Quotation PDF. Live: the row is read with the signed-in user's session, so RLS decides (Owner; client only for their own sent/accepted quotes). */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let q: QuotePdf | null = null;
  if (backendConfigured) {
    if (!UUID.test(id)) return notFound();
    if (!(await currentUser())) return new Response('Silakan masuk', { status: 401 });
    const db = await createSupabase();
    const { data } = await db.from('quotations').select('id, title, client_name, items, total, status, notes, created_at, sent_at, client:clients(name)').eq('id', id).maybeSingle();
    if (!data) return notFound();
    const client = (Array.isArray(data.client) ? data.client[0] : data.client) as { name?: string } | null;
    q = { number: `Q-${String(data.id).slice(0, 8).toUpperCase()}`, title: data.title, client: data.client_name || client?.name || '-', status: data.status,
      date: fmt(data.sent_at ?? data.created_at), items: (data.items ?? []) as QuotePdf['items'], total: Number(data.total) || 0, notes: data.notes };
  } else {
    const d = demoQuotes.find((x) => x.id === id);
    if (!d) return notFound();
    q = { number: d.id, title: d.title, client: d.client, status: d.status === 'DRAFT' || d.status === 'INTERNAL_REVIEW' ? 'draft' : d.status === 'ACCEPTED' ? 'accepted' : 'sent',
      date: fmt(new Date('2026-11-12')), items: d.items.map(([desc, qty, price]) => ({ desc, qty, price })), total: d.items.reduce((n, [, qty, price]) => n + qty * price, 0), demo: true };
  }
  const bytes = await quotationPdf(q);
  const name = `Penawaran-${q.number}-${q.client}`.replace(/[^A-Za-z0-9-]+/g, '-').slice(0, 80);
  return new Response(Buffer.from(bytes), { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename="${name}.pdf"`, 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex' } });
}
