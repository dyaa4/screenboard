import { FontSize } from '@domain/types/layout';

export const getFontSizeClass = (fontsize: FontSize | undefined) => {
  if (!fontsize) {
    return 'text-md';
  }
  switch (fontsize) {
    case FontSize.EXTRA_SMALL:
      return 'text-xs';
    case FontSize.SMALL:
      return 'text-sm';
    case FontSize.MEDIUM:
      return 'text-md';
    case FontSize.LARGE:
      return 'text-lg';
    case FontSize.EXTRA_LARGE:
      return 'text-xl';
    default:
      return 'text-md';
  }
};

/**
 * Returns the appropriate glass background color based on theme
 * Dark mode: darker semi-transparent background for better contrast
 * Light mode: lighter semi-transparent background
 */
export const getGlassBackground = (theme: string | undefined): string => {
  return theme === 'dark'
    ? 'rgba(0, 0, 0, 0.3)'  // Darker in dark mode
    : 'rgba(255, 255, 255, 0.05)';  // Light in light mode
};
