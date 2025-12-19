import {
  Meter,
  MeterIndicator,
  MeterLabel,
  MeterTrack,
  MeterValue,
} from '@repo/ui/components/meter';
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
import { ChartContainer } from '@repo/ui/components/chart';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/ui/components/dropdown-menu';
import { PolarAngleAxis, RadialBar, RadialBarChart } from 'recharts';

import type { AuthUser } from '../../../clients/authClient';

export type UserHeaderProps = {
  user: AuthUser;
};
export function UserHeader({ user }: UserHeaderProps) {
  return (
    <div className="fixed z-20 top-2 right-1.5 flex items-center gap-3 bg-background border border-border corner-shape py-1.5 px-3.5 rounded-2xl shadow-md">
      <Button className="rounded-xl border-round -ms-1">Analyze Skin</Button>
      <DropdownMenu>
        <DropdownMenuTrigger className="h-10 w-10 flex items-center justify-center relative">
          <ChartContainer
            config={{
              usage: {
                label: 'Usage',
                color: 'var(--primary)',
              },
            }}
            className="aspect-square h-full w-full"
          >
            <RadialBarChart
              data={[{ usage: 65, fill: 'var(--color-usage)' }]}
              startAngle={90}
              endAngle={-270}
              innerRadius={14}
              outerRadius={19}
            >
              <PolarAngleAxis
                type="number"
                domain={[0, 100]}
                angleAxisId={0}
                tick={false}
              />
              <RadialBar background dataKey="usage" cornerRadius={5} />
            </RadialBarChart>
          </ChartContainer>
          <span className="absolute text-[10px] font-bold text-muted-foreground">
            65%
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent sideOffset={10}>
          <DropdownMenuItem
            disabled
            className="flex-col opacity-100 items-start gap-0"
          >
            <Meter value={20}>
              <div className="flex items-center justify-between gap-2">
                <MeterLabel>Usage</MeterLabel>
                <MeterValue />
              </div>
              <MeterTrack>
                <MeterIndicator />
              </MeterTrack>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">
                  20/100 tokens
                </span>
              </div>
            </Meter>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Upgrade Plan</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger>
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
            className="flex-col items-start justify-start gap-0"
          >
            <p>Signed in as</p>
            <p className="font-medium">{user.email}</p>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <UserIcon weight="fill" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CoinIcon weight="fill" />
            Tokens
          </DropdownMenuItem>
          <DropdownMenuItem>
            <ClockCountdownIcon weight="fill" />
            History
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">
            <SignOutIcon weight="fill" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
