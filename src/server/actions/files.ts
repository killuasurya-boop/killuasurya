'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { backendConfigured, createSupabase } from '../supabase';

type R = { ok: true } | { ok: false; error: string };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_FILE = 20 * 1024 * 1024;
const EXT: Record<string, string> = {
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', svg: 'image/svg+xml', gif: 'image/gif', pdf: 'application/pdf',
  ai: 'application/postscript', eps: 'application/postscript', zip: 'application/zip', mp4: 'video/mp4', mov: 'video/quicktime', txt: 'text/plain',
  doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint', pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
};
const fail = (error: string): R => ({ ok: false, error });

/** Upload one file to a project (optionally for one material). Who may upload is decided by Storage + table RLS. */
export async function uploadProjectFile(form: FormData): Promise<R> {
  if (!backendConfigured) return fail('Backend belum terhubung.');
  const projectId = String(form.get('projectId') ?? '');
  const materialId = String(form.get('materialId') ?? '');
  const file = form.get('file');
  if (!UUID.test(projectId) || (materialId && !UUID.test(materialId))) return fail('Permintaan tidak valid.');
  if (!(file instanceof File) || file.size === 0) return fail('Pilih file terlebih dulu.');
  if (file.size > MAX_FILE) return fail('Ukuran file maksimal 20 MB. Untuk file besar, kirim link Google Drive.');
  const name = file.name.normalize('NFC').replace(/[\\/:*?"<>|\u0000-\u001f]+/g, '-').trim().slice(-120) || 'file';
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  const mime = EXT[ext];
  if (!mime) return fail('Jenis file belum didukung. Gunakan gambar, PDF, AI/EPS, ZIP, MP4/MOV, atau dokumen Office.');
  const db = await createSupabase();
  const path = `${projectId}/${randomUUID()}-${name.replace(/[^A-Za-z0-9._-]+/g, '_')}`;
  const up = await db.storage.from('project-files').upload(path, file, { contentType: mime, upsert: false });
  if (up.error) return fail('Upload ditolak. Pastikan Anda punya akses ke proyek ini.');
  const { error } = await db.from('project_files').insert({ project_id: projectId, material_id: materialId || null, path, name, size: file.size, mime });
  if (error) { await db.storage.from('project-files').remove([path]); return fail('File tidak tercatat. Coba lagi.'); }
  ['/portal', '/os/projects', '/os'].forEach((p) => revalidatePath(p));
  return { ok: true };
}
