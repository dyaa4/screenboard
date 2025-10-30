import { Button } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-screen">
      {/* Großer 404-Text */}
      <h1 className="text-9xl font-black text-secondary-200 drop-shadow-lg">
        404
      </h1>
      {/* Beschreibung */}
      <p className="text-2xl font-semibold text-gray-600 text-center mb-8">
        {t('sites.notfound.infoTitle')}
      </p>
      <p className="text-lg text-gray-700 text-center max-w-md mb-12">
        {t('sites.notfound.infoText')}
      </p>
      {/* Zur Startseite Button */}
      <Button color="secondary" onPress={handleGoHome}>
        {t('sites.notfound.returnToHomeText')}
      </Button>
    </div>
  );
}
