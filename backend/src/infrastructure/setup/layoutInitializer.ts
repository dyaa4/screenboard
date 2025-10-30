

import { Layout } from '../../domain/entities/Layout';
import { FontSize } from '../../domain/types/layout/FontSize';
import { Rotation } from '../../domain/types/layout/Rotation';

export async function initializeLayout(dashboardId: string): Promise<Omit<Layout, '_id'>> {


  const defaultLayouts: Omit<Layout, '_id'> =
  {
    dashboardId: dashboardId,
    pinProtectionEnabled: false,
    pinCode: undefined,
    backgroundBrightness: 80,
    fontSize: FontSize.MEDIUM,
    backgroundImages: [
      '/images/background1.jpg',
      '/images/background2.jpg',
      '/images/background3.jpg',
      '/images/background4.jpg',
      '/images/background5.jpg',
      '/images/background6.jpg'
    ],
    backgroundAnimationEnabled: true,
    backgroundBlurEnabled: false,
    rotation: Rotation.ROTATE_0,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  return defaultLayouts;
}