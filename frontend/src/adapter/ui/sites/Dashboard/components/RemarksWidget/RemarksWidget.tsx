import { Layout } from '@domain/entities/Layout';
import { Widget } from '@domain/entities/Widget';
import { RemarkWidgetSettings } from '@domain/types';
import { getFontSizeClass, getGlassBackground } from '@sites/Dashboard/helper';
import { useEffect, useState } from 'react';
import { Card, CardBody } from '@heroui/react';
import { getCustomColorCssClass } from '@adapter/ui/helpers/generalHelper';
import { useTheme } from 'next-themes';

interface RemarkWidgetProps {
  widget: Widget;
  layout: Layout | undefined;
}
const RemarkWidget = (props: RemarkWidgetProps): JSX.Element => {
  const { widget, layout } = props;
  const { theme } = useTheme();
  const [sentence, setSentence] = useState<string>('');
  const { remarks, intervalMinutes } = widget.settings as RemarkWidgetSettings;

  useEffect(() => {
    // Initialisieren mit einem zufälligen Satz
    const updateSentence = () => {
      const randomIndex = Math.floor(Math.random() * remarks.length);
      setSentence(remarks[randomIndex]);
    };

    updateSentence();
    const interval = setInterval(updateSentence, intervalMinutes * 60 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const customColors = getCustomColorCssClass(layout, theme);
  const hasCustomColor = layout?.customColor && customColors;

  return (
    <Card
      className="mt-4 shadow-2xl backdrop-blur-xl border border-white/10"
      style={{
        background: hasCustomColor
          ? `linear-gradient(135deg, ${customColors!.backgroundColor || getGlassBackground(theme)} 0%, ${customColors!.backgroundColor || getGlassBackground(theme)} 100%)`
          : getGlassBackground(theme),
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        boxShadow: hasCustomColor
          ? `0 4px 16px 0 rgba(0, 0, 0, 0.1), 0 0 40px -10px ${customColors!.backgroundColor || 'transparent'}`
          : '0 4px 16px 0 rgba(0, 0, 0, 0.1)',
      }}
    >
      <CardBody className="flex flex-row gap-6 items-center px-8 py-10 bg-transparent">
        <i className="fa-solid fa-quote-left text-3xl opacity-50 flex-shrink-0"></i>
        <p className={`${getFontSizeClass(layout?.fontSize)} flex-1 text-center italic font-light leading-relaxed`}>
          {sentence}
        </p>
        <i className="fa-solid fa-quote-right text-3xl opacity-50 flex-shrink-0"></i>
      </CardBody>
    </Card>
  );
};

export default RemarkWidget;
