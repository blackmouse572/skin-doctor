import { MoonIcon, SunIcon, DesktopIcon } from '@phosphor-icons/react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { cn } from '@repo/ui/lib/utils';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { name: 'light', icon: SunIcon },
    { name: 'dark', icon: MoonIcon },
    { name: 'system', icon: DesktopIcon },
  ];

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
  };

  return (
    <div
      className="flex gap-2 p-2 border border-border rounded-full bg-background"
      style={
        {
          'corner-shape': 'squircle',
        } as React.CSSProperties
      }
    >
      {themes.map(({ name, icon: Icon }) => (
        <motion.button
          key={name}
          onClick={() => handleThemeChange(name)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            'p-1.5 rounded-full',
            theme === name && 'bg-accent text-accent-foreground',
          )}
        >
          <motion.div transition={{ duration: 0.5 }}>
            <Icon size={16} weight={theme === name ? 'fill' : 'regular'} />
          </motion.div>
        </motion.button>
      ))}
    </div>
  );
}
