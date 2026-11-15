'use client';

import { useRef, useState } from 'react';
import { requestPasswordReset } from '@/server/actions/auth';
import { Mail } from 'lucide-react';
import { TextField } from '@/components/form/fields';
import { Button, HoverLiftCard } from '@/components/motion';

/** Reset password UI. Message never reveals whether an account exists (PRD §13A.4). */
export function ResetForm() {
  const [email, setEmail] = useState('');
  const [err, setErr] = useState('');
  const [done, setDone] = useState(false);
  const [demo, setDemo] = useState(true);
  const [pending, setPending] = useState(false);
  const sending = useRef(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending.current) return;
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) { setErr('Masukkan email yang valid.'); return; }
    sending.current = true;
    setPending(true);
    setErr('');
    try {
      const result = await requestPasswordReset(email.trim());
      setDemo(result.demo);
      setDone(true);
    } catch { setErr('Terjadi gangguan. Coba lagi.'); }
    finally { sending.current = false; setPending(false); }
  }
  return (
    <HoverLiftCard interactive={false} style={{ padding: 32, display: 'grid', gap: 16, maxWidth: 520, margin: '0 auto' }}>
      {done ? (
        <div role="status" style={{ display: 'grid', gap: 12 }}>
          {demo && <span className="demo-badge">UI DEMO · tidak terkirim</span>}
          <p style={{ margin: 0 }}>Jika email terdaftar, tautan atur ulang kata sandi akan dikirim. Periksa kotak masuk Anda.</p>
          <Button href="/login" variant="secondary">Kembali ke Login</Button>
        </div>
      ) : (
        <form noValidate onSubmit={submit} aria-busy={pending} style={{ display: 'grid', gap: 16 }}>
          <TextField label="Email akun" type="email" icon={<Mail size={18} />} value={email} onChange={(e) => { setEmail(e.target.value); setErr(''); }} error={err} autoComplete="email" />
          <Button type="submit" arrow loading={pending}>Kirim Link Reset</Button>
          <Button href="/login" variant="tertiary">Kembali ke Login</Button>
        </form>
      )}
    </HoverLiftCard>
  );
}
