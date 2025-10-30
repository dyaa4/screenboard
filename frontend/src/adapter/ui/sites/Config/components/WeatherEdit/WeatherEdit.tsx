import React, { ChangeEvent, useState, useEffect } from 'react';
import { Input, Select, SelectItem } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { WeatherWidgetSettings } from '../../../../../../domain/types';

interface WeatherEditProps {
  settings: WeatherWidgetSettings;
  onSettingsChange: (
    newSettings: WeatherWidgetSettings,
    isValid: boolean,
  ) => void;
}

const WeatherEdit: React.FC<WeatherEditProps> = ({
  settings,
  onSettingsChange,
}) => {
  const { t } = useTranslation();
  const [city, setCity] = useState<string>(settings.city || '');
  const [units, setUnits] = useState<'celsius' | 'fahrenheit'>(
    settings.units || 'celsius',
  );

  useEffect(() => {
    setCity(settings.city);
    setUnits(settings.units);
  }, [settings]);

  useEffect(() => {
    const newSettings: WeatherWidgetSettings = {
      city,
      units,
    };

    const isValid = city.trim() !== ''; // Validierung: Stadt darf nicht leer sein
    onSettingsChange(newSettings, isValid);
  }, [city, units]);

  const handleCityChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newCity = e.target.value;
    setCity(newCity);
  };

  const handleUnitsChange = (value: string) => {
    setUnits(value as 'celsius' | 'fahrenheit');
  };

  return (
    <div className="flex flex-col gap-2">
      <Input
        type="text"
        id="city"
        label={t('sites.config.components.weatherEdit.city')}
        value={city}
        onChange={handleCityChange}
        className="max-w-md"
        isRequired
        isInvalid={city.trim() === ''}
        errorMessage={
          city.trim() === ''
            ? t('sites.config.components.weatherEdit.cityRequired')
            : ''
        }
      />
      <Select
        id="units"
        label="Units"
        selectedKeys={[units]}
        onChange={(e) => handleUnitsChange(e.target.value)}
        className="max-w-md"
        required
      >
        <SelectItem key="celsius">Celsius</SelectItem>
        <SelectItem key="fahrenheit">Fahrenheit</SelectItem>
      </Select>
    </div>
  );
};

export default WeatherEdit;
