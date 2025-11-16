import { getCustomColorCssClass } from '@adapter/ui/helpers/generalHelper';
import { getGlassBackground } from '@sites/Dashboard/helper';
import { useTheme } from 'next-themes';
import { t } from '@adapter/ui/i18n/i18n';
import { Layout } from '../../../../../../domain/entities/Layout';
import { Widget } from '../../../../../../domain/entities/Widget';
import { NoteWidgetSettings } from '../../../../../../domain/types/widget/NoteWidgetSettings';
import MenuSection from '../MenuSection/MenuSection';
import { JSX } from 'react';
import { Card, CardBody } from '@heroui/react';

// Simple HTML sanitization to prevent XSS while preserving safe formatting
const sanitizeHtml = (html: string): string => {
  return html
    // Remove script tags
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove javascript: URLs
    .replace(/javascript:/gi, '')
    // Remove on* event handlers (onclick, onload, etc.)
    .replace(/\s*on\w+\s*=\s*[^>]*>/gi, '>')
    // Remove object, embed, applet tags
    .replace(/<(object|embed|applet)\b[^>]*>.*?<\/\1>/gi, '')
    // Remove iframe with javascript or data URLs
    .replace(/<iframe[^>]*src\s*=\s*["']?(javascript:|data:)[^>]*>.*?<\/iframe>/gi, '')
    // Remove form tags to prevent CSRF
    .replace(/<\/?form[^>]*>/gi, '');
};

export interface NotesProps {
  widget: Widget;
  layout: Layout | undefined;
}

function NotesWidget({ widget, layout }: NotesProps): JSX.Element {
  const { theme } = useTheme();
  const { content } = widget.settings as NoteWidgetSettings;
  const customColors = getCustomColorCssClass(layout, theme);
  const hasCustomColor = layout?.customColor && customColors;

  return (
    <MenuSection
      icon="fa-solid fa-note-sticky"
      layout={layout}
      scrollable
      title={t(widget.title)}
    >
      <Card
        className="w-full shadow-2xl backdrop-blur-xl border border-white/10"
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
        <CardBody className="bg-transparent" style={{ maxHeight: 'none' }}>
          <div
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(content)
            }}
          />
        </CardBody>
      </Card>
    </MenuSection>
  );
}

export default NotesWidget;
