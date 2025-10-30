import { t } from '@adapter/ui/i18n/i18n';
import { SpotifyRepository } from '../../../../../../application/repositories/spotifyRepository';
import { SPOTIFY_REPOSITORY_NAME } from '@common/constants';
import NotConfiguredMessage from '@components/NotConfiguredMessage/NotConfiguredMessage';
import { useSpotifyAuth } from '@hooks/sites/configSite/useSpoitfyAuth';
import { Button, Image, Progress, Card, CardBody } from '@heroui/react';
import React from 'react';
import { BiPause, BiPlay, BiSkipNext, BiSkipPrevious } from 'react-icons/bi';
import { FaSpotify } from 'react-icons/fa';
import { container } from 'tsyringe';
import MenuSection from '../MenuSection/MenuSection';
import useSpotifyPlayer from './hooks/useSpotifyPlayer';
import useTrackProgress from './hooks/useTrackProgress';
import { Layout } from '../../../../../../domain/entities/Layout';
import { Dashboard } from '../../../../../../domain/entities/Dashboard';
import { getCustomColorCssClass } from '@adapter/ui/helpers/generalHelper';
import { useTheme } from 'next-themes';
import WidgetSkeleton from '../WidgetSkeleton/WidgetSkeleton';

export interface MusicWidgetProps {
  dashboard: Dashboard | null;
  layout: Layout | undefined;
}

const MusicWidget = (props: MusicWidgetProps) => {
  const { dashboard, layout } = props;
  const { theme } = useTheme();
  const { isLoggedIn = false, isLoading } = useSpotifyAuth(dashboard?._id);
  const spotifyRepository = container.resolve<SpotifyRepository>(
    SPOTIFY_REPOSITORY_NAME,
  );

  // Custom hooks
  const {
    player,
    currentTrack,
    isPlaying,
    handlePlayPause,
    handleNext,
    handlePrevious,
    noPlayerAvailable,
    isConnected,
  } = useSpotifyPlayer(
    isLoggedIn,
    spotifyRepository,
    dashboard,
  );
  const { progress, trackDuration } = useTrackProgress(isPlaying, player);

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 1000 / 60);
    const seconds = Math.floor((ms / 1000) % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <MenuSection
      title={t('sites.dashboard.components.musicWidget.title')}
      icon="fa-solid fa-music"
    >
      {!isLoggedIn ? (
        <NotConfiguredMessage
          message={t('sites.dashboard.components.musicWidget.configFaild')}
          icon="fa-solid fa-music"
          color="success"
          dashboardId={dashboard?._id}
          layout={layout}
        />
      ) : isLoading ? (
        <LoadingMessage layout={layout} />
      ) : (
        <PlayerContainer
          layout={layout}
          theme={theme}
        >
          {noPlayerAvailable ? (
            <NoPlayerMessage />
          ) : (
            <PlayerContent
              currentTrack={currentTrack}
              progress={progress}
              trackDuration={trackDuration}
              isConnected={isConnected}
              handlePlayPause={handlePlayPause}
              handleNext={handleNext}
              handlePrevious={handlePrevious}
              isPlaying={isPlaying}
              formatDuration={formatDuration}
            />
          )}
        </PlayerContainer>
      )}
    </MenuSection>
  );
};

export default MusicWidget;

// Components used in MusicWidget:
const LoadingMessage = ({ layout }: { layout?: Layout }) => <WidgetSkeleton layout={layout} variant="music" />;

const PlayerContainer = ({
  children,
  layout,
  theme,
}: {
  children: React.ReactNode;
  layout?: Layout;
  theme?: string;
}) => (
  <Card
    className="w-full h-52 shadow-xl hover:shadow-2xl transition-shadow duration-500"
    style={{
      ...getCustomColorCssClass(layout, theme),
    }}
  >
    <CardBody className="p-4 overflow-hidden">{children}</CardBody>
  </Card>
);

