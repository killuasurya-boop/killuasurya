'use client';

import Image from 'next/image';
import { signIn } from '@/server/actions/auth';
import { DEMO_PASSWORD, demoAccounts } from '@/lib/demo-accounts';
import Link from 'next/link';
import { useState } from 'react';
import { ChevronRight, Layers, Link2, Lock, Mail, MonitorSmartphone, Users, CheckCircle2 } from 'lucide-react';
import { Checkbox, TextField } from '@/components/form/fields';
import { Button, HoverLiftCard, useToast } from '@/components/motion';
import { BrandLogo } from '@/components/layout/BrandLogo';
import s from './login.module.css';

/** Live mode = Supabase env present (public values, inlined at build). Demo accounts are shown only when not live. */
const LIVE = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const access = [
  { icon: MonitorSmartphone, title: 'Workspace Access', body: 'Kelola proyek, tugas, dan kolaborasi tim.' },
  { icon: Users, title: 'Client Portal', body: 'Pantau progres, beri approval, dan akses dokumen.' },
  { icon: Layers, title: 'Agency OS', body: 'Kelola operasional agensi, CRM, produksi, hingga laporan bisnis.' },
];

function GoogleMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

/** Login (staff or client). Credentials go only to the `signIn` server action; in demo mode (no backend env) nothing is sent anywhere. */
export function LoginCard({ variant = 'staff' }: { variant?: 'staff' | 'client' }) {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [remember, setRemember] = useState(false);
  const [err, setErr] = useState<{ email?: string; pw?: string }>({});
  const [loading, setLoading] = useState(false);

  const notConnected = (what: string) => toast({ tone: 'info', title: `${what} belum terhubung`, body: 'Ini pratinjau UI — autentikasi aktif setelah fase backend.' });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n: typeof err = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) n.email = 'Masukkan email yang valid.';
    if (pw.length < 8) n.pw = 'Kata sandi minimal 8 karakter.';
    setErr(n);
    if (Object.keys(n).length) return;
    setLoading(true);
    const next = new URLSearchParams(window.location.search).get('next') ?? undefined;
    signIn({ email, password: pw, next })
      .then((r) => {
        if (!r) return; // redirected
        if (r.reason === 'not_configured') notConnected('Login');
        else if (r.reason === 'demo_invalid') toast({ tone: 'error', title: 'Login gagal', body: 'Mode demo: gunakan salah satu akun demo di bawah formulir.' });
        else if (r.reason === 'inactive') toast({ tone: 'error', title: 'Akun belum aktif', body: 'Hubungi Owner untuk mengaktifkan akses Anda.' });
        else toast({ tone: 'error', title: 'Login gagal', body: 'Email atau kata sandi salah.' });
      })
      .catch((e) => { if (!String(e?.digest ?? '').startsWith('NEXT_REDIRECT')) toast({ tone: 'error', title: 'Login gagal', body: 'Terjadi gangguan. Coba lagi.' }); })
      .finally(() => setLoading(false));
  };

  return (
    <HoverLiftCard interactive={false} className={s.card}>
      <form className={s.form} onSubmit={submit} noValidate>
        <div className={s.formHead}>
          <BrandLogo priority={false} />
          <span className="demo-badge">UI DEMO</span>
        </div>
        <h2 className={`display ${s.title}`}>{variant === 'client' ? 'Portal Klien' : 'Selamat Datang Kembali!'}</h2>
        <p className={s.lead}>
          {variant === 'client'
            ? 'Masuk untuk memantau progres, milestone, dan approval proyek Anda. Akses klien bersifat undangan (invite-only).'
            : 'Masuk ke akun Anda untuk mengakses seluruh ekosistem bisnis di KILLUASURYA.TECH.'}
        </p>
        <button type="button" className={s.google} onClick={() => notConnected('Login Google')}><GoogleMark /> Masuk dengan Google</button>
        <div className={s.divider}><span>atau</span></div>
        <TextField label="Email" type="email" placeholder="Email Anda" icon={<Mail size={18} />} value={email} onChange={(e) => { setEmail(e.target.value); setErr((x) => ({ ...x, email: undefined })); }} error={err.email} autoComplete="email" />
        <TextField label="Kata sandi" type="password" placeholder="Kata Sandi" icon={<Lock size={18} />} value={pw} onChange={(e) => { setPw(e.target.value); setErr((x) => ({ ...x, pw: undefined })); }} error={err.pw} autoComplete="current-password" />
        <div className={s.row}>
          <Checkbox checked={remember} onChange={setRemember} label="Ingat saya" />
          <Link href="/forgot-password" className={s.link}>Lupa kata sandi?</Link>
        </div>
        <Button type="submit" arrow loading={loading}>{loading ? 'Memeriksa…' : 'Masuk'}</Button>
        <button type="button" className={s.magic} onClick={() => notConnected('Magic link')}><Link2 size={18} aria-hidden="true" /> Kirim Magic Link ke Email</button>
        <Link href={variant === 'client' ? '/login' : '/client/login'} className={s.role}>
          <Users size={22} aria-hidden="true" />
          <span><strong>{variant === 'client' ? 'Tim internal?' : 'Akses Sesuai Peran Anda'}</strong><small>{variant === 'client' ? 'Masuk melalui login staf.' : 'Tim Internal, Klien, atau Partner — satu akun, akses yang relevan.'}</small></span>
          <ChevronRight size={18} aria-hidden="true" />
        </Link>
        {!LIVE && (
          <details className={s.demo}>
            <summary>Akun demo (pratinjau, tanpa backend)</summary>
            <p>Kata sandi semua akun: <code>{DEMO_PASSWORD}</code>. Data di dalamnya adalah data contoh.</p>
            <ul>
              {demoAccounts.filter((a) => (variant === 'client') === (a.role === 'client')).map((a) => (
                <li key={a.id}>
                  <button type="button" className={s.demoBtn} onClick={() => { setEmail(a.email); setPw(DEMO_PASSWORD); setErr({}); }}>
                    <strong>{a.label}</strong><small>{a.email}</small>
                  </button>
                </li>
              ))}
            </ul>
          </details>
        )}
      </form>

      <div className={s.side} aria-hidden="true">
        <div className={s.bubble}>
          <span className={`display ${s.bubbleDark}`}>Akses Workspace, Client Portal, &amp; Agency OS dalam 1 Akun!</span>
          <span className={`display ${s.bubbleLight}`}>Satu Akun, Banyak Akses, Banyak Manfaat!</span>
        </div>
        <Image src="/assets/killuasurya/mascot/hero-thumbs-up.png" alt="" width={1600} height={1257} className={s.mDark} sizes="320px" />
        <Image src="/assets/killuasurya/mascot/hero-idea-thinking.png" alt="" width={1600} height={1280} className={s.mLight} sizes="320px" />
        <ul className={s.access}>
          {access.map((a) => (
            <li key={a.title}>
              <a.icon size={24} />
              <span><strong>{a.title}</strong><small>{a.body}</small></span>
              <CheckCircle2 size={18} className={s.tick} />
            </li>
          ))}
        </ul>
      </div>
    </HoverLiftCard>
  );
}
