'use client';

import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/motion';
import { waLink } from '@/content/site';

/** WhatsApp click-to-chat CTA with a message prefilled for the given topic (opens wa.me in a new tab). */
export function WhatsAppButton({ topic, children = 'Konsultasi WhatsApp', variant = 'primary', size, className }: { topic?: string; children?: React.ReactNode; variant?: 'primary' | 'secondary'; size?: 'md' | 'sm'; className?: string }) {
  return (
    <Button href={waLink(topic)} target="_blank" rel="noopener noreferrer" variant={variant} size={size} className={className} icon={<MessageCircle size={18} aria-hidden="true" />}>
      {children}
    </Button>
  );
}
