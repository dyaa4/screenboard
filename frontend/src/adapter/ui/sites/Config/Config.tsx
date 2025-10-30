import { replaceDashboardId } from '@common/helpers/objectHelper';
import {
  ROUTE_DASHBOARD,
  ROUTE_DASHBOARD_ID,
  ROUTE_DASHBOARDS,
} from '@common/routes';
import {
  BreadcrumbItem,
  Breadcrumbs,
  Button,
  Divider,
  Tab,
  Tabs,
  Tooltip,
} from '@heroui/react';
import { useCommunicationRepository } from '@hooks/basic/useSocketCommunicationRepository';
import { useGetDashboard } from '@hooks/index';
import useTabSync from '@hooks/sites/configSite/useTabSync';
import { useTranslation } from 'react-i18next';
import { FiArrowRight, FiRefreshCcw, FiSettings } from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import WidgetList from './components/WidgetList/WidgetList';

const tabList = ['layout', 'widgets'];

const Config = () => {
  const { dashboardId } = useParams<{ dashboardId: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { selected, handleSelectionChange } = useTabSync(tabList, 'layout');
  const { dashboard, isLoading } = useGetDashboard(dashboardId);
  const { communicationRepository, initialized } =
    useCommunicationRepository(dashboardId);

  const handleRefresh = async () => {
    if (!initialized || !communicationRepository) return;
    communicationRepository.refreshDashboard();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-default-100">
      <div className="container mx-auto py-8 px-4">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs>
            <BreadcrumbItem href={ROUTE_DASHBOARDS}>
              {t('sites.dashboards.title')}
            </BreadcrumbItem>
            <BreadcrumbItem color="secondary" isCurrent>
              {dashboard?.name} {t('sites.config.title')}
            </BreadcrumbItem>
          </Breadcrumbs>
        </div>

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg">
              <FiSettings className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t('sites.config.title')}
              </h1>
              <p className="text-default-500 text-sm mt-1">
                {t('sites.config.description')}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Tooltip color="primary" content={t('actions.refresh')} showArrow>
              <Button
                isIconOnly
                variant="shadow"
                color="primary"
                onPress={handleRefresh}
                size="lg"
              >
                <FiRefreshCcw size={20} />
              </Button>
            </Tooltip>
            <Tooltip color="secondary" content={t('actions.back')} showArrow>
              <Button
                isIconOnly
                onPress={() =>
                  navigate(
                    replaceDashboardId(
                      ROUTE_DASHBOARD + ROUTE_DASHBOARD_ID,
                      dashboardId,
                    ),
                  )
                }
                variant="shadow"
                color="secondary"
                isLoading={isLoading}
                size="lg"
              >
                <FiArrowRight size={20} />
              </Button>
            </Tooltip>
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs
          aria-label="Options"
          color="primary"
          variant="underlined"
          selectedKey={selected}
          onSelectionChange={handleSelectionChange}
          className="w-full"
          classNames={{
            tabList:
              'gap-6 w-full relative rounded-none p-0 border-b border-divider',
            cursor: 'w-full bg-primary',
            tab: 'max-w-fit px-0 h-12',
            tabContent:
              'group-data-[selected=true]:text-primary font-semibold text-lg',
          }}
        >
          <Tab key="layout" title={t('sites.config.tabLayout')}>
            <div className="pt-6">
              <Layout dashboardId={dashboardId} />
            </div>
          </Tab>
          <Tab key="widgets" title={t('sites.config.tabWidgets')}>
            <div className="pt-6">
              <WidgetList dashboardId={dashboardId} />
            </div>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
};

export default Config;
