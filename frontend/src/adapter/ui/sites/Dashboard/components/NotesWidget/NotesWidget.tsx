import { getCustomColorCssClass } from '@adapter/ui/helpers/generalHelper';
import { t } from '@adapter/ui/i18n/i18n';
import { Layout } from '../../../../../../domain/entities/Layout';
import { Widget } from '../../../../../../domain/entities/Widget';
import { NoteWidgetSettings } from '../../../../../../domain/types/widget/NoteWidgetSettings';
import { useTheme } from 'next-themes';
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

  return (
    <MenuSection
      icon="fa-solid fa-note-sticky"
      layout={layout}
      scrollable
      title={t(widget.title)}
    >
      <Card
        className="w-full transition-shadow duration-300 shadow-lg hover:shadow-xl"
        style={{
          ...getCustomColorCssClass(layout, theme),
        }}
      >
        <CardBody className="overflow-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          <div
            className="text-default-600 prose dark:prose-invert max-w-none"
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
