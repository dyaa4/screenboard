import * as dateFnsLocales from 'date-fns/locale';

// Hilfsfunktion zur Bestimmung der korrekten Locale
export const getLocale = (currentLang: string) => {
  const shortLocaleKey = currentLang.slice(0, 2).toLowerCase();
  const fullLocaleKey = currentLang.replace(
    '-',
    '',
  ) as keyof typeof dateFnsLocales;

  if (shortLocaleKey in dateFnsLocales) {
    return dateFnsLocales[shortLocaleKey as keyof typeof dateFnsLocales];
  } else if (fullLocaleKey in dateFnsLocales) {
    return dateFnsLocales[fullLocaleKey];
  }

  return dateFnsLocales.enUS; // Fallback auf Englisch
};
