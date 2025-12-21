import { ArrowRight, Sparkle } from '@phosphor-icons/react';
import { Button } from '@repo/ui/components/button';
import { cn } from '@repo/ui/lib/utils';
import type { ReactNode } from 'react';

interface ActionCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  actionLabel: string;
  onAction?: () => void;
  variant?: 'primary' | 'secondary';
  badge?: string;
  className?: string;
  iconContainerClassName?: string;
  buttonClassName?: string;
  footerSlot?: ReactNode;
}

export function ActionCard({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  variant = 'secondary',
  badge,
  className,
  iconContainerClassName,
  buttonClassName,
  footerSlot,
}: ActionCardProps) {
  if (variant === 'primary') {
    return (
      <div
        className={cn(
          'relative overflow-hidden rounded-xl bg-slate-900 text-white p-6 sm:p-8 shadow-lg group',
          className,
        )}
      >
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
          {icon}
        </div>

        <div className="relative z-10 flex flex-col gap-4 h-full">
          {badge && (
            <div className="inline-flex items-center gap-2 self-start rounded-md bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400 ring-1 ring-inset ring-emerald-500/30">
              <Sparkle weight="fill" className="w-3 h-3" />
              {badge}
            </div>
          )}

          <div className="flex-1">
            <h4 className="text-2xl font-bold mb-2">{title}</h4>
            <p className="text-slate-300 max-w-xl">{description}</p>
          </div>

          {footerSlot || (
            <Button
              size="lg"
              className="w-full sm:w-auto self-end mt-2 bg-emerald-500 hover:bg-emerald-600 text-white border-none"
              onClick={onAction}
            >
              {actionLabel}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-xl flex flex-col border bg-card p-6 transition-colors group',
        className,
      )}
    >
      <div
        className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-transform',
          iconContainerClassName,
        )}
      >
        {icon}
      </div>
      <div className="flex-1">
        <h4 className="font-semibold mb-1">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {footerSlot || (
        <Button
          variant="secondary"
          className={cn('shadow mt-4', buttonClassName)}
          onClick={onAction}
        >
          {actionLabel} <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
