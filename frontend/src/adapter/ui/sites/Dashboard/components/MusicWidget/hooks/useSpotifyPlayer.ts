import { SpotifyRepository } from '@application/repositories/spotifyRepository';
import { Dashboard } from '@domain/entities/Dashboard';
import { useCallback, useEffect, useState, useRef } from 'react';

interface Track {
  name: string;
  album: {
    images: { url: string }[];
  };
  artists: { name: string }[];
}

const DEVICE_ID_KEY = 'device_id';

const useSpotifyPlayer = (
  isLoggedIn: boolean | null,
  spotifyRepository: SpotifyRepository,
  dashboard: Dashboard | null,
) => {
  const [player, setPlayer] = useState<any>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [noPlayerAvailable, setNoPlayerAvailable] = useState(false);
  const scriptLoaded = useRef(false);

  const handlePlayPause = useCallback(async () => {
    if (player) {
      try {
        isPlaying ? await player.pause() : await player.resume();
        setIsPlaying(!isPlaying);
      } catch (error) {
        console.error('Error toggling play/pause:', error);
      }
    }
  }, [player, isPlaying]);

  const handleNext = useCallback(async () => {
    if (player) {
      try {
        await player.nextTrack();
      } catch (error) {
        console.error('Error skipping to next track:', error);
      }
    }
  }, [player]);

  const handlePrevious = useCallback(async () => {
    if (player) {
      try {
        await player.previousTrack();
      } catch (error) {
        console.error('Error going to previous track:', error);
      }
    }
  }, [player]);

  const setActiveDevice = useCallback(
    async (deviceId: string, dashboardId: string) => {
      try {
        await spotifyRepository.saveActiveDevice(deviceId, dashboardId);
        console.log('Set active device:', deviceId);
      } catch (error) {
        console.error('Error setting active device:', error);
        await spotifyRepository.saveActiveDevice(deviceId, dashboardId);
      }
    },
    [],
  );

  // Separate useEffect für Script-Loading
  useEffect(() => {
    if (!isLoggedIn || scriptLoaded.current) return;

    const existingScript = document.getElementById('spotify-player-sdk');
    if (existingScript) {
      document.body.removeChild(existingScript);
    }

    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.id = 'spotify-player-sdk';
    script.async = true;
    document.body.appendChild(script);
    scriptLoaded.current = true;

    return () => {
      const script = document.getElementById('spotify-player-sdk');
      if (script) {
        document.body.removeChild(script);
      }
      scriptLoaded.current = false;
    };
  }, [isLoggedIn]);

  // Separate useEffect für Player-Initialisierung
  useEffect(() => {
    if (!isLoggedIn || !scriptLoaded.current || player || !dashboard?._id)
      return;

    const initializePlayer = async () => {
      try {
        const token = await spotifyRepository.getCurrentAccessToken(
          dashboard?._id,
        );
        if (!token) {
          console.error('Kein Access Token gefunden');
          return;
        }

        if (!window.Spotify) {
          console.log('Waiting for Spotify SDK...');
          return;
        }

        const newPlayer = new window.Spotify.Player({
          name: dashboard?.name + ' Dashboard Player',
          getOAuthToken: async (cb: (token: string) => void) => {
            let currentToken = await spotifyRepository.getCurrentAccessToken(
              dashboard?._id,
            );
            if (!currentToken) {
              currentToken = await spotifyRepository.getCurrentAccessToken(
                dashboard?._id,
              );
            }
            cb(currentToken || '');
          },
          volume: 0.5,
        });

        newPlayer.addListener(
          'ready',
          async ({ device_id }: { device_id: string }) => {
            console.log('Ready with Device ID', device_id);
            localStorage.setItem(DEVICE_ID_KEY, device_id);
            setIsConnected(true);
            await setActiveDevice(device_id, dashboard?._id);
          },
        );

        newPlayer.addListener(
          'not_ready',
          ({ device_id }: { device_id: string }) => {
            console.log('Device ID has gone offline', device_id);
            setIsConnected(false);
          },
        );

        newPlayer.addListener('player_state_changed', (state: any) => {
          if (!state) {
            setIsPlaying(false);
            setCurrentTrack(null);
            return;
          }
          const newTrack = state.track_window.current_track;
          setCurrentTrack(newTrack);
          setIsPlaying(!state.paused);
        });

        newPlayer.addListener(
          'initialization_error',
          ({ message }: { message: string }) => {
            console.error('Failed to initialize', message);
            setNoPlayerAvailable(true);
          },
        );

        newPlayer.addListener(
          'authentication_error',
          async ({ message }: { message: string }) => {
            console.error('Failed to authenticate', message);
          },
        );

        newPlayer.addListener(
          'account_error',
          ({ message }: { message: string }) => {
            console.error('Failed to validate Spotify account', message);
            setNoPlayerAvailable(true);
          },
        );

        const connected = await newPlayer.connect();
        if (connected) {
          console.log('Successfully connected player');
          setPlayer(newPlayer);
        }
      } catch (error) {
        console.error('Error initializing player:', error);
        setNoPlayerAvailable(true);
      }
    };

    window.onSpotifyWebPlaybackSDKReady = initializePlayer;

    // Falls das SDK bereits geladen ist
    if (window.Spotify) {
      initializePlayer();
    }

    return () => {
      if (player) {
        player.disconnect();
        setPlayer(null);
      }
    };
  }, [
    isLoggedIn,
    player,
    currentTrack,
    setActiveDevice,
    dashboard?._id,
  ]);

  return {
    player,
    currentTrack,
    isPlaying,
    isConnected,
    noPlayerAvailable,
    handlePlayPause,
    handleNext,
    handlePrevious,
  };
};

export default useSpotifyPlayer;
