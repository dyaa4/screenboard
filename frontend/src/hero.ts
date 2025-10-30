// hero.ts
import { heroui } from '@heroui/react';

export default heroui({
  prefix: 'heroui',
  addCommonColors: false,

  layout: {},
  themes: {
    light: {
      layout: {},
      colors: {
        background: '#FFFFFF',
        foreground: '#000000',
        primary: {
          DEFAULT: '#964ED8',
          50: '#F3EBFB',
          100: '#E7D7F7',
          200: '#D0AFF0',
          300: '#B987E8',
          400: '#A25FE0',
          500: '#964ED8',
          600: '#7B2FC0',
          700: '#5E2493',
          800: '#421967',
          900: '#250E3A',
        },
        secondary: {
          DEFAULT: '#40BFF8',
          50: '#EAF7FE',
          100: '#D6EFFD',
          200: '#AEDFFA',
          300: '#86CFF8',
          400: '#5EC0F5',
          500: '#40BFF8',
          600: '#0CA7F1',
          700: '#0983BD',
          800: '#075E88',
          900: '#043A54',
        },
      },
    },
    dark: {
      layout: {},
      colors: {
        background: '#000000',
        foreground: '#FFFFFF',
        primary: {
          DEFAULT: '#964ED8',
          50: '#F3EBFB',
          100: '#E7D7F7',
          200: '#D0AFF0',
          300: '#B987E8',
          400: '#A25FE0',
          500: '#964ED8',
          600: '#7B2FC0',
          700: '#5E2493',
          800: '#421967',
          900: '#250E3A',
        },
        secondary: {
          DEFAULT: '#40BFF8',
          50: '#EAF7FE',
          100: '#D6EFFD',
          200: '#AEDFFA',
          300: '#86CFF8',
          400: '#5EC0F5',
          500: '#40BFF8',
          600: '#0CA7F1',
          700: '#0983BD',
          800: '#075E88',
          900: '#043A54',
        },
      },
    },
  },
});
