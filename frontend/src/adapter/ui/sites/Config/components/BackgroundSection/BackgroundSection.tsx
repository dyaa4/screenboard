import {
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  cn,
  Image,
  Slider,
  Switch,
} from '@heroui/react';
import { backgroundImages } from '@sites/Dashboard/components/Background/Background';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface BackgroundSectionProps {
  selectedImages: string[];
  brightness: number;
  backgroundAnimationEnabled: boolean;
  backgroundBlurEnabled: boolean;
  onBackgroundImagesChange: (value: string[]) => void;
  onBrightnessChange: (value: number) => void;
  onBackgroundAnimationChange: (value: boolean) => void;
  onBackgroundBlurChange: (value: boolean) => void;
}

const BrightnessSlider: React.FC<{
  brightness: number;
  onBrightnessChange: (value: number) => void;
}> = ({ brightness, onBrightnessChange }) => {
  const { t } = useTranslation();
  return (
    <Slider
      className="max-w-[450px]"
      label={t('sites.config.components.backgroundSection.brightness')}
      value={brightness}
      step={10}
      minValue={10}
      maxValue={100}
      onChange={(value) =>
        onBrightnessChange(Array.isArray(value) ? value[0] : value)
      }
    />
  );
};

const ToggleSwitch: React.FC<{
  isSelected: boolean;
  onValueChange: (value: boolean) => void;
  title: string;
  description: string;
}> = ({ isSelected, onValueChange, title, description }) => (
  <div>
    <Switch
      isSelected={isSelected}
      onValueChange={onValueChange}
      classNames={{
        base: cn(
          'inline-flex flex-row-reverse max-w-[450px] bg-content2 hover:bg-content3 items-center',
          'justify-between cursor-pointer rounded-lg gap-2 p-4 border-2 border-transparent',
          'data-[selected=true]:border-primary',
        ),
        wrapper: 'p-0 h-4 overflow-visible',
        thumb: cn(
          'w-6 h-6 border-2 shadow-lg',
          'group-data-[hover=true]:border-primary',
          'group-data-[selected=true]:ml-6',
          'group-data-[pressed=true]:w-7',
          'group-data-selected:group-data-pressed:ml-4',
        ),
      }}
    >
      <div className="flex flex-col gap-1 grow">
        <p className="text-medium">{title}</p>
        <p className="text-tiny text-default-400">{description}</p>
      </div>
    </Switch>
  </div>
);

const ImageSelector: React.FC<{
  selectedImages: string[];
  onImageSelection: (img: string) => void;
}> = ({ selectedImages, onImageSelection }) => (
  <div className="flex flex-wrap items-center gap-2 max-w-full">
    {backgroundImages.map((img, index) => (
      <div
        className="flex flex-col items-center gap-2 cursor-pointer"
        key={index}
        onClick={() => onImageSelection(img)}
      >
        <Image
          shadow="md"
          src={img}
          width={100}
          height={100}
          className={
            selectedImages.includes(img) ? 'border-3 border-primary-500' : ''
          }
        />
        <Checkbox
          isSelected={selectedImages.includes(img)}
          onChange={() => onImageSelection(img)}
        />
      </div>
    ))}
  </div>
);

export const BackgroundSection: React.FC<BackgroundSectionProps> = ({
  selectedImages,
  brightness,
  backgroundAnimationEnabled,
  backgroundBlurEnabled,
  onBackgroundImagesChange,
  onBrightnessChange,
  onBackgroundAnimationChange,
  onBackgroundBlurChange,
}) => {
  const { t } = useTranslation();
  const handleImageSelection = (img: string) => {
    const isSelected = selectedImages.includes(img);
    const updatedImages = isSelected
      ? selectedImages.filter((i) => i !== img)
      : [...selectedImages, img];
    onBackgroundImagesChange(updatedImages);
  };

  return (
    <Card className="w-full shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="pb-3 flex gap-3">
        <div className="p-2 rounded-lg bg-secondary/10">
          <i className="fas fa-image text-secondary w-5 h-5 flex items-center justify-center" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-default-800">
            {t('sites.config.components.layout.background')}
          </h2>
          <p className="text-sm text-default-500">
            {t('sites.config.components.backgroundSection.subtitle', { defaultValue: 'Wähle Hintergrundbilder und Effekte' })}
          </p>
        </div>
      </CardHeader>
      <CardBody className="pt-2">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
          <div className="lg:col-span-1 flex flex-col gap-4">
            <BrightnessSlider
              brightness={brightness}
              onBrightnessChange={onBrightnessChange}
            />
            <ToggleSwitch
              isSelected={backgroundAnimationEnabled}
              onValueChange={onBackgroundAnimationChange}
              title={t(
                'sites.config.components.backgroundSection.backgroundanimation',
              )}
              description={t(
                'sites.config.components.backgroundSection.backgroundanimationDescription',
              )}
            />
            <ToggleSwitch
              isSelected={backgroundBlurEnabled}
              onValueChange={onBackgroundBlurChange}
              title={t(
                'sites.config.components.backgroundSection.backgroundblur',
              )}
              description={t(
                'sites.config.components.backgroundSection.backgroundblurDescription',
              )}
            />
          </div>
          <div className="lg:col-span-2">
            <ImageSelector
              selectedImages={selectedImages}
              onImageSelection={handleImageSelection}
            />
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
