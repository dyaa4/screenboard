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
  setUserStatusTo: () => { },
});

const getRotationStyle = (rotation: number) => {
  const baseStyle = {
    transformOrigin: 'center center',
    width: '100%',
    height: '100%',
    overflow: 'auto' as 'auto', // Ermöglicht Scrollen in alle Richtungen
    position: 'relative' as 'relative',
  };

  switch (rotation) {
    case 90:
      return {
        ...baseStyle,
        transform: 'rotate(90deg)',
        width: '100vh', // Nutzt volle Viewport-Höhe als Breite
        height: '100vw', // Nutzt volle Viewport-Breite als Höhe  
        position: 'fixed' as 'fixed',
        top: '50%',
        left: '50%',
        marginTop: '-50vw', // Zentriert vertikal
        marginLeft: '-50vh', // Zentriert horizontal
        maxWidth: '100vh',
        maxHeight: '100vw',
        overflowX: 'auto' as 'auto',
        overflowY: 'auto' as 'auto',
        boxSizing: 'border-box' as 'border-box',
      };

    case 180:
      return {
        ...baseStyle,
        transform: 'rotate(180deg)',
      };

    case 270:
      return {
        ...baseStyle,
        transform: 'rotate(270deg)',
        width: '100vh', // Nutzt volle Viewport-Höhe als Breite
        height: '100vw', // Nutzt volle Viewport-Breite als Höhe
        position: 'fixed' as 'fixed',
        top: '50%',
        left: '50%',
        marginTop: '-50vw', // Zentriert vertikal
        marginLeft: '-50vh', // Zentriert horizontal  
        maxWidth: '100vh',
        maxHeight: '100vw',
        overflowX: 'auto' as 'auto',
        overflowY: 'auto' as 'auto',
        boxSizing: 'border-box' as 'border-box',
      };

    case 0:
    default:
      return baseStyle;
  }
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

  const { rotationStyle, contentStyle, appStyle } = useMemo(() => {
    if (!layout) return { rotationStyle: {}, contentStyle: {}, appStyle: {} };

    const getContentStyle = (rotation: number) => {
      const baseContentStyle = {
        width: '100%',
        height: '100%',
        overflow: 'visible' as 'visible',
        position: 'relative' as 'relative',
      };

      // Bei 90° und 270° Rotation benötigen wir spezielle Content-Styles
      if (rotation === 90 || rotation === 270) {
        return {
          ...baseContentStyle,
          minWidth: '100%',
          minHeight: '100%',
          // Inhalte können über die rotierten Dimensionen hinausgehen
          width: 'auto',
          height: 'auto',
        };
      }

      return baseContentStyle;
    };

    const getAppStyle = (rotation: number) => {
      const baseAppStyle = {
        width: '100%',
        height: '100%',
        minHeight: '100vh',
      };

      // Bei Rotation nutze die vollen rotated Dimensionen
      if (rotation === 90 || rotation === 270) {
        return {
          ...baseAppStyle,
          width: '100%', // Nutzt die volle rotierte Breite (100vh)
          height: '100%', // Nutzt die volle rotierte Höhe (100vw)
          minWidth: '100%',
          minHeight: '100%',
          maxWidth: 'none !important' as any, // Entfernt CSS-Beschränkungen
          overflow: 'visible',
        };
      }

      return baseAppStyle;
    };

    return {
      rotationStyle: getRotationStyle(layout.rotation),
      contentStyle: getContentStyle(layout.rotation),
      appStyle: getAppStyle(layout.rotation),
    };
  }, [layout, currentLang]);

  if (isLoading || isLoadingDashboard) {
    return <Spinner className="absolute top-0 bottom-0 right-0 left-0" />;
  }

  return (
    <AppContext.Provider value={{ userStatus, setUserStatusTo }}>
      <div id="rotation-wrapper" style={rotationStyle}>
        <div id="content-wrapper" style={contentStyle}>
          <div
            id="app"
            className={`${getStatusClass()} ${layout?.rotation === 90 || layout?.rotation === 270 ? 'rotated-layout' : ''}`}
            style={appStyle}
          >
            <MessageDialog dashboardId={dashboardId} />

            <Pin layout={layout} />

            <Widgets layout={layout} dashboard={dashboard} />
            <Background layout={layout} />12345
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
