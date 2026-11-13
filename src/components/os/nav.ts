import {
  BarChart3, Briefcase, CalendarDays, Clapperboard, FileText, FolderKanban, Gauge, Home, Image as ImageIcon,
  LayoutDashboard, ListChecks, MessageCircle, Send, Settings, Users, UserSquare2,
} from 'lucide-react';

/**
 * Navigation follows the real workflow (Prospek → Penawaran → Proyek → Tugas per tahap → Terbit) and the person's role.
 * Screens that still show sample data live in a collapsed "Pratinjau" group so they don't compete with daily work.
 */
const item = {
  today: { href: '/os', label: 'Hari Ini', icon: Home },
  tasks: { href: '/os/tasks', label: 'Tugas', icon: ListChecks },
  myTasks: { href: '/os/tasks', label: 'Tugas Saya', icon: ListChecks },
  projects: { href: '/os/projects', label: 'Proyek', icon: FolderKanban },
  pipeline: { href: '/os/content', label: 'Pipeline Konten', icon: Clapperboard },
  sales: { href: '/os/crm', label: 'Penjualan', icon: Users },
  team: { href: '/os/team', label: 'Tim & Akses', icon: UserSquare2 },
  settings: { href: '/os/settings', label: 'Pengaturan', icon: Settings },
  calendar: { href: '/os/calendar', label: 'Kalender', icon: CalendarDays },
};

export const preview = [
  { href: '/os/overview', label: 'Ringkasan Bisnis', icon: LayoutDashboard },
  { href: '/os/operations', label: 'Dashboard Operasional', icon: Gauge },
  { href: '/os/publishing', label: 'Social Publishing', icon: Send },
  { href: '/os/whatsapp', label: 'WhatsApp Campaign', icon: MessageCircle },
  { href: '/os/reports', label: 'Laporan & Insight', icon: BarChart3 },
  { href: '/os/media', label: 'Asset & Media', icon: ImageIcon },
  { href: '/portal', label: 'Portal Klien (preview)', icon: Briefcase },
];

export type NavSection = { section: string; items: { href: string; label: string; icon: typeof Home }[]; collapsible?: boolean };
export function navFor(role: string): NavSection[] {
  if (role === 'owner') return [
    { section: 'Kerja', items: [item.today, item.tasks, item.pipeline, item.projects, item.calendar] },
    { section: 'Bisnis', items: [item.sales, item.team, item.settings] },
    { section: 'Pratinjau (data contoh)', items: preview, collapsible: true },
  ];
  return [{ section: 'Kerja', items: [item.today, item.myTasks, item.pipeline, item.projects, item.calendar] }];
}
export const mobileNavFor = (role: string) => (role === 'owner' ? [item.today, item.tasks, item.projects, item.sales] : [item.today, item.myTasks, item.pipeline, item.projects]);

/** Every screen (command palette ⌘K searches all of them). */
export const osRoutes = [
  ...[item.today, item.tasks, item.pipeline, item.projects, item.calendar, item.sales, { href: '/os/quotations', label: 'Penawaran', icon: FileText }, item.team, item.settings].map((i) => ({ ...i, section: 'Kerja & Bisnis' })),
  ...preview.map((i) => ({ ...i, section: 'Pratinjau' })),
];
