// components/ThemeSwitcher.tsx
import { Button } from '@heroui/react';
import { FaMoon } from '@react-icons/all-files/fa/FaMoon';
import { FaSun } from '@react-icons/all-files/fa/FaSun';
import { useTheme } from 'next-themes';

export const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <Button
        isIconOnly
        variant="faded"
        size="lg"
        onPress={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      >
        {theme === 'dark' ? <FaSun /> : <FaMoon />}
      </Button>
    </div>
  );
};
