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
    className="w-full h-48 sm:h-52 shadow-xl hover:shadow-2xl transition-shadow duration-500"
    style={{
      ...getCustomColorCssClass(layout, theme),
    }}
  >
    <CardBody className="p-3 sm:p-4 overflow-hidden">{children}</CardBody>
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
    {/* Header - Responsive Spotify Status */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-2">
      <div className="flex items-center">
        <FaSpotify className="text-primary text-2xl sm:text-3xl mr-2" />
        <span className="font-bold text-lg sm:text-xl truncate">
          {isConnected
            ? t('sites.dashboard.components.musicWidget.connectedToSpotify')
            : t('sites.dashboard.components.musicWidget.connecting')}
        </span>
      </div>
      {currentTrack && (
        <div className="text-sm text-default-600 shrink-0">
          {formatDuration(progress)} / {formatDuration(trackDuration)}
        </div>
      )}
    </div>

    {currentTrack ? (
      <>
        {/* Main Content - Responsive Layout */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center mb-3 gap-3">
          {/* Album Art & Track Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0 w-full sm:w-auto">
            <Image
              src={currentTrack.album.images[0].url}
              alt={currentTrack.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-base sm:text-lg truncate">
                {currentTrack.name}
              </h3>
              <p className="text-default-500 text-sm truncate">
                {currentTrack.artists
                  .map((artist: any) => artist.name)
                  .join(', ')}
              </p>
            </div>
          </div>

          {/* Controls - Responsive */}
          <div className="flex items-center gap-2 justify-center w-full sm:w-auto sm:shrink-0">
            <Button
              isIconOnly
              color="default"
              variant="flat"
              onPress={handlePrevious}
              className="w-10 h-10 sm:w-12 sm:h-12"
              size="sm"
            >
              <BiSkipPrevious size={20} />
            </Button>
            <Button
              isIconOnly
              color="primary"
              variant="flat"
              onPress={handlePlayPause}
              className="w-12 h-12 sm:w-16 sm:h-16"
            >
              {isPlaying ? (
                <BiPause size={24} />
              ) : (
                <BiPlay size={24} />
              )}
            </Button>
            <Button
              isIconOnly
              color="default"
              variant="flat"
              onPress={handleNext}
              className="w-10 h-10 sm:w-12 sm:h-12"
              size="sm"
            >
              <BiSkipNext size={20} />
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <Progress
          aria-label="Music progress"
          value={(progress / trackDuration) * 100}
          className="mb-2"
          color="success"
          size="sm"
        />
      </>
    ) : (
      <NoTrackMessage />
    )}
  </>
);

const NoTrackMessage = () => (
  <div className="text-center px-2">
    <p className="text-lg sm:text-xl font-bold mb-2">Kein Titel gefunden</p>
    <div className="flex flex-col gap-1 items-center justify-center">
      <div className="flex items-start w-full max-w-md">
        <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center mr-2 shrink-0 mt-0.5">
          1
        </span>
        <p className="text-left grow text-xs sm:text-sm text-default-600 leading-relaxed">
          Stellen Sie sicher, dass Sie Spotify Premium haben
        </p>
      </div>
      <div className="flex items-start w-full max-w-md">
        <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center mr-2 shrink-0 mt-0.5">
          2
        </span>
        <p className="text-left grow text-xs sm:text-sm text-default-600 leading-relaxed">
          Öffnen Sie Spotify auf Ihrem Gerät
        </p>
      </div>
      <div className="flex items-start w-full max-w-md">
        <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center mr-2 shrink-0 mt-0.5">
          3
        </span>
        <p className="text-left grow text-xs sm:text-sm text-default-600 leading-relaxed">
          "Screen Board Player" als Wiedergabegerät auswählen
        </p>
      </div>
    </div>
  </div>
);
