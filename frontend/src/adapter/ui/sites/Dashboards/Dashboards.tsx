import { ROUTE_CONFIG, ROUTE_DASHBOARD } from '@common/routes';
import EmptyState from '@components/EmptyState/EmptyState';
import ErrorState from '@components/ErrorState/ErrorState';
import { Button, Divider } from '@heroui/react';
import {
  useCreateDashboard,
  useDeleteDashboard,
  useGetDashboards,
  useUpdateDashboard,
} from '@hooks/index';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiGrid, FiPlus } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { Dashboard } from '../../../../domain/entities/Dashboard';
import DashboardDeleteModal from './components/DashboardDeleteModal';
import DashboardItem from './components/DashboardItem';
import DashboardListSkeletons from './components/DashboardListSkeletons';
import DashboardModal from './components/DashboardModal';

const Dashboards = () => {
  const navigate = useNavigate();
  const {
    dashboards,
    isLoading: isLoadingDashboards,
    error: dashboardsError,
    fetchDashboards,
  } = useGetDashboards();
  const { updateDashboard, isLoading: isUpdating } = useUpdateDashboard();
  const { deleteDashboard, isLoading: isDeleting } = useDeleteDashboard();
  const { createDashboard, isLoading: isCreating } = useCreateDashboard();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDashboard, setSelectedDashboard] = useState<Dashboard | null>(
    null,
  );
  const [newDashboardName, setNewDashboardName] = useState('');

  const { t } = useTranslation();

  const resetModals = useCallback(() => {
    setIsEditModalOpen(false);
    setIsNewModalOpen(false);
    setIsDeleteModalOpen(false);
  }, []);

  const resetForm = useCallback(() => {
    setNewDashboardName('');
    setSelectedDashboard(null);
  }, []);

  const resetAll = useCallback(() => {
    resetModals();
    resetForm();
  }, [resetModals, resetForm]);

  const handleEdit = (dashboard: Dashboard) => {
    resetAll();
    setSelectedDashboard(dashboard);
    setNewDashboardName(dashboard.name);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (dashboard: Dashboard) => {
    resetAll();
    setSelectedDashboard(dashboard);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDashboard) return;
    try {
      await deleteDashboard(selectedDashboard._id);
      await fetchDashboards();
      resetAll();
    } catch (error) {
      console.error('Error deleting dashboard:', error);
    }
  };

  const handleOpen = (id: string) => {
    navigate(`${ROUTE_DASHBOARD}${id}`);
  };

  const handleSettings = (id: string) => {
    navigate(`${ROUTE_CONFIG}${id}`);
  };

  const handleSaveEdit = async () => {
    if (selectedDashboard && newDashboardName.trim()) {
      try {
        await updateDashboard(selectedDashboard, { name: newDashboardName });
        await fetchDashboards();
        resetAll();
      } catch (error) {
        console.error('Error updating dashboard:', error);
      }
    }
  };

  const handleAddNew = async () => {
    if (newDashboardName.trim()) {
      try {
        const newDashboard = {
          name: newDashboardName,
        } as Dashboard;

        await createDashboard(newDashboard);
        await fetchDashboards();
        resetAll();
      } catch (error) {
        console.error('Error creating dashboard:', error);
      }
    }
  };

  const handleEditModalClose = () => {
    resetAll();
  };

  const handleNewModalClose = () => {
    resetAll();
  };

  const handleDeleteModalClose = () => {
    resetAll();
  };

  if (dashboardsError) {
    return (
      <ErrorState
        title={t('sites.dashboards.errorLoading')}
        onRetry={fetchDashboards}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-default-100">
      <div className="container mx-auto py-8 px-4">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg">
              <FiGrid className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t('sites.dashboards.title')}
              </h1>
              <p className="text-default-500 text-sm mt-1">
                {dashboards.length}{' '}
                {dashboards.length === 1
                  ? t('sites.dashboards.singularTitle')
                  : t('sites.dashboards.pluralTitle')}{' '}
                {t('sites.dashboards.available')}
              </p>
            </div>
          </div>
          <Button
            color="primary"
            variant="shadow"
            onPress={() => {
              resetAll();
              setIsNewModalOpen(true);
            }}
            isDisabled={
              isCreating || isUpdating || isDeleting || isLoadingDashboards
            }
            startContent={<FiPlus size={20} />}
            className="font-semibold"
            size="lg"
            isLoading={isCreating}
          >
            {t('sites.dashboards.createDashboard')}
          </Button>
        </div>

        <Divider className="my-6 opacity-50" />

        {/* EmptyState anzeigen, wenn keine Dashboards vorhanden sind */}
        {isLoadingDashboards && <DashboardListSkeletons />}
        {!isLoadingDashboards && dashboards.length === 0 ? (
          <EmptyState
            title={t('sites.dashboards.noDashboards')}
            description={t('sites.dashboards.noDashboardsDescription')}
            icon={FiGrid}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-4">
            {dashboards.map((dashboard) => (
              <DashboardItem
                key={dashboard._id}
                dashboard={dashboard}
                handleSettings={handleSettings}
                handleOpen={handleOpen}
                handleEdit={handleEdit}
                handleDelete={handleDeleteClick}
                isUpdating={isUpdating}
                isDeleting={isDeleting}
              />
            ))}
          </div>
        )}

        {/* Neue Dashboard Modal */}
        <DashboardModal
          isOpen={isNewModalOpen}
          onClose={handleNewModalClose}
          onSave={handleAddNew}
          title={t('sites.dashboards.createDashboard')}
          isLoading={isCreating}
          inputValue={newDashboardName}
          setInputValue={setNewDashboardName}
          inputLabel={t('sites.dashboards.dashboardName')}
          actionLabel={t('actions.create')}
        />

        {/* Dashboard Bearbeiten Modal */}
        <DashboardModal
          isOpen={isEditModalOpen}
          onClose={handleEditModalClose}
          onSave={handleSaveEdit}
          title={t('sites.dashboards.editDashboard')}
          isLoading={isUpdating}
          inputValue={newDashboardName}
          setInputValue={setNewDashboardName}
          inputLabel={t('sites.dashboards.dashboardNewName')}
          actionLabel={t('actions.save')}
        />

        {/* Dashboard löschen Modal */}
        <DashboardDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={handleDeleteModalClose}
          onDelete={handleConfirmDelete}
          isLoading={isDeleting}
          dashboardName={selectedDashboard?.name || ''}
        />
      </div>
    </div>
  );
};

export default Dashboards;
