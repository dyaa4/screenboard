import { BaseEntity } from '@domain/entities/BaseEntity';
import { FontSize } from '@domain/types/layout/FontSize';
import { Rotation } from '@domain/types/layout/Rotation';

export class Layout extends BaseEntity {
  userId: string;
  pinProtectionEnabled: boolean;
  pinCode?: string;
  fontSize: FontSize;
  rotation: Rotation;
  backgroundBrightness: number;
  backgroundImages: string[];
  backgroundAnimationEnabled: boolean;
  backgroundBlurEnabled: boolean;
  customColor?: string;

  constructor(
    userId: string,
    pinProtectionEnabled: boolean,
    fontSize: FontSize,
    rotation: Rotation,
    backgroundBrightness: number,
    backgroundImages: string[] = [],
    backgroundAnimationEnabled: boolean = false,
    backgroundBlurEnabled: boolean = false,
    pinCode?: string,
    customColor?: string,
  ) {
    super();
    this.userId = userId;
    this.pinProtectionEnabled = pinProtectionEnabled;
    this.pinCode = pinCode;
    this.fontSize = fontSize;
    this.rotation = rotation;
    this.backgroundBrightness = backgroundBrightness;
    this.backgroundImages = backgroundImages;
    this.backgroundAnimationEnabled = backgroundAnimationEnabled;
    this.backgroundBlurEnabled = backgroundBlurEnabled;
    this.customColor = customColor;
  }
}
