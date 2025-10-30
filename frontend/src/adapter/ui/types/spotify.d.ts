// src/types/spotify.d.ts
declare global {
  interface Window {
    Spotify: any;
    onSpotifyWebPlaybackSDKReady: () => void;
  }

  namespace Spotify {
    interface PlayerOptions {
      name: string;
      getOAuthToken: (cb: (token: string) => void) => void;
      volume?: number;
    }

    interface Player {
      addListener(event: string, callback: (...args: any[]) => void): void;
      connect(): Promise<boolean>;
      play(data: any): Promise<void>;
      pause(): Promise<void>;
      resume(): Promise<void>;
      nextTrack(): Promise<void>;
      previousTrack(): Promise<void>;
      getCurrentState(): Promise<any>;
    }

    class Player {
      constructor(options: PlayerOptions);
    }
  }
}

export {};
