'use client';

import type { Form as FormPrimitive } from '@base-ui/react/form';

import { cn } from '#/lib/utils';

function Form({ className, ...props }: FormPrimitive.Props) {
  return (
    <form
      data-slot="form"
      className={cn('flex w-full flex-col gap-4', className)}
      {...props}
    />
  );
}

export { Form };
