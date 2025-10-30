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

export interface IAppContext {
  userStatus: UserStatus;
  setUserStatusTo: (status: UserStatus) => void;
}

export const AppContext = React.createContext<IAppContext>({
  userStatus: UserStatus.LoggedOut,
  setUserStatusTo: () => {},
});

const getRotationStyle = (rotation: number) => {
  let transform = 'rotate(0deg)';
  let width = '100%';
  let height = '100%';
  let top = '0';
  let left = '0';
  let marginTop = '0';
  let marginLeft = '0';

  switch (rotation) {
    case 90:
      transform = 'rotate(90deg)';
      width = '100vh';
      height = '100vw';
      top = '50%';
      left = '50%';
      marginTop = '-50vw';
      marginLeft = '-50vh';
      break;
    case 180:
      transform = 'rotate(180deg)';
      break;
    case 270:
      transform = 'rotate(270deg)';
      width = '100vh';
      height = '100vw';
      top = '50%';
      left = '50%';
      marginTop = '-50vw';
      marginLeft = '-50vh';
      break;
    case 0:
    default:
      transform = '';
      break;
  }

  return {
    transform,
    width,
    height,
    transformOrigin: 'center center',
    position: 'absolute' as 'absolute',
    top,
    left,
    marginTop,
    marginLeft,
  };
};

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

  const { rotationStyle, contentStyle } = useMemo(() => {
    if (!layout) return { rotationStyle: {}, contentStyle: {} };

    return {
      rotationStyle: getRotationStyle(layout.rotation),
    };
  }, [layout, currentLang]);

  if (isLoading || isLoadingDashboard) {
    return <Spinner className="absolute top-0 bottom-0 right-0 left-0" />;
  }

  return (
    <AppContext.Provider value={{ userStatus, setUserStatusTo }}>
      <div id="rotation-wrapper" style={rotationStyle}>
        <div id="content-wrapper" style={contentStyle}>
          <div id="app" className={getStatusClass()}>
            <MessageDialog dashboardId={dashboardId} />

            <Pin layout={layout} />

            <Widgets layout={layout} dashboard={dashboard} />
            <Background layout={layout} />
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
