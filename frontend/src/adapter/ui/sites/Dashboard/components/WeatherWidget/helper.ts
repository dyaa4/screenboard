import { DailyWeatherApiResponse } from '@adapter/ui/types/weather/DailyWeatherApiResponse';
import { WeatherType } from '@adapter/ui/types/weather/WeatherType';
import axios from 'axios';

export interface UseWeatherDataResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// Funktion, um das Wetter für die nächsten 5 Tage zu erhalten
export const getNext7DaysWeather = async (
  city: string,
): Promise<DailyWeatherApiResponse> => {
  const coordinates = await getCoordinatesForCity(city);
  if (!coordinates) {
    throw new Error('Fehler beim Abrufen der Koordinaten.');
  }

  const { latitude, longitude } = coordinates;
  const API_WEATHER_LINK = createWeatherApiUrl(latitude, longitude, false);
  try {
    const response = await axios.get<DailyWeatherApiResponse>(API_WEATHER_LINK);

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getIcon = (weather: WeatherType): string => {
  switch (weather) {
    case WeatherType.Clouds:
      return 'fa-solid fa-cloud';
    case WeatherType.Rain:
      return 'fa-solid fa-cloud-rain';
    case WeatherType.Stormy:
      return 'fa-solid fa-cloud-bolt';
    case WeatherType.Sunny:
      return 'fa-solid fa-sun';
    case WeatherType.Snow:
      return 'fa-solid fa-snowflake';
    case WeatherType.Clear:
      return 'fa-solid fa-cloud-sun';
    case WeatherType.Fog:
      return 'fa-solid fa-smog'; // Beispiel für ein Icon für Nebel
    default:
      return '';
  }
};
// Funktion zur Erstellung der API-URL
export const createWeatherApiUrl = (
  latitude: string,
  longitude: string,
  today: boolean,
): string => {
  if (today) {
    return `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
  }
  return `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=auto`;
};

// Geocoding-API verwenden, um Koordinaten zu erhalten
export const getCoordinatesForCity = async (
  city: string,
): Promise<{ latitude: string; longitude: string } | null> => {
  try {
    const response = await axios.get(
      `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`,
    );
    const data = response.data;

    if (data.results && data.results.length > 0) {
      const { latitude, longitude } = data.results[0];
      return { latitude, longitude };
    } else {
      console.error('Keine Ergebnisse für die Stadt gefunden.');
      return null;
    }
  } catch (error) {
    console.error('Fehler beim Abrufen der Geocoding-Daten:', error);
    return null;
  }
};

export const getWeatherType = (weatherCode: number): WeatherType => {
  switch (weatherCode) {
    case 0:
      return WeatherType.Clear;
    case 1:
    case 2:
    case 3:
    case 45:
    case 48:
      return WeatherType.Clouds;
    case 51:
    case 53:
    case 55:
    case 61:
    case 63:
    case 65:
    case 80:
    case 81:
    case 82:
      return WeatherType.Rain;
    case 71:
    case 73:
    case 75:
    case 77:
      return WeatherType.Snow;
    case 95:
    case 96:
    case 99:
      return WeatherType.Stormy;
    default:
      return WeatherType.Unknown;
  }
};
