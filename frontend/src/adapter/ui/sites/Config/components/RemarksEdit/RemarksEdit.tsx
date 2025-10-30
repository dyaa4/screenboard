import { RemarkWidgetSettings } from '@domain/types';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Slider,
  Tooltip,
} from '@heroui/react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaClock, FaList, FaTrash } from 'react-icons/fa';

interface RemarksEditProps {
  settings: RemarkWidgetSettings;
  onSettingsChange: (settings: RemarkWidgetSettings, valid: boolean) => void;
}

const RemarksEdit: React.FC<RemarksEditProps> = ({
  settings: { remarks: initialItems, intervalMinutes: initialInterval },
  onSettingsChange,
}) => {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [items, setItems] = useState<string[]>(initialItems);
  const [interval, setInterval] = useState<number>(initialInterval);

  const updateSettings = (
    updatedItems: string[],
    updatedInterval: number,
  ): void => {
    const isValid = updatedItems.length > 0 && updatedInterval > 0;
    onSettingsChange(
      {
        remarks: updatedItems,
        intervalMinutes: updatedInterval,
      },
      isValid,
    );
  };

  useEffect(() => {
    updateSettings(items, interval);
  }, [items, interval]);

  const addItem = (): void => {
    if (text.trim()) {
      const updatedItems = [...items, text.trim()];
      setItems(updatedItems);
      setText('');
    }
  };

  const deleteItem = (index: number): void => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
  };

  const handleIntervalChange = (value: number): void => {
    setInterval(value);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex gap-3">
          <FaClock />
          <div className="flex flex-col">
            <p className="text-md">
              {t('sites.config.components.remarksEdit.remarksIntervall')}
            </p>
            <p className="text-small text-default-500">
              {t(
                'sites.config.components.remarksEdit.remarksIntervallDescription',
              )}
            </p>
          </div>
        </CardHeader>
        <CardBody>
          <Slider
            size="md"
            step={1}
            color="foreground"
            label="Erneuerungsintervall"
            getValue={(value) => `${value} Minuten`}
            showSteps={false}
            maxValue={60}
            minValue={1}
            showOutline
            value={interval}
            onChange={(value) => handleIntervalChange(value as number)}
            className="max-w-md"
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="flex gap-3">
          <FaList />
          <div className="flex flex-col">
            <p className="text-md">
              {t('sites.config.components.remarksEdit.remarks')}
            </p>
            <p className="text-small text-default-500">
              {t('sites.config.components.remarksEdit.remarksDescription')}
            </p>
          </div>
        </CardHeader>
        <CardBody>
          <div className="flex gap-3 mb-4">
            <Input
              fullWidth
              placeholder="Neue Bemerkung hinzufügen"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <Button onPress={addItem}>{t('actions.add')}</Button>
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            <ol className="flex flex-col gap-2">
              {items.map((item, index) => (
                <li key={index} className="flex justify-between items-center">
                  <Tooltip placement="top-end" content={item} showArrow>
                    <span className="text-foreground truncate max-w-full">
                      {index + 1}- {item}
                    </span>
                  </Tooltip>
                  <Tooltip content="Löschen" placement="right">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="ghost"
                      onPress={() => deleteItem(index)}
                    >
                      <FaTrash />
                    </Button>
                  </Tooltip>
                </li>
              ))}
            </ol>
          </div>
          {items.length === 0 && (
            <p className="text-danger mt-2">
              {t('sites.config.components.remarksEdit.remarksEmpty')}
            </p>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default RemarksEdit;
