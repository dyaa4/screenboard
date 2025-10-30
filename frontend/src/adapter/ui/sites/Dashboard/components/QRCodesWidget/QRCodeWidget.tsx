import { getFontSizeClass } from '@sites/Dashboard/helper';
import { useTheme } from 'next-themes';
import { useTranslation } from 'react-i18next';
import { Widget } from '@domain/entities/Widget';
import { Layout } from '@domain/entities/Layout';
import { QRCodeWidgetSettings } from '@domain/types';
import NotConfiguredMessage from '@components/NotConfiguredMessage/NotConfiguredMessage';
import { getCustomColorCssClass } from '@adapter/ui/helpers/generalHelper';
import MenuSection from '../MenuSection/MenuSection';
import { JSX, useMemo } from 'react';
import QRCodeItem from './QRCodeItem';
import { useQRCodeGenerator } from './QRCodeGenerator';

interface QRCodesWidgetProps {
  widget: Widget;
  layout: Layout | undefined;
}

const QRCodesWidget = (props: QRCodesWidgetProps): JSX.Element => {
  const { t } = useTranslation();
  const { widget, layout } = props;
  const { qrcodes } = widget.settings as QRCodeWidgetSettings;
  const { theme } = useTheme();
  const { generateQRValue } = useQRCodeGenerator();
  const fontSize = useMemo(
    () => getFontSizeClass(layout?.fontSize),
    [layout?.fontSize],
  );

  return (
    <MenuSection scrollable icon="fa-solid fa-qrcode" title="QR Codes">
      {qrcodes.length === 0 ? (
        <NotConfiguredMessage
          message={t('sites.dashboard.components.qrcodeWidget.notConfigured')}
          icon={'fa-solid fa-qrcode'}
          color={'secondary'}
          dashboardId={widget.dashboardId}
          layout={layout}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {qrcodes.map((qrcode, index) => (
            <QRCodeItem
              key={index}
              qrcode={qrcode}
              generateQRValue={generateQRValue}
              fontSize={fontSize}
              theme={theme!}
              getCustomColorCssClass={getCustomColorCssClass}
              layout={layout}
            />
          ))}
        </div>
      )}
    </MenuSection>
  );
};

export default QRCodesWidget;
