import { useEffect, useState, useCallback, useContext, useRef } from 'react';
import { AppContext } from '../../Dashboard';
import { UserStatus } from '../helper';
import { Layout } from '@domain/entities/Layout';

export const backgroundImages = [
  '/images/background1.jpg',
  '/images/background2.jpg',
  '/images/background3.jpg',
  '/images/background4.jpg',
  '/images/background5.jpg',
  '/images/background6.jpg',
  '/images/background7.jpg',
  '/images/background8.jpg',
  '/images/background9.jpg',
  '/images/background10.jpg',
  '/images/background11.jpg',
  '/images/background12.jpg',
  '/images/background13.jpg',
  '/images/background14.jpg',
  '/images/background15.jpg',
  '/images/background16.jpg',
  '/images/background17.jpg',
  '/images/background18.jpg',
  '/images/background19.jpg',
  '/images/background20.jpg',
];
export interface BackgroundProps {
  layout: Layout | undefined;
}

export const Background = ({ layout }: BackgroundProps): JSX.Element => {
  const { userStatus, setUserStatusTo } = useContext(AppContext);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [nextImageIndex, setNextImageIndex] = useState<number>(1);
  const imageCache = useRef<HTMLImageElement[]>([]);

  const brightness = layout?.backgroundBrightness ?? 100;
  const blur = layout?.backgroundBlurEnabled ?? false;
  const animation = layout?.backgroundAnimationEnabled ?? false;

  // Bilder vorladen
  useEffect(() => {
    if (!layout?.backgroundImages.length) return;

    layout.backgroundImages.forEach((src, index) => {
      const img = new Image();
      img.src = src;
      imageCache.current[index] = img;
    });
  }, [layout?.backgroundImages]);

  const changeBackground = useCallback(() => {
    if (!layout?.backgroundImages.length) return;
    setCurrentImageIndex(nextImageIndex);
    setNextImageIndex(
      (prevIndex) => (prevIndex + 1) % layout.backgroundImages.length,
    );
  }, [layout?.backgroundImages, nextImageIndex]);

  useEffect(() => {
    const interval = setInterval(changeBackground, 10000);
    return () => clearInterval(interval);
  }, [changeBackground]);

  const handleOnClick = useCallback((): void => {
    if (userStatus === UserStatus.LoggedOut) {
      setUserStatusTo(UserStatus.LoggingIn);
    }
  }, [userStatus, setUserStatusTo]);

  return (
    <div
      id="app-background"
      onClick={handleOnClick}
      className="fixed inset-0 overflow-hidden"
      style={{
        zIndex: 1,
        filter: `brightness(${brightness / 100})`,
      }}
    >
      <div
        className={`absolute inset-0 bg-cover bg-center ${blur ? 'blur-sm' : ''}`}
        style={{
          backgroundImage: `url(${layout?.backgroundImages[currentImageIndex]})`,
          transition: animation ? 'background-image 1s ease-in-out' : 'none',
        }}
      />
      {animation && (
        <div
          className={`absolute inset-0 bg-cover bg-center ${blur ? 'blur-sm' : ''}`}
          style={{
            backgroundImage: `url(${layout?.backgroundImages[nextImageIndex]})`,
            opacity: 0,
            transition: 'opacity 1s ease-in-out',
          }}
        />
      )}
    </div>
  );
};