const NoPlayerMessage = () => (
  <div className="flex flex-col items-center justify-center h-full">
    <FaSpotify className="text-6xl mb-4 text-primary" />
    <h2 className="text-2xl font-bold mb-2">
      {t('sites.dashboard.components.musicWidget.noPlayerAvailable')}
    </h2>
    <p className="text-center text-default-600">
      {t('sites.dashboard.components.musicWidget.noPlayerAvailableDesc')}
    </p>
  </div>
);

interface PlayerContentProps {
  currentTrack: any;
  progress: number;
  trackDuration: number;
  isConnected: boolean;
  handlePlayPause: () => void;
  handleNext: () => void;
  handlePrevious: () => void;
  isPlaying: boolean;
  formatDuration: (ms: number) => string;
}

const PlayerContent = ({
  currentTrack,
  progress,
  trackDuration,
  isConnected,
  handlePlayPause,
  handleNext,
  handlePrevious,
  isPlaying,
  formatDuration,
}: PlayerContentProps) => (
  <>
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center">
        <FaSpotify className="text-primary text-3xl mr-2" />
        <span className="font-bold text-xl">
          {isConnected
            ? t('sites.dashboard.components.musicWidget.connectedToSpotify')
            : t('sites.dashboard.components.musicWidget.connecting')}
        </span>
      </div>
      {currentTrack && (
        <div className="text-sm text-default-600">
          {formatDuration(progress)} / {formatDuration(trackDuration)}
        </div>
      )}
    </div>
    {currentTrack ? (
      <>
        <div className="flex items-center mb-2">
          <div className="flex items-center gap-2 flex-1 mr-2">
            <Image
              src={currentTrack.album.images[0].url}
              alt={currentTrack.name}
              className="w-20 h-20 rounded-lg mr-4"
            />
            <div>
              <h3 className="font-bold text-lg">
                {currentTrack.name}
              </h3>
              <p className="text-default-500">
                {currentTrack.artists
                  .map((artist: any) => artist.name)
                  .join(', ')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-auto">
            <Button
              isIconOnly
              color="default"
              variant="flat"
              onPress={handlePrevious}
              className="w-12 h-12"
            >
              <BiSkipPrevious size={24} />
            </Button>
            <Button
              isIconOnly
              color="primary"
              variant="flat"
              onPress={handlePlayPause}
              className="w-16 h-16"
            >
              {isPlaying ? (
                <BiPause size={32} />
              ) : (
                <BiPlay size={32} />
              )}
            </Button>
            <Button
              isIconOnly
              color="default"
              variant="flat"
              onPress={handleNext}
              className="w-12 h-12"
            >
              <BiSkipNext size={24} />
            </Button>
          </div>
        </div>
        <Progress
          aria-label="Music progress"
          value={(progress / trackDuration) * 100}
          className="mb-2"
          color="success"
        />
      </>
    ) : (
      <NoTrackMessage />
    )}
  </>
);

const NoTrackMessage = () => (
  <div className="text-center">
    <p className="text-xl font-bold mb-2">Kein Titel gefunden</p>
    <div className="flex flex-col gap-1 items-center justify-center">
      <div className="flex items-center w-full max-w-md">
        <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center mr-2 shrink-0">
          1
        </span>
        <p className="text-left grow text-sm text-default-600">
          Stellen Sie sicher, dass Sie Spotify Premium haben
        </p>
      </div>
      <div className="flex items-center w-full max-w-md">
        <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center mr-2 shrink-0">
          2
        </span>
        <p className="text-left grow text-sm text-default-600">
          Öffnen Sie Spotify auf Ihrem Gerät
        </p>
      </div>
      <div className="flex items-center w-full max-w-md">
        <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center mr-2 shrink-0">
          3
        </span>
        <p className="text-left grow text-sm text-default-600">
          "Screen Board Player" als Wiedergabegerät auswählen
        </p>
      </div>
    </div>
  </div>
);
