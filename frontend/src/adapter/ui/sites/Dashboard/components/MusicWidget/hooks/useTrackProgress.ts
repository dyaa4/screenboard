import { useEffect, useState } from 'react';

const useTrackProgress = (isPlaying: boolean, player: any) => {
  const [progress, setProgress] = useState(0);
  const [trackDuration, setTrackDuration] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying && player) {
      interval = setInterval(() => {
        player.getCurrentState().then((state: any) => {
          if (state) {
            setProgress(state.position);
            setTrackDuration(state.duration);
          }
        });
      }, 1000);
    } else if (!isPlaying && interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, player]);

  return {
    progress,
    trackDuration,
  };
};

export default useTrackProgress;
