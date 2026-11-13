import { backendConfigured, createSupabase, currentUser } from '@/server/supabase';

export const dynamic = 'force-dynamic';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Download a project file: RLS decides whether the row is visible; then a 60-second signed link is issued. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!backendConfigured || !UUID.test(id)) return new Response('Tidak ditemukan', { status: 404 });
  if (!(await currentUser())) return new Response('Silakan masuk', { status: 401 });
  const db = await createSupabase();
  const { data } = await db.from('project_files').select('path, name').eq('id', id).maybeSingle();
  if (!data) return new Response('Tidak ditemukan', { status: 404 });
  const { data: signed } = await db.storage.from('project-files').createSignedUrl(data.path, 60, { download: data.name });
  if (!signed?.signedUrl) return new Response('Tidak ditemukan', { status: 404 });
  return Response.redirect(signed.signedUrl, 302);
}
