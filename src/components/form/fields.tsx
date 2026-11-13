'use client';

import { forwardRef, useId, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Eye, EyeOff } from 'lucide-react';
import { duration } from '@/motion/tokens';
import s from './fields.module.css';

type Base = { label: string; hint?: string; error?: string; icon?: React.ReactNode };

function Message({ id, error, hint }: { id: string; error?: string; hint?: string }) {
  return (
    <AnimatePresence initial={false} mode="wait">
      {error ? (
        <motion.p key="e" id={id} className={s.error} role="alert" initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: [0, -4, 4, -2, 0] }} exit={{ opacity: 0 }} transition={{ duration: duration.modal }}>
          {error}
        </motion.p>
      ) : hint ? (
        <p key="h" id={id} className={s.hint}>{hint}</p>
      ) : null}
    </AnimatePresence>
  );
}

export const TextField = forwardRef<HTMLInputElement, Base & React.InputHTMLAttributes<HTMLInputElement>>(function TextField({ label, hint, error, icon, type = 'text', className, ...rest }, ref) {
  const id = useId();
  const [show, setShow] = useState(false);
  const isPw = type === 'password';
  return (
    <div className={`${s.field} ${className ?? ''}`}>
      <label htmlFor={id} className={s.label}>{label}{rest.required && <span aria-hidden="true" className={s.req}> *</span>}</label>
      <div className={`${s.control} ${error ? s.invalid : ''}`}>
        {icon && <span className={s.icon} aria-hidden="true">{icon}</span>}
        <input ref={ref} id={id} type={isPw && show ? 'text' : type} aria-invalid={!!error || undefined} aria-describedby={error || hint ? `${id}-m` : undefined} className={s.input} {...rest} />
        {isPw && (
          <button type="button" className={s.eye} onClick={() => setShow((v) => !v)} aria-label={show ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'} aria-pressed={show}>
            {show ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
          </button>
        )}
      </div>
      <Message id={`${id}-m`} error={error} hint={hint} />
    </div>
  );
});

export function TextArea({ label, hint, error, ...rest }: Base & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  return (
    <div className={s.field}>
      <label htmlFor={id} className={s.label}>{label}</label>
      <div className={`${s.control} ${error ? s.invalid : ''}`}>
        <textarea id={id} className={`${s.input} ${s.textarea}`} aria-invalid={!!error || undefined} aria-describedby={error || hint ? `${id}-m` : undefined} {...rest} />
      </div>
      <Message id={`${id}-m`} error={error} hint={hint} />
    </div>
  );
}

export function SelectField({ label, hint, error, options, ...rest }: Base & React.SelectHTMLAttributes<HTMLSelectElement> & { options: { value: string; label: string }[] }) {
  const id = useId();
  return (
    <div className={s.field}>
      <label htmlFor={id} className={s.label}>{label}{rest.required && <span aria-hidden="true" className={s.req}> *</span>}</label>
      <div className={`${s.control} ${s.selectWrap} ${error ? s.invalid : ''}`}>
        <select id={id} className={s.input} aria-invalid={!!error || undefined} aria-describedby={error || hint ? `${id}-m` : undefined} {...rest}>
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      <Message id={`${id}-m`} error={error} hint={hint} />
    </div>
  );
}

/** Large selectable card — checkbox or radio semantics, keyboard accessible via the native input. */
export function ChoiceCard({ type = 'checkbox', name, value, checked, onChange, title, description, icon }: {
  type?: 'checkbox' | 'radio'; name: string; value: string; checked: boolean; onChange: (v: string, checked: boolean) => void;
  title: string; description?: string; icon?: React.ReactNode;
}) {
  return (
    <label className={`${s.choice} ${checked ? s.choiceOn : ''}`}>
      <input type={type} name={name} value={value} checked={checked} onChange={(e) => onChange(value, e.target.checked)} className={s.choiceInput} />
      <span className={s.choiceTick} aria-hidden="true">
        <AnimatePresence>{checked && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: duration.hover }}><Check size={14} strokeWidth={3} /></motion.span>}</AnimatePresence>
      </span>
      {icon && <span className={s.choiceIcon} aria-hidden="true">{icon}</span>}
      <span className={s.choiceText}><strong>{title}</strong>{description && <small>{description}</small>}</span>
    </label>
  );
}

export function Checkbox({ label, checked, onChange, error, children }: { label?: string; checked: boolean; onChange: (c: boolean) => void; error?: string; children?: React.ReactNode }) {
  const id = useId();
  return (
    <div className={s.field}>
      <label htmlFor={id} className={s.check}>
        <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} aria-invalid={!!error || undefined} aria-describedby={error ? `${id}-m` : undefined} />
        <span className={s.checkBox} aria-hidden="true">{checked && <Check size={14} strokeWidth={3} />}</span>
        <span>{children ?? label}</span>
      </label>
      <Message id={`${id}-m`} error={error} />
    </div>
  );
}
