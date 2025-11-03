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
