import ColorPicker from '@components/ColorPicker/ColorPicker';
import { FontSize, Rotation } from '@domain/types/layout';
import { Card, CardBody, CardHeader, Radio, RadioGroup } from '@heroui/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiMonitor } from 'react-icons/fi';

interface DisplaySectionProps {
  fontSize: FontSize;
  rotation: Rotation;
  customColor: string | undefined;
  onFontSizeChange: (value: FontSize) => void;
  onRotationChange: (value: Rotation) => void;
  onCustomColorChange: (color: string) => void;
}

export const DisplaySection: React.FC<DisplaySectionProps> = ({
  fontSize,
  rotation,
  customColor,
  onFontSizeChange,
  onRotationChange,
  onCustomColorChange,
}) => {
  const { t } = useTranslation();
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="pb-3 flex gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <FiMonitor className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-default-800">
            {t('sites.config.components.layout.display')}
          </h2>
          <p className="text-sm text-default-500">
            {t('sites.config.components.displaySection.subtitle', { defaultValue: 'Passe die Anzeige deines Dashboards an' })}
          </p>
        </div>
      </CardHeader>
      <CardBody className="pt-2">
        <div className="flex flex-col md:flex-row gap-8">
          <RadioGroup
            value={fontSize}
            onValueChange={(value) => onFontSizeChange(value as FontSize)}
            label={t('sites.config.components.displaySection.fontsize')}
            classNames={{
              label: "font-medium text-default-700"
            }}
          >
            <Radio value={FontSize.SMALL}>
              {t('sites.config.components.layout.fontsizesmall')}
            </Radio>
            <Radio value={FontSize.MEDIUM}>
              {t('sites.config.components.layout.fontsizemedium')}
            </Radio>
            <Radio value={FontSize.LARGE}>
              {t('sites.config.components.layout.fontsizelarge')}
            </Radio>
          </RadioGroup>
          <RadioGroup
            value={rotation?.toString()}
            onValueChange={(value) =>
              onRotationChange(Number(value) as Rotation)
            }
            label={t('sites.config.components.displaySection.rotation')}
            classNames={{
              label: "font-medium text-default-700"
            }}
          >
            <Radio value={Rotation.ROTATE_0.toString()}>0°</Radio>
            <Radio value={Rotation.ROTATE_90.toString()}>90°</Radio>
            <Radio value={Rotation.ROTATE_180.toString()}>180°</Radio>
            <Radio value={Rotation.ROTATE_270.toString()}>270°</Radio>
          </RadioGroup>
          <div className="flex flex-col gap-2">
            <h3 className="font-medium text-default-700 text-sm">
              {t('sites.config.components.displaySection.color')}
            </h3>
            <ColorPicker
              onColorChange={onCustomColorChange}
              value={customColor}
            />
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
