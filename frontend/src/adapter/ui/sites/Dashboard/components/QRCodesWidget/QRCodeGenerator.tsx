import { QRCodeData } from '@domain/types/widget/QRCodeWidgetSettings';

export const useQRCodeGenerator = () => {
  const generateQRValue = (item: QRCodeData): string | null => {
    switch (item.type) {
      case 'text':
        return item.data.text || null;
      case 'url':
        return item.data.url || null;
      case 'wifi':
        return item.data.wifi
          ? `WIFI:T:${item.data.wifi.encryption};S:${item.data.wifi.ssid};P:${item.data.wifi.password};;`
          : null;
      default:
        return null;
    }
  };

  return { generateQRValue };
};
