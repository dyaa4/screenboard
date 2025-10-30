import { WeatherType } from './WeatherType';

export interface WeatherDay {
  id: number; // Eindeutige ID, die typischerweise das Datum ist
  name: string; // Der Name des Tages (z.B. "Monday", "Tuesday")
  temperature: string; // Die Temperatur als String (z.B. "23°C")
  weather: WeatherType; // Der Wettertyp, z.B. "Sunny", "Clouds", etc.
  date: string; // Das Datum als String (z.B. "2022-01-01")
}
