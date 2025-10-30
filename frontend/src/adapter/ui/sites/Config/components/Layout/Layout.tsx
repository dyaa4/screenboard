import { useLayout } from '@hooks/sites/configSite/useLayout';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BackgroundSection } from '../BackgroundSection/BackgroundSection';
import { DisplaySection } from '../DisplaySection/DisplaySection';
import { SecuritySection } from '../SecuritySection/SecuritySection';
import LayoutSkeleton from './LayoutSkeleton';
import ErrorState from '@components/ErrorState/ErrorState';

export interface LayoutProps {
  dashboardId: string | undefined;
}

const Layout = ({ dashboardId }: LayoutProps) => {
  const { t } = useTranslation();
  const { layout, isLoading, error, handleChange } = useLayout(dashboardId);

  const content = useMemo(() => {
    if (error) {
      return (
        <ErrorState title={t('sites.config.components.layout.error.title')} />
      );
    }

    if (isLoading || !layout) {
      return <LayoutSkeleton />;
    }

    return (
      <div className="flex flex-col gap-4">
        <div className="flex-auto">
          <SecuritySection
            pinProtectionEnabled={layout.pinProtectionEnabled}
            pinCode={layout.pinCode!}
            onPinProtectionChange={(value) =>
              handleChange('pinProtectionEnabled', value)
            }
            onPinCodeChange={(value) => handleChange('pinCode', value)}
          />
        </div>
        <div className="flex-auto">
          <DisplaySection
            fontSize={layout.fontSize}
            onFontSizeChange={(value) => handleChange('fontSize', value)}
            rotation={layout.rotation}
            customColor={layout.customColor}
            onRotationChange={(value) => handleChange('rotation', value)}
            onCustomColorChange={(value) => handleChange('customColor', value)}
          />
        </div>

        <BackgroundSection
          brightness={layout.backgroundBrightness}
          onBrightnessChange={(value) =>
            handleChange('backgroundBrightness', value)
          }
          selectedImages={layout.backgroundImages}
          onBackgroundImagesChange={(value) =>
            handleChange('backgroundImages', value)
          }
          backgroundAnimationEnabled={layout.backgroundAnimationEnabled}
          onBackgroundAnimationChange={(value) =>
            handleChange('backgroundAnimationEnabled', value)
          }
          backgroundBlurEnabled={layout.backgroundBlurEnabled}
          onBackgroundBlurChange={(value) =>
            handleChange('backgroundBlurEnabled', value)
          }
        />
      </div>
    );
  }, [layout, isLoading, error, handleChange]);

  return <div>{content}</div>;
};

export default Layout;
