import '@fortawesome/fontawesome-free/css/all.css';
import { UserStatus } from '@sites/Dashboard/components/helper';
import * as React from 'react';
import { useMemo, useState } from 'react';
import './App.scss';

import i18n from '@adapter/ui/i18n/i18n';
import { COMMUNICATION_REPOSITORY_NAME } from '@common/constants';
import { replaceDashboardId } from '@common/helpers/objectHelper';
import { ROUTE_CONFIG_LAYOUT } from '@common/routes';
import { Button, Spinner } from '@heroui/react';
import { useGetLayout } from '@hooks/crud/layout/useGetLayout';
import { useGetDashboard } from '@hooks/index';
import { FiSettings } from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import { container } from 'tsyringe';
import { CommunicationRepository } from '../../../../application/repositories/communicationRepository';
import { Background } from './components/Background/Background';
import LoadingSpinner from './components/LoadingSpinner/LoadingSpinner';
import MessageDialog from './components/MessageDialog/MessageDialog';
import Pin from './components/PinDigit/Pin';
import { UserStatusButton } from './components/UserStatusButton/UserStatusButton';
import { Widgets } from './components/Widgets/Widgets';
import { useRotationStyles } from './hooks/useRotationStyles';

export interface IAppContext {
  userStatus: UserStatus;
  setUserStatusTo: (status: UserStatus) => void;
}

export const AppContext = React.createContext<IAppContext>({
  userStatus: UserStatus.LoggedOut,
  setUserStatusTo: () => { },
});

const Dashboard: React.FC = () => {
  const { dashboardId } = useParams<{ dashboardId: string | undefined }>();
  const { layout, isLoading } = useGetLayout(dashboardId);
  const { dashboard, isLoading: isLoadingDashboard } =
    useGetDashboard(dashboardId);
  const currentLang = i18n.language;
  const [userStatus, setUserStatusTo] = useState<UserStatus>(
    UserStatus.LoggedIn,
  );
  const navigate = useNavigate();

  const getStatusClass = (): string => {
    return userStatus.replace(/\s+/g, '-').toLowerCase();
  };

  React.useEffect(() => {
    const setDashboardIdAsync = async () => {
      const CommunicationAdapter =
        await container.resolve<CommunicationRepository>(
          COMMUNICATION_REPOSITORY_NAME,
        );

      CommunicationAdapter.receiveRefresh(() => {
        window.location.reload();
      });
    };

    setDashboardIdAsync();
  }, [dashboardId]);

  const { rotationStyle, contentStyle, appStyle } = useRotationStyles(layout);

  if (isLoading || isLoadingDashboard) {
    return <Spinner className="absolute top-0 bottom-0 right-0 left-0" />;
  }

  return (
    <AppContext.Provider value={{ userStatus, setUserStatusTo }}>
      <div id="rotation-wrapper" style={rotationStyle}>
        <Background layout={layout} />
        <div id="content-wrapper" style={contentStyle}>
          <div
            id="app"
            className={`${getStatusClass()} ${layout?.rotation === 90 || layout?.rotation === 270 ? 'rotated-layout' : ''}`}
            style={appStyle}
          >
            <MessageDialog dashboardId={dashboardId} />

            <Pin layout={layout} />

            <Widgets layout={layout} dashboard={dashboard} />

            <div id="sign-in-button-wrapper">
              <UserStatusButton
                icon="fa-solid fa-arrow-right-to-bracket"
                id="sign-in-button"
                userStatus={UserStatus.LoggingIn}
              />
            </div>
            <LoadingSpinner />
          </div>
          <div className="absolute top-0 right-0 bottom-0 left-0" id="overlay">
            <Button
              className="fixed bottom-0 right-0 z-50"
              variant="light"
              id="close-overlay"
              isIconOnly
              onPress={() =>
                navigate(replaceDashboardId(ROUTE_CONFIG_LAYOUT, dashboardId))
              }
            >
              <FiSettings size={16} />
            </Button>
          </div>
        </div>
      </div>
    </AppContext.Provider>
  );
};

export default Dashboard;
