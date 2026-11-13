'use client';

import { useState } from 'react';
import { Lock } from 'lucide-react';
import { Button, HoverLiftCard } from '@/components/motion';
import { TextField } from '@/components/form/fields';
import { setPassword } from '@/server/actions/auth';

const MSG = { not_configured: 'Backend belum terhubung.', weak: 'Kata sandi minimal 10 karakter.', no_session: 'Tautan sudah kedaluwarsa. Minta tautan baru dari halaman Lupa Kata Sandi.', error: 'Kata sandi belum tersimpan. Coba lagi.' } as const;

export function SetPasswordForm() {
  const [pw, setPw] = useState('');
  const [again, setAgain] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <HoverLiftCard interactive={false} style={{ padding: 32, display: 'grid', gap: 16, maxWidth: 520, margin: '0 auto' }}>
      <form noValidate style={{ display: 'grid', gap: 16 }} onSubmit={(e) => {
        e.preventDefault();
        if (pw.length < 10) { setErr(MSG.weak); return; }
        if (pw !== again) { setErr('Kedua kata sandi belum sama.'); return; }
        setBusy(true);
        setPassword(pw).then((r) => { if (r) setErr(MSG[r.reason]); }).catch((e) => { if (!String(e?.digest ?? '').startsWith('NEXT_REDIRECT')) setErr(MSG.error); }).finally(() => setBusy(false));
      }}>
        <TextField label="Kata sandi baru" type="password" icon={<Lock size={18} />} value={pw} onChange={(e) => { setPw(e.target.value); setErr(''); }} autoComplete="new-password" />
        <TextField label="Ulangi kata sandi" type="password" icon={<Lock size={18} />} value={again} onChange={(e) => { setAgain(e.target.value); setErr(''); }} error={err} autoComplete="new-password" />
        <Button type="submit" arrow loading={busy}>Simpan kata sandi</Button>
      </form>
    </HoverLiftCard>
  );
}
