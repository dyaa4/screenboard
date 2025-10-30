import React from 'react';
import { Checkbox } from '@heroui/react';
import Circle from '@uiw/react-color-circle';
import { ColorResult } from '@uiw/color-convert';
import { useTranslation } from 'react-i18next';

interface ColorSliderProps {
  value?: string;
  onColorChange?: (color: string) => void;
}

const fromRgbToHex = (rgbColor?: string): string => {
  if (!rgbColor) return '';

  const rgb = rgbColor.match(/\d+/g);
  if (!rgb || rgb.length < 3) return '';

  const toHex = (value: string) =>
    parseInt(value, 10).toString(16).padStart(2, '0').toUpperCase();

  return `#${toHex(rgb[0])}${toHex(rgb[1])}${toHex(rgb[2])}`;
};

const toRgbaWithOpacity = (
  rgbColor: ColorResult,
  opacity: number = 0.7,
): string => {
  const { r, g, b } = rgbColor.rgb;
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const ColorPicker: React.FC<ColorSliderProps> = ({ onColorChange, value }) => {
  const { t } = useTranslation();

  const [color, setColor] = React.useState<string>(fromRgbToHex(value));
  const [colorType, setColorType] = React.useState<'standard' | 'custom'>(
    value ? 'custom' : 'standard',
  );

  const handleColorChange = (selectedColor: ColorResult) => {
    const hexColor = selectedColor.hex;
    setColor(hexColor);
    onColorChange?.(toRgbaWithOpacity(selectedColor));
    setColorType('custom');
  };

  const handleReset = () => {
    setColor('');
    onColorChange?.('');
    setColorType('standard');
  };

  return (
    <div className="flex flex-col gap-4">
      <Circle
        aria-label="Color Picker"
        color={color}
        onChange={handleColorChange}
        colors={[
          '#F4A261',
          '#E9C46A',
          '#A8DADC',
          '#2A9D8F',
          '#457B9D',
          '#264653',
          '#E76F51',
          '#BC5090',
          '#6A0572',
          '#FFC300',
          '#8D99AE',
          '#EF476F',
        ]}
        rectProps={{
          style: {
            backgroundColor:
              'hsl(var(--heroui-primary) / var(--heroui-primary-800-opacity, var(--tw-bg-opacity)))', // Helles Grün als Hintergrund
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 6L9 17L4 12'/%3E%3C/svg%3E")`,
            backgroundSize: '80% 80%', // Größe des Icons
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          },
        }}
        style={{ width: '50%', height: '100%' }}
      />
      <Checkbox
        radius="full"
        isSelected={colorType === 'standard'}
        onChange={handleReset}
      >
        {t('sites.config.components.colorPicker.standard')}
      </Checkbox>
    </div>
  );
};

export default ColorPicker;
