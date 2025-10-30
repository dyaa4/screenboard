import { Button, Card, CardBody, Tooltip } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import {
  FiEdit2,
  FiMaximize2,
  FiMonitor,
  FiSettings,
  FiTrash2,
} from 'react-icons/fi';
import { Dashboard } from '../../../../../domain/entities/Dashboard';

interface DashboardItemProps {
  dashboard: Dashboard;
  handleSettings: (id: string) => void;
  handleOpen: (id: string) => void;
  handleEdit: (dashboard: Dashboard) => void;
  handleDelete: (dashboard: Dashboard) => void;
  isUpdating: boolean;
  isDeleting: boolean;
}

const DashboardItem = ({
  dashboard,
  handleSettings,
  handleOpen,
  handleEdit,
  handleDelete,
  isUpdating,
  isDeleting,
}: DashboardItemProps) => {
  const { t } = useTranslation();
  return (
    <Card
      key={dashboard._id}
      className="border-none shadow-lg hover:shadow-2xl transition-all duration-300 backdrop-blur-sm bg-gradient-to-br from-white/50 to-default-50 dark:from-default-100 dark:to-default-200"
    >
      <CardBody className="p-6">
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 rounded-lg bg-primary/10">
              <FiMonitor className="w-7 h-7 text-primary" />
            </div>
            <div className="flex gap-2">
              <Tooltip
                as="button"
                content={t(
                  'sites.dashboards.components.dashboardItem.settings',
                )}
              >
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  className="hover:bg-primary/10"
                  onPress={() => handleSettings(dashboard._id)}
                >
                  <FiSettings className="w-4 h-4" />
                </Button>
              </Tooltip>
              <Tooltip as="button" content={t('actions.open')}>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  className="hover:bg-primary/10"
                  onPress={() => handleOpen(dashboard._id)}
                >
                  <FiMaximize2 className="w-4 h-4" />
                </Button>
              </Tooltip>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-6 truncate bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {dashboard.name}
          </h2>

          <div className="flex justify-end gap-2 mt-auto pt-4 border-t border-default-200">
            <Tooltip as="button" content={t('actions.edit')} color="primary">
              <Button
                size="sm"
                variant="flat"
                color="primary"
                onPress={() => handleEdit(dashboard)}
                isIconOnly
                isLoading={isUpdating}
              >
                <FiEdit2 className="w-4 h-4" />
              </Button>
            </Tooltip>
            <Tooltip as="button" content={t('actions.delete')} color="danger">
              <Button
                size="sm"
                variant="flat"
                color="danger"
                onPress={() => handleDelete(dashboard)}
                isIconOnly
                isLoading={isDeleting}
              >
                <FiTrash2 className="w-4 h-4" />
              </Button>
            </Tooltip>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default DashboardItem;
