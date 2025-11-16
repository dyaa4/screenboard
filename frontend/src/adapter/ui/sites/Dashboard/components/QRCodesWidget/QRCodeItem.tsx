import { QRCodeData } from '../../../../../../domain/types/widget/QRCodeWidgetSettings';
import { QRCodeSVG } from 'qrcode.react';
import { memo } from 'react';
import { Tooltip, Card, CardHeader, CardBody, CardFooter, Divider, Chip } from '@heroui/react';
import { getGlassBackground } from '@sites/Dashboard/helper';

interface QRCodeItemProps {
  qrcode: QRCodeData;
  generateQRValue: (item: QRCodeData) => string | null;
  fontSize: string | undefined;
  theme: string;
  getCustomColorCssClass: any;
  layout: any;
}

const QRCodeItem = memo(
  ({
    qrcode,
    generateQRValue,
    fontSize,
    theme,
    getCustomColorCssClass,
    layout,
  }: QRCodeItemProps) => {
    const qrValue = generateQRValue(qrcode) || '';

    // Bestimme den Typ-Indikator und Icon
    const getTypeInfo = () => {
      switch (qrcode.type) {
        case 'text':
          return { label: 'Text', icon: 'fa-solid fa-font' };
        case 'url':
          return { label: 'URL', icon: 'fa-solid fa-link' };
        case 'wifi':
          return { label: 'WLAN', icon: 'fa-solid fa-wifi' };
        default:
          return { label: 'QR-Code', icon: 'fa-solid fa-qrcode' };
      }
    };

    // Funktion zum Kürzen von Text mit Ellipsis
    const truncateText = (text: string, maxLength: number) => {
      if (!text) return '';
      return text.length > maxLength
        ? text.substring(0, maxLength) + '...'
        : text;
    };

    const typeInfo = getTypeInfo();

    // Maximale Länge für den Namen
    const maxNameLength = 15;
    // Maximale Länge für Details
    const maxDetailLength = 30;

    const customColors = getCustomColorCssClass(layout, theme);
    const hasCustomColor = layout?.customColor && customColors;

    return (
      <Card
        className="qr-code-item shadow-xl backdrop-blur-xl border border-white/10"
        style={{
          background: hasCustomColor
            ? `linear-gradient(135deg, ${customColors!.backgroundColor || getGlassBackground(theme)} 0%, ${customColors!.backgroundColor || getGlassBackground(theme)} 100%)`
            : getGlassBackground(theme),
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          boxShadow: hasCustomColor
            ? `0 4px 16px 0 rgba(0, 0, 0, 0.1), 0 0 30px -8px ${customColors!.backgroundColor || 'transparent'}`
            : '0 4px 16px 0 rgba(0, 0, 0, 0.1)',
        }}
      >
        <CardHeader className="flex items-center justify-between">
          <Chip
            startContent={<i className={typeInfo.icon}></i>}
            variant="flat"
            color="primary"
            size="sm"
          >
            {typeInfo.label}
          </Chip>
          {qrcode.name && qrcode.name.length > maxNameLength ? (
            <Tooltip content={qrcode.name}>
              <h2 className={`${fontSize} font-bold text-right`}>
                {truncateText(qrcode.name, maxNameLength)}
              </h2>
            </Tooltip>
          ) : (
            <h2 className={`${fontSize} font-bold text-right`}>
              {qrcode.name}
            </h2>
          )}
        </CardHeader>
        <Divider />
        <CardBody className="flex justify-center items-center">
          <QRCodeSVG
            value={qrValue}
            size={200}
            bgColor={theme === 'dark' ? 'transparent' : 'transparent'}
            fgColor={theme === 'dark' ? '#ffffff' : '#000000'}
            level="M"
          />
        </CardBody>
        <Divider />
        <CardFooter className="text-xs text-default-500">
          {qrcode.type === 'text' && qrcode.data.text ? (
            qrcode.data.text.length > maxDetailLength ? (
              <Tooltip content={qrcode.data.text}>
                <div className="truncate">
                  {truncateText(qrcode.data.text, maxDetailLength)}
                </div>
              </Tooltip>
            ) : (
              <div className="truncate">{qrcode.data.text}</div>
            )
          ) : qrcode.type === 'url' && qrcode.data.url ? (
            qrcode.data.url.length > maxDetailLength ? (
              <Tooltip content={qrcode.data.url}>
                <div className="truncate">
                  {truncateText(qrcode.data.url, maxDetailLength)}
                </div>
              </Tooltip>
            ) : (
              <div className="truncate">{qrcode.data.url}</div>
            )
          ) : qrcode.type === 'wifi' && qrcode.data.wifi ? (
            <div className="flex items-center">
              <span className="font-medium mr-1">SSID:</span>{' '}
              {qrcode.data.wifi.ssid.length > maxDetailLength - 5 ? (
                <Tooltip content={qrcode.data.wifi.ssid}>
                  <span>
                    {truncateText(qrcode.data.wifi.ssid, maxDetailLength - 5)}
                  </span>
                </Tooltip>
              ) : (
                <span>{qrcode.data.wifi.ssid}</span>
              )}
            </div>
          ) : null}
        </CardFooter>
      </Card>
    );
  },
);

QRCodeItem.displayName = 'QRCodeItem';

export default QRCodeItem;
