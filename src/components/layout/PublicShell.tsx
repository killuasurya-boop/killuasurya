import { PublicHeader } from './PublicHeader';
import { IconMotion } from '@/components/icons/IconMotion';
import { Spotlight } from '@/components/motion/Spotlight';
import { PublicFooter } from './PublicFooter';
import { FloatingContact } from './FloatingContact';
import { ToastProvider } from '@/components/motion';

/** Shared public chrome (header, main landmark, footer, toasts). Used by `/` and the (public) route group. */
export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="scroll-progress" aria-hidden="true" />
      <IconMotion />
      <Spotlight />
      <PublicHeader />
      <main id="main">{children}</main>
      <PublicFooter />
      <FloatingContact />
    </ToastProvider>
  );
}
