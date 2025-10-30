export interface QRCodeData {
    name: string; // Name des QR-Codes  
    type: 'text' | 'url' | 'wifi'; // Der Typ des QR-Codes
    data: {
      text?: string; // Daten für Text-QR
      url?: string; // Daten für URL-QR
      wifi?: {
        // Daten für WiFi-QR
        ssid: string;
        password: string;
        encryption: 'WPA' | 'WEP' | 'nopass';
      };
    };
    createdAt: Date; // Optional: Erstellungsdatum
    lastModified?: Date; // Optional: Letzte Änderung
  }
  
  export interface QRCodeWidgetSettings {
    qrcodes: QRCodeData[];
  }
  
  