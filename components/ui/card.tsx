import { cn } from '@/lib/cn';

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200/70 bg-white/80 backdrop-blur-sm shadow-sm dark:bg-slate-900/80 dark:border-slate-800',
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  step,
  icon,
}: {
  title: string;
  description?: React.ReactNode;
  step?: number;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-slate-100 px-6 py-4">
      {step !== undefined && (
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-emerald-500 text-xs font-bold text-white">
          {step}
        </span>
      )}
      {icon && (
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          {icon}
        </span>
      )}
      <div className="flex-1">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {description && (
          <p className="mt-0.5 text-sm text-slate-500">{description}</p>
        )}
      </div>
    </div>
  );
}

export function CardBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn('px-6 py-5', className)}>{children}</div>;
}