import { ChartContainer } from '@repo/ui/components/chart';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/ui/components/dropdown-menu';
import {
  Meter,
  MeterLabel,
  MeterValue,
  MeterTrack,
  MeterIndicator,
} from '@repo/ui/components/meter';
import { cn } from '@repo/ui/lib/utils';
import * as React from 'react';
import { RadialBarChart, PolarAngleAxis, RadialBar } from 'recharts';

interface TokenUsageDropdownProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenu> {
  className?: string;
  userId?: string;
}

const TokenUsageDropdown: React.FC<TokenUsageDropdownProps> = ({
  className,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'h-10 w-10 flex items-center justify-center relative',
          className,
        )}
      >
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
          className="flex-col opacity-100! items-start gap-0"
        >
          <Meter value={20}>
            <div className="flex items-center justify-between gap-2">
              <MeterLabel>Usage</MeterLabel>
              <MeterValue />
            </div>
            <MeterTrack className="rounded-full">
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
  );
};

export { TokenUsageDropdown };
