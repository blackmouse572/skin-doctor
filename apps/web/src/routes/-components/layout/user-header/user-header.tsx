import {
  ClockCountdownIcon,
  CoinIcon,
  SignOutIcon,
  UserIcon,
} from '@phosphor-icons/react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@repo/ui/components/avatar';
import { Button } from '@repo/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/ui/components/dropdown-menu';

import { cn } from '@repo/ui/lib/utils';
import { authClient, type AuthUser } from '../../../../clients/authClient';
import { TokenUsageDropdown } from './token-usage-dropdown';
import UserHeaderAvatarDropdown from './user-header-avatar-dropdown';
import { Link } from '@tanstack/react-router';

export type UserHeaderProps = {
  className?: string;
};
export function UserHeader({ className }: UserHeaderProps) {
  const { data: session, isPending } = authClient.useSession();
  if (isPending || !session) {
    return (
      <UserHeaderContainer className={className}>
        <Button
          className="rounded-xl border-round -ms-1"
          variant="ghost"
          render={<Link to="/login">Login</Link>}
        />
        <Button
          className="rounded-xl border-round -me-1"
          render={<Link to="/register">Getting Started</Link>}
        />
      </UserHeaderContainer>
    );
  }
  const { user } = session;

  return (
    <UserHeaderContainer className={className}>
      <Button
        className="rounded-xl border-round -ms-1"
        render={<Link to="/">Analyze Skin</Link>}
      />
      <TokenUsageDropdown userId={user.id} />
      <UserHeaderAvatarDropdown user={user} />
    </UserHeaderContainer>
  );
}

function UserHeaderContainer({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      className={cn(
        'fixed z-20 top-2 right-1.5 flex items-center gap-3 bg-background border border-border corner-shape py-1.5 px-3.5 rounded-2xl shadow-md',
        className,
      )}
      {...props}
    />
  );
}
