// Typen für die täglichen Wetterdaten von Open-Meteo
export interface DailyWeatherData {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_sum: number[];
  weathercode: number[];
}

export interface DailyWeatherApiResponse {
  daily: DailyWeatherData;
}
