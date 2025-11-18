import type { ReactNode } from 'react';

export default function NavContainer({
  children,
}: Readonly<{
  children?: ReactNode;
}>) {
  return (
    <div className="flex h-16 w-full items-center justify-center bg-background md:h-18 border-b border-border">
      <div className="flex w-full max-w-container justify-between pr-3 pl-4 md:px-8">
        {children}
      </div>
    </div>
  );
}
