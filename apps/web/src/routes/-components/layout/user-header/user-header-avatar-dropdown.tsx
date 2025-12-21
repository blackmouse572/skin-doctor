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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/ui/components/dropdown-menu';
import * as React from 'react';
import { authClient, AuthUser } from '../../../../clients/authClient';
import { Link } from '@tanstack/react-router';

interface UserHeaderAvatarDropdownProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenu> {
  user: AuthUser;
  className?: string;
}

const UserHeaderAvatarDropdown: React.FC<UserHeaderAvatarDropdownProps> = ({
  className,
  user,
  ...props
}) => {
  const handleLogout = async () => {
    await authClient.signOut();
  };

  return (
    <DropdownMenu {...props}>
      <DropdownMenuTrigger className={className}>
        <Avatar className="h-8 w-8 rounded-lg">
          <AvatarImage src={user.image || ''} alt={user.name} />
          <AvatarFallback className="rounded-lg">
            {user.name.charAt(1)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent sideOffset={10}>
        <DropdownMenuItem
          disabled
          className="flex-col items-start justify-start gap-0 opacity-100!"
        >
          <p>Signed in as</p>
          <p className="font-medium">{user.email}</p>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          render={
            <Link to="/chat">
              <UserIcon weight="fill" />
              Profile
            </Link>
          }
        />
        <DropdownMenuItem
          render={
            <Link to="/tokens">
              <CoinIcon weight="fill" />
              Tokens
            </Link>
          }
        />
        <DropdownMenuItem
          render={
            <Link to="/history">
              <ClockCountdownIcon weight="fill" />
              History
            </Link>
          }
        />
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={handleLogout}>
          <SignOutIcon weight="fill" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserHeaderAvatarDropdown;
