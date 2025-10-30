import React from 'react';
import { Button, Card, CardBody } from '@heroui/react';
import { useNavigate } from 'react-router-dom';
import { ROUTE_CONFIG_WIDGETS } from '@common/routes';
import { useTranslation } from 'react-i18next';
import { replaceDashboardId } from '@common/helpers/objectHelper';
import { getCustomColorCssClass } from '@adapter/ui/helpers/generalHelper';
import { Layout } from '../../../../domain/entities/Layout';
import { useTheme } from 'next-themes';

interface NotConfiguredMessageProps {
  message: string;
  icon: string;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  dashboardId: string | undefined;
  layout: Layout | undefined;
}

const NotConfiguredMessage: React.FC<NotConfiguredMessageProps> = ({
  message,
  icon,
  color,
  dashboardId,
  layout,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { theme } = useTheme();

  return (
    <div className="w-full">
      <Card
        style={{
          ...getCustomColorCssClass(layout, theme),
        }}
        className="bg-white/80 dark:bg-content1/80 shadow-none"
      >
        <CardBody className="flex flex-col items-center py-10 px-4">
          <div
            className={`w-10 h-10 rounded-full bg-${color}-100 dark:bg-${color}-800 flex items-center justify-center mb-6`}
          >
            <i
              className={`${icon} text-xl text-${color}-600 dark:text-${color}-300`}
            ></i>
          </div>
          <p className="text-lg text-gray-700 dark:text-gray-300 text-center mb-6">
            {message}
          </p>
          <Button
            onPress={() =>
              navigate(replaceDashboardId(ROUTE_CONFIG_WIDGETS, dashboardId))
            }
            color={color}
            variant="shadow"
            endContent={<i className="fa-solid fa-gear ml-2"></i>}
          >
            {t('components.notConfiguredMessage.configureNow')}
          </Button>
        </CardBody>
      </Card>
    </div>
  );
};

export default NotConfiguredMessage;
