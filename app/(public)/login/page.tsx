import type { Metadata } from 'next';
import { LoginPage } from '@/components/public/LoginPage';

export const metadata: Metadata = { title: 'Login — KILLUASURYA.TECH', robots: { index: false } };
export default function Page() { return <LoginPage variant="staff" />; }
