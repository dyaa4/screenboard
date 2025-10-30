import { Layout } from '@domain/entities/Layout';
import { IoTDevice } from '@domain/types';

/**
 *  Returns the direction of the html element
 * @returns 'rtl' if the direction is right-to-left, 'ltr' if the direction is left-to-right
 */
export function isHtmlDirectionRTL(): boolean {
  const htmlElement = document.getElementById(
    'html-root',
  ) as HTMLHtmlElement | null;

  if (htmlElement) {
    return htmlElement.dir === 'rtl';
  }

  // Fallback, falls das Element nicht gefunden wurde
  return false;
}

/**
 *  Returns the Custom Background Color of the Dashboard
 *
 * @param layout Layout
 * @returns Custom Background Color as String and with Opacity
 */
export function getCustomColorCssClass(
  layout: Layout | undefined,
  theme: string | undefined,
): React.CSSProperties | undefined {
  if (!layout?.customColor || !theme) {
    return undefined;
  }

  return {
    backgroundColor: layout.customColor,
    background: `linear-gradient(to bottom, ${adjustRgbaColor(layout.customColor, theme === 'dark' ? -40 : 40)}, ${layout.customColor})`,
  };
}

function adjustRgbaColor(rgbaString: string, percent: number): string {
  // Regex, um die RGBA-Werte aus dem String zu extrahieren
  const rgbaRegex = /rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\s*\)/;
  const match = rgbaString.match(rgbaRegex);

  if (!match) {
    throw new Error('Ungültiger RGBA-String');
  }

  // Exktrahiere RGB-Werte und den Alpha-Wert
  let r = parseInt(match[1]);
  let g = parseInt(match[2]);
  let b = parseInt(match[3]);
  const alpha = match[4] ? parseFloat(match[4]) : 1; // Falls Alpha nicht angegeben, Standard ist 1

  // Funktion zur Anpassung der RGB-Werte
  const adjust = (colorVal: number, percent: number): number => {
    const amount = Math.round(colorVal * (percent / 100));
    const newValue = colorVal + amount;
    return Math.min(255, Math.max(0, newValue)); // Begrenzung auf 0-255
  };

  // Berechne die neuen RGB-Werte
  const newR = adjust(r, percent);
  const newG = adjust(g, percent);
  const newB = adjust(b, percent);

  // Rückgabe der neuen RGBA-Farbe
  return `rgba(${newR}, ${newG}, ${newB}, ${alpha})`;
}

// Bestimme das passende Icon für einen Gerätetyp
export const getDeviceIcon = (device: IoTDevice) => {
  // Prüfen auf spezifische Gerätetypen anhand von Gerätenamen/Labels oder Capabilities
  const deviceName = (device.label || device.name || '').toLowerCase();

  if (
    deviceName.includes('light') ||
    deviceName.includes('lampe') ||
    deviceName.includes('licht')
  ) {
    return 'fa-solid fa-lightbulb';
  } else if (deviceName.includes('door') || deviceName.includes('tür')) {
    return 'fa-solid fa-door-open';
  } else if (deviceName.includes('window') || deviceName.includes('fenster')) {
    return 'fa-solid fa-window-maximize';
  } else if (
    deviceName.includes('thermo') ||
    deviceName.includes('heat') ||
    deviceName.includes('heizung')
  ) {
    return 'fa-solid fa-temperature-half';
  } else if (
    deviceName.includes('tv') ||
    deviceName.includes('television') ||
    deviceName.includes('fernseher')
  ) {
    return 'fa-solid fa-tv';
  } else if (
    deviceName.includes('outlet') ||
    deviceName.includes('plug') ||
    deviceName.includes('steckdose')
  ) {
    return 'fa-solid fa-plug';
  } else if (
    deviceName.includes('speaker') ||
    deviceName.includes('sound') ||
    deviceName.includes('lautsprecher')
  ) {
    return 'fa-solid fa-volume-high';
  } else if (deviceName.includes('fan') || deviceName.includes('ventilator')) {
    return 'fa-solid fa-fan';
  } else if (deviceName.includes('camera') || deviceName.includes('kamera')) {
    return 'fa-solid fa-camera';
  } else if (deviceName.includes('lock') || deviceName.includes('schloss')) {
    return 'fa-solid fa-lock';
  }

  // Standard-Icon für andere Geräte
  return 'fa-solid fa-microchip';
};
