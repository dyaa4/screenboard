import { getLocale } from '@adapter/ui/helpers/dateHelper';
import { DailyWeatherApiResponse } from '@adapter/ui/types/weather/DailyWeatherApiResponse';
import { WeatherDay } from '@adapter/ui/types/weather/WeatherDay';
import {
  createWeatherApiUrl,
  getCoordinatesForCity,
  getWeatherType,
  UseWeatherDataResult,
} from '@sites/Dashboard/components/WeatherWidget/helper';
import axios from 'axios';
import { format, isSameDay } from 'date-fns';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// Hook für die nächsten 5 Tage Wetter
export const useNext5DaysWeather = (
  city: string,
  currentLang: string,
): UseWeatherDataResult<WeatherDay[]> => {
  const { t } = useTranslation();
  const [data, setData] = useState<WeatherDay[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const coordinates = await getCoordinatesForCity(city);
        if (!coordinates)
          throw new Error('Fehler beim Abrufen der Koordinaten.');

        const { latitude, longitude } = coordinates;
        const API_WEATHER_LINK = createWeatherApiUrl(
          latitude,
          longitude,
          false,
        );
        const response =
          await axios.get<DailyWeatherApiResponse>(API_WEATHER_LINK);

        // Bestimme die korrekte Locale für date-fns
        const locale = getLocale(currentLang);

        // Umwandlung der API-Daten in das gewünschte Format
        const formattedData: WeatherDay[] = response.data.daily.time?.map(
          (time, index) => {
            const date = new Date(time);
            const isToday = isSameDay(date, new Date());
            return {
              id: date.getTime(),
              name: isToday
                ? t('hooks.dashboard.useNext5DaysWeather.today')
                : format(date, 'EEEE', { locale }),
              temperature:
                response.data.daily.temperature_2m_max[index].toFixed(0),
              weather: getWeatherType(response.data.daily.weathercode[index]),
              date: date.toISOString(),
            };
          },
        );

        setData(formattedData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        // Verzögerung der Ladeanimation um 1 Sekunde
        setTimeout(() => {
          setLoading(false);
        }, 1000); // 1000 Millisekunden Verzögerung (1 Sekunde)
      }
    };

    fetchWeather();

    // Automatische Aktualisierung jeden halben Tag
    const interval = setInterval(
      () => {
        fetchWeather();
      },
      1000 * 60 * 60 * 12,
    ); // 12 Stunden

    return () => clearInterval(interval);
  }, [city, currentLang]);

  return { data, loading, error };
};
