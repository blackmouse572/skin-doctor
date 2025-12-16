import * as React from 'react';

import { cn } from '#/lib/utils';

function FocusCard({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="focus-card"
      className={cn(
        'after:-inset-[5px] after:z-1 relative flex min-w-0 flex-1 flex-col bg-muted/50 bg-clip-padding shadow-black/5 shadow-sm after:pointer-events-none after:absolute after:rounded-[calc(var(--radius-2xl)+4px)] after:border after:border-border/50 after:bg-clip-padding lg:mt-8 lg:mr-4 lg:mb-8 rounded-2xl border dark:after:bg-background/72',
        className,
      )}
      {...props}
    >
      <div className="-m-px border bg-background px-4 py-6 before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-2xl)-1px)] before:shadow-[0_1px_--theme(--color-black/4%)] max-lg:before:hidden sm:px-6 lg:rounded-t-2xl lg:rounded-b-xl lg:p-8 dark:before:shadow-[0_-1px_--theme(--color-white/8%)]">
        {props.children}
      </div>
    </div>
  );
}

function FocusCardContent({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="focus-card-content"
      className={cn('mx-auto w-full max-w-3xl', className)}
      {...props}
    />
  );
}

function FocusCardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="focus-card-footer"
      className={cn('px-4 py-6 lg:rounded-b-2xl lg:px-8', className)}
      {...props}
    />
  );
}

export { FocusCard, FocusCardContent, FocusCardFooter };
