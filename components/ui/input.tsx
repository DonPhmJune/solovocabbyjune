'use client';
import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm outline-none transition-all dark:bg-slate-900 dark:border-slate-800 dark:text-white',
        'placeholder:text-slate-400',
        'focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:focus:border-blue-500 dark:focus:ring-blue-900/50',
        'disabled:bg-slate-50 disabled:text-slate-500 dark:disabled:bg-slate-800',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';