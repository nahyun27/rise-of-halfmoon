import React from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'md' | 'lg';

const VARIANTS: Record<Variant, string> = {
  primary:
    'text-white bg-gradient-to-b from-accent to-accent-strong shadow-[0_8px_24px_-6px_rgba(109,93,252,0.7),inset_0_1px_0_rgba(255,255,255,0.25)] hover:brightness-110',
  secondary:
    'text-ink bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:border-white/20',
  danger:
    'text-opponent bg-opponent/[0.06] border border-opponent/25 hover:bg-opponent/[0.12] hover:border-opponent/40',
  ghost:
    'text-ink-muted hover:text-ink hover:bg-white/[0.05]',
};

const SIZES: Record<Size, string> = {
  md: 'h-11 px-5 text-sm gap-2 rounded-xl',
  lg: 'h-14 px-7 text-base gap-3 rounded-2xl',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: React.ReactNode;
}

export function Button({ variant = 'secondary', size = 'md', icon, className = '', children, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center font-semibold tracking-[0.12em] uppercase select-none cursor-pointer
        transition-[filter,background-color,border-color,color,transform] duration-200 active:scale-[0.97]
        disabled:opacity-40 disabled:pointer-events-none
        ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

export function IconButton({ label, className = '', children, ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center size-10 rounded-full cursor-pointer
        text-ink-muted bg-white/[0.04] border border-white/10 backdrop-blur-md
        hover:text-ink hover:bg-white/[0.08] hover:border-white/20 active:scale-95 transition-all duration-200
        ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
