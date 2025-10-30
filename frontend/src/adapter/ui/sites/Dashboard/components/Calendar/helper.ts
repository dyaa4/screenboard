import moment from 'moment';

// Funktion zur Generierung eines benutzerdefinierten Hash-Werts aus einem Satz
export const generateHash = (sentence: string): string => {
  let hash = 0;
  if (sentence.length === 0) return hash.toString();

  for (let i = 0; i < sentence.length; i++) {
    const char = sentence.charCodeAt(i);
    hash = (hash << 5) - hash + char;
  }

  return hash.toString(16); // In Hexadezimal umwandeln
};

// Vordefinierte Farbpalette für schöne Kombinationen
const colorPalette = [
  { light: '#F8BBD0', dark: '#880E4F' }, // Rose
  { light: '#C8E6C9', dark: '#1B5E20' }, // Sage
  { light: '#BBDEFB', dark: '#0D47A1' }, // Sky
  { light: '#FFF9C4', dark: '#F57F17' }, // Lemon
  { light: '#E1BEE7', dark: '#4A148C' }, // Violet
  { light: '#FFE0B2', dark: '#E65100' }, // Peach
  { light: '#B2EBF2', dark: '#006064' }, // Aqua
  { light: '#FFCDD2', dark: '#B71C1C' }, // Coral
  { light: '#CFD8DC', dark: '#263238' }, // Steel
  { light: '#C8E6E3', dark: '#004D40' }, // Jade
];
// Funktion zur Generierung einer eindeutigen Farbe aus einem Satz
export const getColorTermine = (email: string, isDarkMode: boolean): string => {
  // Berechne einen Wert aus der E-Mail-Adresse
  const hash = email
    .split('')
    .reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0);

  // Wähle eine Farbe aus der Palette basierend auf dem Hash
  const colorIndex = Math.abs(hash) % colorPalette.length;
  const selectedColor = colorPalette[colorIndex];

  // Wähle die entsprechende Farbe basierend auf dem Modus
  const color = isDarkMode ? selectedColor.dark : selectedColor.light;

  // Konvertiere die Hex-Farbe zu RGB und füge Transparenz hinzu
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);

  return `rgba(${r}, ${g}, ${b}, 0.5)`;
};

export const formatDate = (date: string, format: string) => {
  return moment(date).locale('de').format(format);
};
